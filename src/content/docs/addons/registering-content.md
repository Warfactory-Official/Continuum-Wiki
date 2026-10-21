---
title: Registering content
description: "Registering blocks, items, block entities, menus, sounds and entities through Golem Core's Registrar chain, with build-time Dejson declarations."
sidebar:
  order: 4
---

Golem Core's `dev.golem.core.registry.Registrar` registers an entry and states its boilerplate (model, blockstate, item
model, loot table, tags, creative tab) in one chain. HBM's own `com.hbm.registration.Reg` extends it. At build time,
**Dejson** writes the declared JSON files on all six nodes.

## A registration class

One class per family of content. It owns its `DeferredRegister`s and a `Registrar` over them.

```java title="com/ntmspace/registry/SpaceBlocks.java"
public final class SpaceBlocks {

    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(NtmSpace.MOD_ID);
    public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(NtmSpace.MOD_ID);
    private static final Registrar REG = Registrar.of(BLOCKS, ITEMS);

    public static final RegistryObject<Block> MOON_ROCK = REG.simpleBlock("moon_rock",
                    p -> p.strength(1.5F, 10.0F).sound(SoundType.STONE).requiresCorrectToolForDrops())
            .transform(Presets.cubeAll()).loot(Loot.self()).tag(BlockTag.PICKAXE);
    public static final RegistryObject<BlockItem> MOON_ROCK_ITEM = REG.blockItem(MOON_ROCK).tab(HbmTab.BLOCKS);

    private SpaceBlocks() {}

    public static void init() {}
}
```

Call `SpaceBlocks.init()` from your `declare()`. Registers flush in the order they were created and entries in the order
they were added, so registry order follows your code.

## Typed register factories

| Factory | Register | Registry |
|---|---|---|
| `DeferredRegister.createBlocks(ns)` | `DeferredRegister.Blocks` | blocks |
| `DeferredRegister.createItems(ns)` | `DeferredRegister.Items` | items |
| `DeferredRegister.createBlockEntityTypes(ns)` | `DeferredRegister.BlockEntityTypes` | block entity types |
| `DeferredRegister.createMenuTypes(ns)` | `DeferredRegister.MenuTypes` | menu types |
| `DeferredRegister.createSounds(ns)` | `DeferredRegister.Sounds` | sound events |
| `DeferredRegister.createEntityTypes(ns)` | `DeferredRegister.EntityTypes` | entity types |
| `DeferredRegister.create(() -> Registries.X, ns)` | `DeferredRegister<T>` | any other registry |

Prefer the typed factories. On 1.20.1 a `ResourceKey` cannot be created outside a bootstrapped game, so a class whose
static initialiser names `Registries.X` directly fails at build time (see the plain-JVM rule below). All registers of
one `Registrar` must share one namespace.

## Registrar methods

| Method | Registers |
|---|---|
| `block(name, factory, properties)` | a block of your class; `factory` takes `BlockBehaviour.Properties` |
| `block(name, factory)` | the same with default properties |
| `simpleBlock(name, properties)` | a plain `Block` |
| `item(name, factory, properties)` | an item of your class |
| `item(name, factory)` | the same with default properties |
| `simpleItem(name, properties)` | a plain item |
| `item(name)` | a plain item with default properties |
| `blockItem(block)` | the block's plain `BlockItem`, under the block's name |
| `blockItem(block, properties)` | the same with item properties |
| `blockItem(block, (b, p) -> new MyItem(b, p), properties)` | a block item of your class |
| `blockEntity(name, () -> type)` | a block entity type |
| `menu(name, () -> type)` | a menu type |
| `sound(name)` | a variable-range sound event `<ns>:<name>` |
| `entity(name, () -> type)` / `entity(name, key -> type)` | an entity type (returns an `EntityHandle`) |
| `register(registryKey, name, () -> value)` | anything else, on a register of that registry |

`simpleBlock` and `simpleItem` exist because an implicitly typed lambda (`REG.block("x", p -> ...)`) would be ambiguous.
A factory that returns a subclass may need a type witness: `REG.<MyBlock, BlockItem>blockItem(...)`.

## Handle chain methods

Every method above except `entity` returns a `Registrar.Handle<T>`, which **is** the `RegistryObject<T>` your field
holds (`get()`, `getId()`, `getKey()` work as usual). Each declaring method states one surface for the id; stating a
surface twice fails at build time ("declared twice").

| Method | On | States |
|---|---|---|
| `.model(d -> ...)` | block | model, blockstate and optionally the block item's model, as one `Dejson.Declaration` |
| `.icon(d -> ...)` | item or block | the item model and item definition, as one `Dejson.ItemDeclaration` |
| `.loot(Loot)` | block | the block loot table `data/<ns>/loot_table/blocks/<path>.json` |
| `.tag(BlockTag)` | block | block tag membership |
| `.tag(ItemTag)` | item or block | item tag membership (on a block, for its same-id item) |
| `.tab(TabTarget)` | item | creative tab listing, in call order |
| `.transform(Preset)` | any | a reusable bundle of declarations |
| `.andThen(handle -> ...)` | any | runs an action on the handle now |
| `.addTo(collection)` | any | adds the handle to a list |

`path()`, `namespace()`, `id()` and `isBlock()` read the handle.

`Registrar.EntityHandle<E>` has `.tag(EntityTag)`, `.addTo(collection)`, `path()` and `id()`.

## Presets

HBM's `com.hbm.registration.Presets` holds the shared declaration shapes. Texture defaults are under the registering
mod's namespace, so an addon finds its own textures (`<ns>:blocks/<path>`, `<ns>:items/<path>`).

| Preset | Writes |
|---|---|
| `cubeAll()` | `cube_all` over `<ns>:blocks/<path>` |
| `cubeAll(texture)` | `cube_all` over the given texture |
| `cubeAllCutout()` | `cubeAll()` on the cutout layer |
| `cubeBottomTop(bottom, side, top)` | `cube_bottom_top` |
| `column(end, side)` | `cube_column` |
| `orientable(front, side, top)` | `orientable` |
| `cross(texture)` | `cross` |
| `shape(shape)` | any other Dejson `Shape` |
| `rendered(sharedModel, states)` | a blockstate pointing every state at a shared model; the block is drawn by a renderer |
| `rendered(states)` | the same with `hbm:block/machine_dummy_empty` |
| `statesOnly(states)` | only the blockstate; the model `<ns>:block/<path>` is an authored file |
| `statesOnly(modelId, states)` | only the blockstate, pointing at another authored model |
| `sprite()` | `item/generated` over `<ns>:items/<path>` |
| `sprite(layers...)` | `item/generated` over the given layers |
| `handheld()` / `handheld(texture)` | HBM's held full-3D item model |
| `shares(modelId)` | an item definition naming an existing model |

Block presets default to a single-variant blockstate and a block item whose definition names the block model. Change that
with `.states(Variants.facing())` (or `axis()`, `uniformRange(property, from, to)`, ...), `.viaItemModel()`,
`.directItem()` or `.noItem()`. Item presets take `.tints(Tint...)`. Two presets combine with `preset.and(other)`.

```java title="com/ntmspace/fork/ForkContent.java (shortened)"
public static final RegistryObject<NukeAntimatter> NUKE_ANTIMATTER = REG.block("nuke_antimatter",
                NukeAntimatter::new,
                p -> p.strength(5.0F, 6000.0F).sound(SoundType.METAL).requiresCorrectToolForDrops().noOcclusion())
        .transform(Presets.rendered(Variants.uniformRange("facing", 2, 5)))
        .loot(Loot.self()).tag(BlockTag.PICKAXE);
```

## Loot

`dev.golem.core.registry.Loot`:

| Loot | Drops |
|---|---|
| `self()` | the block (survives explosion) |
| `selfAlways()` | the block, explosion or not |
| `nothing()` | an empty loot table |
| `only(drop)` | one other item |
| `slab()` | slab drops |
| `container(components...)` | the block, copying the named data components onto the item |
| `silkTouchOnly()` | the block with silk touch only |
| `oreNoFortune(drop, min, max)` | silk touch: the block; else `min..max` of `drop`, no fortune |
| `oreMultiplied(drop, min, max)` | the 1.7 ore shape: silk touch gives the block, else `min..max` multiplied by fortune |
| `dropsMultiplied(drop, min, max)` | `oreMultiplied` without the silk touch branch |
| `oreOrRare(drop, min, max, rare, chance)` | silk touch: the block; else `rare` with `chance`; else `min..max` of `drop` |
| `selfWhen(property, value)` | the block when a state property has a value |
| `chance(drop, chance)` | `drop` with a chance |
| `stacks(id, count, id, count, ...)` | fixed stacks |

## Tags and tabs

`BlockTag` constants: `PICKAXE`, `AXE`, `SHOVEL`, `HOE` (the `minecraft:mineable/*` tags), `NEEDS_IRON_TOOL`,
`CLIMBABLE`. Any other: `BlockTag.of("ns:path")`, `ItemTag.of("ns:path")`, `EntityTag.of("ns:path")`. Tag memberships
from every mod accumulate.

`.tab(...)` takes any `TabTarget`. HBM's `com.hbm.creativetabs.HbmTab` lists your items in HBM's tabs: `MATERIALS`,
`CONTROL`, `TEMPLATES`, `RESOURCES`, `BLOCKS`, `MACHINES`, `BOMBS`, `MISSILES`, `WEAPONS`, `CONSUMABLES`.

## Block entities, menus, sounds and entities

```java
public static final RegistryObject<BlockEntityType<TileEntityAntimatter>> NUKE_ANTIMATTER_BE =
        REG.blockEntity("nuke_antimatter", () -> BlockEntities.serverTicking(
                TileEntityAntimatter::new, TileEntityAntimatter::serverTick, NUKE_ANTIMATTER.get()));

public static final RegistryObject<MenuType<ContainerNukeAntimatter>> NUKE_ANTIMATTER_MENU =
        REG.menu("nuke_antimatter", () -> Menus.typeWithPos(ContainerNukeAntimatter::new));
```

`dev.golem.core.registry.BlockEntities` builds the type on every loader and records its ticker:

| Method | Type |
|---|---|
| `type(factory, blocks...)` | no ticker |
| `serverTicking(factory, serverTick, blocks...)` | server ticker only (most machines) |
| `clientTicking(factory, clientTick, blocks...)` | client ticker only |
| `ticking(factory, clientTick, serverTick, blocks...)` | either side; null for none |

A block implementing Golem Core's `TickingBlock` gets its ticker from the type. `dev.golem.core.gui.Menus` builds menu
types whose client side receives a position (`typeWithPos`), a hand (`typeWithHand`) or an entity (`typeWithEntity`), and
opens them on the server (`openWithPos`, `openWithHand`, `openWithEntity`).

Sounds: `REG.sound("alarm.ducc")` registers `<ns>:alarm.ducc`. `assets/<ns>/sounds.json` stays an authored file.

Entities use `dev.golem.core.registry.Entities` to build the type on every node:

```java title="com/ntmspace/entity/rocket/RocketEntities.java (shortened)"
public static final DeferredRegister.EntityTypes ENTITY_TYPES = DeferredRegister.createEntityTypes(NtmSpace.MOD_ID);
private static final Registrar REG = Registrar.of(ENTITY_TYPES);

public static final Registrar.EntityHandle<EntityRideableRocket> RIDEABLE_ROCKET = REG.entity("entity_rideable_rocket",
        key -> Entities.build(Entities.noLoot(EntityType.Builder.<EntityRideableRocket>of(EntityRideableRocket::new,
                MobCategory.MISC)).fireImmune().sized(2.0F, 8.0F).clientTrackingRange(63).updateInterval(1), key));
```

## Client registrations

Screens, renderers and other client-only bindings go through Golem Core's `dev.golem.core.client` facades, called from
your client set-up ([Mod entry](../mod-entry/#client-set-up)). Each runs at the right moment on every loader.

```java title="com/ntmspace/client/DriveProcessorClient.java (shortened)"
ClientRegistrations.screens(screens -> screens.register(DriveProcessorBlocks.DRIVE_PROCESSOR_MENU.get(), GUIMachineDriveProcessor::new));
ClientRegistrations.renderers(r -> r.blockEntity(DriveProcessorBlocks.DRIVE_PROCESSOR_BE.get(), context -> new RenderDriveProcessor()));
```

| Call | Registers |
|---|---|
| `ClientRegistrations.screens(screens -> screens.register(menuType, ScreenClass::new))` | a menu's screen |
| `ClientRegistrations.renderers(r -> r.blockEntity(type, provider))` | a block entity renderer (`CompatBER`) |
| `ClientRegistrations.renderers(r -> r.entity(type, provider))` | an entity renderer |
| `Hud.addLast(ns, path, graphics -> ...)` | a HUD overlay drawn after vanilla's HUD |
| `KeyMappings.register(ns, translationKey, glfwKey, categoryPath)` | a key binding; returns a `KeyMapping` to poll with `isDown()` / `consumeClick()` |
| `ItemModelProperties.register(ns, name, stack -> int)` | an item model property `<ns>:<name>` for item definitions to select on |
| `ItemModelProperties.includeItems(propertyNs, name, itemNamespaces...)` | applies another mod's property (such as `hbm:model_state`) to your items below 26.1 |

`HbmEntityRenderers.addExtension(sink -> sink.register(type, provider))` binds an entity renderer inside HBM's own
renderer registration, so HBM's renderer coverage check sees it. Call it on the client before the loader registers
renderers. For HBM's own registries of client objects (custom item renderers, tracers, bomber skins), see
[Registries](../registries/).

## Network payloads

A payload is declared once, in `declare()`, and Golem Core registers it with every loader's networking.

```java title="ntmprobe: ProbeNet.java (shortened)"
public record Ping(int value) implements GolemPayload {
    @Override
    public Identifier id() {
        return CODEC.id();
    }
}

public static final GolemCodec<Ping> CODEC = GolemCodec.of(Ping.class, Ids.of(ProbeEntry.MOD_ID, "ping"),
        (payload, buf) -> buf.writeVarInt(payload.value()), buf -> new Ping(buf.readVarInt()));

public static void init() {               // from declare()
    GolemNetwork.declarePlayToClient(CODEC);
}

public static void initClient() {         // from client set-up
    GolemNetwork.registerPlayToClient(CODEC, (payload, context) -> lastPing = payload.value());
}

public static boolean send(ServerPlayer player, int value) {
    if (!GolemNetwork.canSendToPlayer(player, CODEC)) return false;
    GolemNetwork.sendToPlayer(player, CODEC, new Ping(value));
    return true;
}
```

| `dev.golem.core.net.GolemNetwork` | Does |
|---|---|
| `declarePlayToClient(codec)` | declares a server-to-client payload (common code, `declare()`) |
| `registerPlayToClient(codec, (payload, context) -> ...)` | its client handler, on the client thread; `context` has `level()` and `player()` |
| `registerPlayToServer(codec, (payload, player) -> ...)` | a client-to-server payload and its server handler, on the server thread (common code, `declare()`) |
| `sendToPlayer(player, codec, payload)` | sends to one player; never throws when the player's client lacks the channel |
| `sendToTracking(level, pos, codec, payload)` | sends to every player tracking the chunk at `pos` |
| `sendToServer(codec, payload)` | sends from the client |
| `canSendToPlayer(player, codec)` | whether the player's client has the channel |

`GolemCodec.of(type, id, encoder, decoder)` uses a plain `FriendlyByteBuf`; `GolemCodec.ofRegistry(...)` the
registry-aware buffer (plain below 1.20.5), for payloads that write item stacks or components. Off-thread variants
(`declarePlayToClientOffThread`, `registerPlayToClientOffThread`, `registerPlayToServerOffThread`) run the handler on
the network thread and give it the payload only. Keep a payload's id stable once released.

## Dejson: what to declare and what to author

Dejson is for uniform boilerplate only: simple blocks and items, their loot and tags, and crafting and smelting recipes
(see [Recipes and data](../recipes-and-data/)). Hand-tuned JSON stays an authored file under `src/main/resources`: custom
`elements` geometry, `display` transforms, one-off OBJ item definitions, dimensions and worldgen. The chain only points
at such a file (`Presets.statesOnly(...)`, `.icon(d -> d.shares("ns:item/x"))`).

Two lists in `gradle/` tell the build which is which:

```text title="gradle/dejson-classes.txt"
# Classes whose static declarations Dejson collects, one per line, in initialisation order.
com.ntmspace.registry.SpaceBlocks
com.ntmspace.registry.DunaBlocks
com.ntmspace.recipe.SpaceCraftingRecipes
```

```text title="gradle/dejson-authored.txt"
# Authored JSON under Dejson-owned folders: exact paths, or a folder ending in a slash.
data/ntmspace/dimension/
data/ntmspace/dimension_type/
data/ntmspace/worldgen/
assets/ntmspace/blockstates/vinyl_vine.json
assets/ntmspace/models/block/vinyl_vine.json
```

- Every class with chain declarations must be listed in `dejson-classes.txt`. Dejson initialises each one and calls its
  static `declare()` if it has one.
- Every authored file in a Dejson-owned folder must be listed in `dejson-authored.txt`. The owned folders, in any
  namespace: `assets/*/items`, `models`, `blockstates`, `equipment`, `atlases`, and `data/*/tags`, `loot_table`,
  `recipe`, `advancement`, `damage_type`, `worldgen`, `data_maps`, `jukebox_song`, `neoforge/biome_modifier`. A
  hand-written machine recipe in `data/<ns>/recipe/` counts too. Other data folders (`value_maps`, `fluid_property`,
  `recipe_removals`, `dimension`, `structure`, ...) are not owned. The `dejsonOwnership` task fails the
  build on an unlisted authored file, and on a listed path that no longer exists.
- An authored file at a declared path silently wins over the declaration. When you take a file back, delete its
  declaration in the same change.
- Run `:26.1-neoforge:dejsonVerify` after declaring: it is the check that every declared texture exists.

## The plain-JVM rule

Dejson runs your listed classes' static initialisers in a plain JVM, with Minecraft on the classpath but **never
bootstrapped**. 26.1 is lenient here; 1.20.1 is not. In a listed class, a static initialiser must not:

- create a `ResourceKey` or name `Registries.X` (use the typed register factories),
- read a registry or call `get()`/`getId()` on a handle,
- touch a `SoundType` constant or build an `Item.Properties`.

Keep all of that inside the factory and properties lambdas, which registration only stores. `SoundType.STONE` inside
`p -> p.sound(SoundType.STONE)` is fine. For lazy values Golem Core offers `GolemComponent.of(ns, name, () -> CODEC)` and
`ToolTier.of(..., () -> repairTag)`.
