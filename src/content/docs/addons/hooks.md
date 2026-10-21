---
title: Hooks
description: "The Hook model that every HBM and Golem Core callback uses, the Environment hooks HBM consults, HbmEvents, and the Golem Core hooks for vanilla behaviour."
sidebar:
  order: 8
---

Every callback HBM and Golem Core offer is a `dev.golem.core.hook.Hook<T>`: one listener type `T`, any number of
listeners, called in a defined order. Use a hook for a small change in behaviour; use
[substitution](../substitution/) to rewrite a block.

## The Hook model

```java
public final class Hook<T> implements Iterable<T> {
    public static final String DEFAULT_PHASE = "default";

    public static <T> Hook<T> of(Function<List<T>, T> combiner);
    public static <T> Hook<T> withPhases(Function<List<T>, T> combiner, String... phases);
    public static <T> Hook<T> notifying();

    public void register(T listener);                              // default phase
    public synchronized void register(String phase, T listener);
    public synchronized void addPhaseOrdering(String first, String second);
    public T invoker();
    public List<T> listeners();
    public boolean isEmpty();
}
```

- **Order.** Listeners run phase by phase, and within a phase in registration order. A new phase you register into
  runs after the existing phases until you order it. `addPhaseOrdering(first, second)` makes every listener of `first`
  run before every listener of `second`. Phases are namespaced strings (`"ntmspace:atmosphere"`); a cycle is rejected.
- **Combining.** The hook's combiner decides what several answers mean: first non-`PASS` wins, first veto wins, or all
  are notified. A `notifying()` hook has no invoker; its owner loops over the listeners.
- **Between mods.** Registration order between two mods is defined only for listeners registered in `declare()`
  (dependencies first, on every loader). Fabric runs `client` entrypoints in no defined order, so a client listener that
  must follow another mod's goes in a phase ordered after the default one.

`Verdict` is the answer of "may this happen?" hooks:

```java
public enum Verdict {
    ALLOW, DENY, PASS;
    public static <T> Verdict first(List<T> listeners, Function<T, Verdict> ask);   // first non-PASS, or PASS
    public boolean orElse(boolean fallback);                                         // PASS -> fallback
}
```

Running before another mod's listeners:

```java title="ntmprobe: ProbeHooks.java (shortened)"
public static final String FIRST = "ntmprobe:first";

hook.addPhaseOrdering(FIRST, Hook.DEFAULT_PHASE);
hook.register(FIRST, listener);
```

Declaring your own hook:

```java
public static final Hook<CanBurn> CAN_BURN = Hook.of(listeners -> (level, pos) -> {
    for (CanBurn listener : listeners) if (!listener.canBurn(level, pos)) return false;
    return true;
});

if (!CAN_BURN.invoker().canBurn(level, pos)) return;
```

## Environment

`com.hbm.api.environment.Environment` is what HBM's machines, blocks, items and entities ask about their surroundings.
Every default is the 1.7 rule, so plain HBM behaves as 1.7 on Earth. NTM: Space answers for its planets, orbits and
sealed rooms.

```java title="com/ntmspace/atmosphere/AtmosphereHooks.java (shortened)"
Environment.BREATHING.register((level, pos, amount) -> breatheAir(level, pos, amount) ? Verdict.ALLOW : Verdict.DENY);
Environment.PRESSURE.register(AtmosphereHandler::pressure);
Environment.GRAVITY.register(AtmosphereHooks::gravity);
Environment.SURFACE.register(level -> CelestialBodies.of(level) != null ? Verdict.ALLOW : Verdict.PASS);
```

| Hook | Listener | Combining | Default | Query |
|---|---|---|---|---|
| `BREATHING` | `Verdict breathe(Level level, BlockPos pos, int amount)` | first non-`PASS` | a fire breathes | `breatheAir(level, pos, amount)`; `breatheAir(level, pos, amount, unanswered)` |
| `PRESSURE` | `double pressure(Level level, BlockPos pos)` (NaN passes) | first non-NaN | `EARTH_PRESSURE` = 1.0 atm | `pressure(level, pos)`; `isVacuum(level, pos)` (in orbit, or below `VACUUM_PRESSURE` = 0.01) |
| `SURFACE` | `Verdict surface(Level level)` | first non-`PASS` | only the overworld | `isSurface(level)` |
| `ORBIT` | `Verdict orbit(Level level)` | first non-`PASS` | not in orbit | `inOrbit(level)` |
| `SUNLIGHT` | `double sunlight(Level level, BlockPos pos)` (NaN passes) | first non-NaN | 1.0 | `sunlight(level, pos)` |
| `GROUNDWATER` | `@Nullable FluidType groundwater(Level level, BlockPos pos)` (null passes) | first non-null | `Fluids.WATER`; `Fluids.NONE` in orbit | `groundwater(level, pos)`; `declaredGroundwater(level, pos)` |
| `GRAVITY` | `double gravity(Entity entity)`, a multiple of Earth's (NaN passes) | first non-NaN | 1.0 | `gravity(entity)` |
| `GAS_RELEASE` | `void release(Level level, BlockPos pos, FluidType type, double mB)` | notifying | none | `releaseGas(level, pos, type, mB)` (gases only, server only) |
| `COMPRESSION` | `Verdict compress(Level level, BlockPos pos, int amount)` | first non-`PASS` | always air to compress | `compressAir(level, pos, amount)` |
| `GROWTH` | `Verdict grow(Level level, BlockPos pos)` | first non-`PASS` | the grass grows | `canGrow(level, pos)` |
| `LIVING_TICK` | `Consumer<LivingEntity>` | notifying | none | `livingTick(entity)`, once per living tick, server side, after HBM's radiation |
| `AMBIENT_RADIATION` | `double floor(Level level, BlockPos pos, LivingEntity entity)` | highest answer | 0 | `ambientRadiationFloor(level, pos, entity)` |
| `IMPACT` | `void impact(ServerLevel level, BlockPos pos)` | notifying | none | `impact(level, pos)`, when Tom hits |
| `LIGHT_ON` | `void lightOn(ServerLevel level, BlockPos pos, BlockState state)` | notifying | none | `lightOn(level, pos, state)`, when a spotlight is lit |
| `NUCLEAR_BLAST` | `void blast(ServerLevel level, double x, double z, float radius)` | notifying | none | `nuclearBlast(level, x, z, radius)`: an MK5 blast's first tick, every mini nuke |
| `SATELLITES` | `@Nullable ServerLevel satellites(ServerLevel level, @Nullable BlockPos pos, ItemStack launched)` (null passes) | first non-null | the level itself | `satelliteLevel(level, pos, launched)` |

Other constants: `EARTH_GRAVITY` = 1.6 (blocks per tick per second). An addon keeps its own per-entity state (oxygen,
corrosion) in a Golem Core `EntityData` attachment of its own, never in HBM's living props.

`com.hbm.api.environment.SkyOwnership.OWNERS` (`boolean ownsSky(Level level)`, any `true` wins) tells HBM that your mod
draws a dimension's sky, so HBM's own sky layers stay off it. Query: `SkyOwnership.claimed(level)`.

## HbmEvents

`com.hbm.api.event.HbmEvents` holds observe-only moments. Each is a notifying `Hook<Consumer<Payload>>`; the payload is
a small immutable record, the same one KubeJS scripts see.

| Hook | Payload record | When |
|---|---|---|
| `EXPLOSION` | `Explosion(Level level, double x, double y, double z, float size, @Nullable Entity exploder, String kind)` | after an `ExplosionVNT` (incl. `ExplosionNT`) or `ExplosionLarge` blast; `kind` is `vnt` or `large` |
| `BOMB_DETONATED` | `BombDetonated(Level level, BlockPos pos, String block, @Nullable Entity detonator, String result, boolean success)` | a detonator or a deferred detonation triggered a bomb block |
| `MISSILE_LAUNCHED` | `MissileLaunched(Level level, BlockPos launcher, Entity missile, String missileType, int targetX, int targetZ, @Nullable Entity launchedBy)` | a launch pad or custom-missile launcher fired |
| `MISSILE_IMPACT` | `MissileImpact(Level level, Entity missile, String missileType, double x, double y, double z, BlockPos hitPos, int targetX, int targetZ, @Nullable LivingEntity thrower)` | a ballistic missile hit a block, before its warhead goes off |
| `MACHINE_RECIPE_COMPLETED` | `MachineRecipeCompleted(Level level, BlockPos pos, String machine, String table, String recipe)` | a recipe-module machine finished an operation |
| `ENTITY_IRRADIATED` | `EntityIrradiated(LivingEntity entity, String hazard, String contamination, double amount, double dose)` | a radiation dose got through `contaminate` (often every tick: keep it cheap) |

```java
HbmEvents.EXPLOSION.register(event -> LOG.info("{} blast of {} at {} {} {}", event.kind(), event.size(), event.x(), event.y(), event.z()));
```

## Other HBM hooks

| Hook | Listener | Does |
|---|---|---|
| `TileEntityMachineFrackingTower.BLIGHT` | `Verdict blight(ServerLevel level, BlockPos tower, BlockPos deposit, DepositDataMaps.Deposit kind)` | first non-`PASS`; `DENY` replaces 1.7's oil spot around the tower |
| `BobmazonOfferFactory.OFFERS` | `void addOffers(List<Offer> standard, List<Offer> special)` | notifying; append Bobmazon offers. Register at mod construction on both sides |

**Particle effects.** `com.hbm.particle.helper.HbmEffectNT.register("<ns>:<name>")` adds an effect to HBM's particle
payload. The name must be namespaced. On the server, `effect.send(level, x, y, z, data)` (also with a range, or at a
`BlockPos`) and `effect.sendAround(level, x, y, z, data, centreX, centreY, centreZ, range)`; on the client,
`effect.setHandler((level, x, y, z, data) -> ...)` (`EffectHandler.summonParticle`).

## Golem Core hooks

Golem Core's hooks for vanilla behaviour work on every loader. Many have an `on...` registration method beside the
hook field.

### Common

| Hook | Listener | Notes |
|---|---|---|
| `world.Furnaces.IGNITION` | `Verdict mayIgnite(Level level, BlockPos pos, ItemStack fuel)` | vanilla furnaces; `DENY` means no burn time |
| `world.Evaporation.WATER` | `Verdict evaporates(Level level, BlockPos pos)` | bucket and dispenser water; nothing deciding keeps vanilla's answer |
| `world.BlockPlaces.HANDLERS` | `void onPlace(@Nullable Entity placer, ServerLevel level, BlockPos pos, BlockState placed)` | register with `BlockPlaces.onPlace(handler)` |
| `world.BlockBreaks.HANDLERS` | `void onBreak(ServerPlayer player, ServerLevel level, BlockPos pos, BlockState state)` | register with `BlockBreaks.onBreak(handler)` |
| `world.Spawns.CHECKS` | `boolean deny(Mob mob, ServerLevel level, Spawns.Reason reason)` | natural and chunk-generation spawns, and patrols, phantoms and traders; register with `Spawns.onSpawnCheck` |
| `world.Spawns.POTENTIAL` | `void onPotentialSpawns(ServerLevel level, MobCategory category, BlockPos pos)` | register with `Spawns.onPotentialSpawns` |
| `world.DamageEvents.ATTACK` / `HURT` | `Consumer<DamageEvent>` (`entity()`, `source()`, `amount()`, `setAmount`, `cancel()`) | register with `DamageEvents.onAttack` / `onHurt` |
| `world.Deaths.ALLOW` / `AFTER` | `BiPredicate<LivingEntity, DamageSource>` / `BiConsumer<LivingEntity, DamageSource>` | |
| `world.Attacks.HANDLERS` / `INTERCEPTORS` | `BiConsumer<Player, Entity>` / `BiPredicate<Player, Entity>` | |
| `world.ItemUses.FINISH` | `BiConsumer<LivingEntity, ItemStack>` | an item finished being used (food eaten) |
| `world.ItemFirstUse.HANDLERS` | `InteractionResult use(ItemStack stack, UseOnContext context)` | |
| `world.Sleeps.ATTEMPTS` | `BiConsumer<Player, BlockPos>` | |
| `world.Weathers.PROVIDERS` | `@Nullable State weather(ServerLevel level)` | register with `Weathers.register` |
| `world.ChestLoot.INJECTIONS` | `ChestLoot.Injection` | add a pool with `ChestLoot.inject(String table, String name, int rollsMin, int rollsMax, int emptyWeight, List<ChestLoot.Entry> entries)`; `Entry(Supplier<? extends Item> item, int min, int max, int weight)` |
| `world.Gliders.SOURCES` / `WINGS` | `boolean canGlide(LivingEntity)`, `void wear(LivingEntity)` / `ItemStack wings(ItemStack chest)` | |
| `platform.Lifecycle.PLAYER_JOIN` | `void joined(ServerPlayer player, boolean firstTime)` | register with `Lifecycle.onPlayerJoin` |
| `platform.Lifecycle.ENTITY_LOAD` | `BiConsumer<Entity, ServerLevel>` | register with `Lifecycle.onEntityLoad` |

`Lifecycle` also has `onServerTick`, `onServerStarted`, `onServerStopping`, `onLevelUnload`, `onChunkLoad`,
`onChunkUnload`, `onPlayerCopy`, `onDatapackSync` and `onDatapackReloaded`.

`world.CompatBlock` (Golem Core's block base class) has two overridable answers: `onSustainPlant(BlockGetter level,
BlockPos soilPos, BlockState soil, BlockState plant)` returns a `Verdict` (1.7 `canSustainPlant`), and
`isLightTransparent(BlockState state)` returns `true` for 1.7 light opacity 0. Both must depend on their arguments only.

### Client

| Hook | Listener | Notes |
|---|---|---|
| `client.CameraHooks.DISTANCE` | `float thirdPersonDistance(Player player, float distance)` | each listener receives the previous answer |
| `client.CameraHooks.LOWER_THIRD_PERSON` | `boolean lowerThirdPersonCamera(Player player)` | any `true` lowers the camera |
| `client.CameraHooks.PITCH` | `float pitchOffset(Entity entity)` | offsets add up |
| `client.PlayerRenderHooks.POSE` | `void apply(Player player, PoseStack pose, float partialTick)` | transforms the whole player model; HBM's listeners are in phase `hbm:player`, before the default |
| `client.PlayerRenderHooks.MODEL` | `Consumer<HumanoidPose>` | the humanoid model's parts after `setupAnim` |
| `client.Fogs.MODIFIERS` | `Fogs.Modifier` | fog changes |
| `client.Lightmaps.MODIFIERS` | `Lightmaps.Modifier` (`active(ClientLevel)`, `add(ClientLevel, int block, int sky, int[] rgb)`) | light map changes |
| `client.Capes.PROVIDERS` | `@Nullable Identifier cape(UUID id, String name)` | player capes |
| `client.AttackInput.GUARDS` | `BooleanSupplier` | |
| `render.BlockOutlines.SUPPRESSORS` | `BooleanSupplier` | |
| `render.Skyboxes.SKYBOXES` | `Skyboxes.Skybox` | see [Dimensions](../dimensions/) |
| `world.Skies.MODIFIERS` | `Skies.Modifier` | see [Dimensions](../dimensions/) |

`client.Fov.current()` returns the current field of view on every node.
