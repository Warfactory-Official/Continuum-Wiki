---
title: Registries
description: "HBM's own registries an addon adds to directly: materials, bullets and tracers, hazards, record registries, item renderers, survey findings and machine configs."
sidebar:
  order: 9
---

Besides vanilla's registries, HBM keeps registries of its own content kinds. Register into them from your `declare()`
(which runs after HBM's) unless a section says otherwise. Use your namespace in every name you add, so two addons
cannot collide. A duplicate name is a start-up error, never a silent replacement.

## Materials

```java
// com.hbm.inventory.material.Mats
public static synchronized NTMMaterial register(int id, String name)
```

`name` is the saved name (`Mats.write/read`) and must be unique. `id` is the runtime number packets carry
(`Mats.matById`); it must be unique too, but is never saved. Set colours, smelting and shapes on the returned material:

| `NTMMaterial` method | Sets |
|---|---|
| `colors(int solidLight, int solidDark, int molten)` | the material's colours |
| `smelting(SmeltingBehavior behavior)` | how it melts (for example `SMELTABLE`) |
| `conv(NTMMaterial mat, int in, int out)` | a conversion into another material |
| `displayName(String displayName)` | the display name |
| `setAutogen(MaterialShapes... shapes)` | shapes whose items are generated |

```java title="com/ntmspace/inventory/material/SpaceAlloyMaterials.java (shortened)"
STAINLESS = Mats.register(EX + 1, "stainless").colors(0xD8D8D8, 0x474747, 0x4A4A4A)
        .smelting(SmeltingBehavior.SMELTABLE).displayName("Stainless Steel");
STAINLESS.setAutogen(MaterialShapes.PLATE, MaterialShapes.WELDEDPLATE, MaterialShapes.CASTPLATE);
```

A material from `Mats.register` also shows in KubeJS's `HBM.materials()`. Crucible smelting of items is the recipe table
`hbm:material_distribution`.

## Bullets and tracers

```java
// com.hbm.items.weapon.sedna.BulletConfigs
public static synchronized BulletConfig register(Identifier id, BulletConfig config)
```

Register your rounds under your own namespace (`ntmspace:worldwar`). A duplicate id throws.

Tracers are client side, in `com.hbm.client.render.projectile.TracerRegistry`:

| Method | Does |
|---|---|
| `register(BulletTracer tracer, Identifier... ids)` | one tracer for several rounds |
| `registerBeam(BeamTracer tracer, Identifier... ids)` | one beam for several rounds |
| `setBulletRenderer(Identifier id, BulletTracer renderer)` / `setBeamRenderer(Identifier id, BeamTracer renderer)` | one round |
| `model(Identifier model, Identifier texture, String part, float scale, Consumer<PoseStack> transform)` | a tracer from one OBJ part |
| `flare(float red, float green, float blue)` | a flare tracer |
| `ribbon(int dark, int light, boolean fullbright)` | a ribbon tracer |
| `laser(int r, int g, int b)` | a laser beam |

HBM's client tracer audit checks only HBM's own rounds; give yours a tracer yourself.

## Hazards

```java
// com.hbm.hazard.HazardRegistry
public static <T extends IHazardType> T registerType(Identifier id, T type)

// com.hbm.hazard.HazardSystem
public static void register(TagKey<Item> tag, HazardData data)
public static void register(Item item, HazardData data)
public static void register(Block block, HazardData data)
```

`registerType` names a hazard type so recipes, commands and data can find it; it returns the type, to initialise the
constant that holds it.

```java title="com/ntmspace/fork/neutron/NeutronActivation.java"
public static final IHazardType NEUTRON = HazardRegistry.registerType(Ids.of(NtmSpace.MOD_ID, "neutron"), new HazardTypeNeutron());
```

Which items carry which hazards is also the data map `hbm:hazards` (items), which datapacks and addons can patch.

## Fluid traits

`FluidProperties.registerTrait` and `registerFlag` add trait types to the `fluid_property` format. See
[Fluids](../fluids-and-networks/#new-trait-types).

## Record registries

Content kinds that 1.7 kept in a closed enum or static table are registries of records in HBM, most of them backed by
`com.hbm.api.registry.NamedRegistry<T>`. HBM's own entries keep their 1.7 names; iteration order is registration order,
so HBM's entries come first, in 1.7 order. Register at mod construction (or from a class initialiser that runs then), on
both sides.

| Kind | Register |
|---|---|
| RBMK column types | `RBMKColumnType.register(String name, Identifier sheet, int offset, @Nullable Function<RBMKColumnType, RBMKColumn> column)` |
| FEL wavelengths | `ItemFELCrystal.EnumWavelengths.register(String key, double strength, String name, String wavelengthRange, int renderedBeamColor, int guiColor, ChatFormatting textColor, BeamEffect beamEffect)` |
| Pedestal conditions | `PedestalRecipes.PedestalExtraCondition.register(String name, @Nullable Icon icon, Test test)` |
| ICF fuels | `ItemICFPellet.EnumICFFuel.register(String name, int color, double react, double depl, double laser)` |
| Armour hazard classes | `ArmorRegistry.HazardClass.register(String name, String lang)` |
| Satellite types | `SatelliteType.register(String name, Supplier<? extends Satellite> factory, MapCodec<? extends Satellite> codec, @Nullable String cargo)` |
| Bomber payloads | `BomberPayload.register(String name, Factory factory, Drop drop)` |
| Bedrock ore types | `BedrockOreType.register(BedrockOreType type)`; the code-made chain rows use `BedrockOreChainRecipes.addChainType/removeChainType` |
| Custom missile warheads and fuels | `ItemCustomMissilePart.WarheadType.register(...)`, `ItemCustomMissilePart.FuelType.register(...)` |
| Siren tracks | `ItemCassette.TrackType.register(String name, String title, @Nullable String sound, SoundType type, int color, int volume)` |
| Tool and weapon abilities | `IToolAreaAbility.REGISTRY`, `IToolHarvestAbility.REGISTRY`, `IWeaponAbility.REGISTRY` |

```java title="com/ntmspace/registry/SpaceSpecialItems.java (shortened)"
public static final EnumWavelengths XRAY = EnumWavelengths.register(NS + ":xray", 4D, "wavelengths.name.xray",
        "wavelengths.waveRange.xray", 0xF8E6A7, 0xF8E6A7, ChatFormatting.GOLD, entity -> {});
```

```java title="com/ntmspace/fork/ForkContent.java (shortened)"
public static final ItemCassette.TrackType TRACK_DISEMBODIED = ItemCassette.TrackType.register(
        NS + ":DISEMBODIED", "Ducc", NS + ":alarm.ducc", ItemCassette.SoundType.LOOP, 0xb3a8c1, 50);
```

`NamedRegistry<T>` itself: `register(value)`, `get(name)`, `name(value)`, `contains(name)`, `values()`.

## Custom item renderers

```java
// com.hbm.client.render.item.CustomItemRenderers (client)
public static void register(String name, Supplier<CustomItemRenderer> factory)

// com.hbm.client.render.MachineItemNamespaces (client)
public static synchronized void add(String namespace)
```

`CustomItemRenderers.register` adds a renderer an item definition's `hbm:custom_item` model can name (a ported 1.7
`IItemRenderer`). Name yours `<ns>:<name>` and register from your client set-up, before the first resource load.

```java
CustomItemRenderers.register("ntmspace:plushie", RenderSpacePlushie.Item::new);
```

On 26.1 an item definition of any namespace can name `hbm:machine_obj`. Below 26.1 each loader needs a per-item
"render this yourself" callback, so call `MachineItemNamespaces.add(ns)` to bind your namespace's OBJ machine items to
HBM's item renderer (NeoForge: from the mod constructor; Fabric: any time during client initialisation). Forge 1.20.1
needs no call.

## Survey scanner findings

```java
// com.hbm.items.tool.ItemSurveyScanner
public static void addFinding(int index, Finding finding)
public record Finding(Predicate<Block> matches, String message, ChatFormatting colour) {}
```

Inserts a finding at `index` of the report order (`0` = first, `findings().size()` = last). A block counts for the first
finding it matches.

## Other extension points

Smaller tables HBM keeps in code, each with a public method to add to it. Call them at mod construction (from
`declare()`) unless the row says otherwise.

| Add | Call |
|---|---|
| Shape items for your material (plates, wires, ...) | `ModAutogenItems.registerAutogen(DeferredRegister.Items items, NTMMaterial mat, MaterialShapes... shapes)`, after `mat.setAutogen(...)` with the same shapes; items are `<ns>:<shape base>_<material>` |
| A missile item a launch pad can fire | `TileEntityLaunchPadBase.registerLaunchable(Item item, MissileFactory factory)`; `MissileFactory.create(level, x, y, z, targetX, targetZ)` returns the missile entity. An earlier registration wins over HBM's default, so this can also change what an HBM missile item launches |
| A tool that counts as a screwdriver, wrench, ... | `IToolable.ToolType.<TYPE>.register(Supplier<? extends Item> item)` (`SCREWDRIVER`, `HAND_DRILL`, `DEFUSER`, `WRENCH`, `TORCH`, `BOLT`) |
| A gun modifier | `XWeaponModManager.register(String name, M mod)`, name `<ns>:<path>`; saved by name; bind it to its item and guns with a `WeaponModDefinition` |
| Armour that protects against a hazard class | `ArmorRegistry.registerHazard(Item item, HazardClass... hazards)` (appends) |
| Power armour fist and gun behaviour | `ArmorPAWeapons.registerMelee(Item chest, IPAMelee component)`, `registerRanged(Item chest, IPARanged component)` |
| A glyphid kind in hive swarms | `TileEntityGlyphidSpawner.addSwarmMember(Supplier<? extends EntityType<? extends EntityGlyphid>> type, int[] chance)`; `chance` is `{base, soot scaling, soot threshold}` |
| A named NBT structure | `NBTStructure.registerStructure(SpawnCondition spawn)`; a second condition under the same name throws |
| A SILEX tiny waste item | `SILEXRecipes.addTinyWaste(String tinyItemId, String fullItemId)`: the tiny item runs the full item's row |
| A foundry mold output | `ItemMold.MoldMulti.add(NTMMaterial mat, Supplier<ItemStack> out)`, `ItemMold.MoldBlock.override(mat, stack)` on a mold from `ItemMold.getMold(stack)` |
| An item in an HBM creative tab | `.tab(HbmTab.X)` on the chain, or `ModTabs.addTo(HbmTab tab, RegistryObject<? extends Item> item)` |
| A furnace fuel | a `neoforge:furnace_fuels` data map for NeoForge (Dejson: `dev.golem.core.dejson.DataMaps.furnaceFuels().burnTime(id, ticks)` then `.register()`), plus `dev.golem.core.registry.Fuels.register(Map<Supplier<Item>, Integer>)` from `registered()` for Fabric and Forge (a no-op on NeoForge) |
| A machine as a CC: Tweaked peripheral | `com.hbm.api.computer.ComputerComponents.register(Class<BE> type, String name, Map<String, Method<BE>> methods, Supplier<? extends Block>... blocks)`; `Method.call(machine, arguments)` returns the result array. One component per block entity class |

Client side:

| Add | Call |
|---|---|
| A WIAJ cannery presentation for an item | `Jars.register(String itemId, CanneryBase cannery)` (`com.hbm.wiaj.cannery`) |
| A bomber skin | `RenderBomber.registerSkin(String name, Skin skin)`, by the name `EntityBomber.setSkin` stores; a name registered twice throws |
| An entity renderer inside HBM's registration | `HbmEntityRenderers.addExtension(sink -> sink.register(type, provider))` (see [Registering content](../registering-content/#client-registrations)) |

NTM: Space's computer component, for example:

```java title="com/ntmspace/tileentity/machine/StardarComputer.java (shortened)"
Map<String, ComputerComponents.Method<TileEntityMachineStardar>> methods = new LinkedHashMap<>();
methods.put("getCurrentPlanet", (stardar, args) -> new Object[] {Orbit.bodyOf(stardar.getLevel()).name});
ComputerComponents.register(TileEntityMachineStardar.class, "ntm_stardar", methods, SpaceMachinesD.MACHINE_STARDAR);
```

## Interfaces in com.hbm.api

HBM's machines, tools and entities find your content by these interfaces, as they find HBM's own. Implement them on your
block, block entity, item or entity.

| Interface | On | HBM uses it for |
|---|---|---|
| `block.IToolable` | block | `onScrew(level, player, pos, side, hit, hand, ToolType)`: a screwdriver, wrench, hand drill or other HBM tool used on it |
| `block.IInsertable` | block | `insertItem(level, pos, dir, stack)`: the piston inserter pushes one item in |
| `block.IPneumaticConnector` | block | `canConnectPneumatic(dir)`: pneumatic tubes connect on that side |
| `block.ICrucibleAcceptor` | block | `canAcceptPartialPour`/`pour`, `canAcceptPartialFlow`/`flow`: molten metal from crucibles, channels and foundries; both return the leftover |
| `block.IBlowable` | block | `applyFan(level, pos, direction, distance)`: the first obstruction in a fan's air stream |
| `block.IRadarCommandReceiver` | block entity | `sendCommandPosition(x, y, z)`, `sendCommandEntity(target)`: fire missions from a radar or designator |
| `block.BarrelSkin` | block | `barrelSkin()`: drawn by HBM's barrel renderer |
| `tile.IHeatSource` | block entity | `getHeatStored()`, `useUpHeat(heat)`: heat (TU) that a consumer directly above (a crucible, another heater) drains |
| `conveyor.IConveyorBelt` / `conveyor.IEnterableBlock` | block or block entity | items moving along a belt, and entering a block from one (`ConveyorLookup.at(type, level, pos)` finds either) |
| `redstoneoverradio.IRORValueProvider` / `IRORInteractive` | block entity | values and functions for Redstone-over-Radio readers and controllers (`getFunctionInfo()`, `provideRORValue`, `runRORFunction`) |
| `item.IDesignatorItem` | item | `isReady`, `getCoords`: a launch pad target |
| `item.IGasMask` | helmet | a replaceable gas-mask filter and its hazard blacklist |
| `item.IDepthRockTool` | item | `canBreakRock(...)`: may break depth rock |
| `entity.IRadarDetectableNT` | entity | `getRadarName()`, `getBlipLevel()`: how a radar shows it |
| `entity.IResistanceProvider` | entity | `getCurrentDTDR(...)`: dynamic damage threshold and resistance against HBM's damage |
| `fluid.TooltipTrait` | fluid trait | `addInfo`, `addInfoHidden` (Shift): lines on the fluid's tooltip |

## Machines in hbmMachines.json

```java
// com.hbm.config.MachineDynConfig
public static void register(IConfigurableMachine machine)
```

Adds your machine to HBM's `hbmMachines.json` config. Call before the config is read (it is read at common setup), for
example from `declare()`. `IConfigurableMachine` has `getConfigName()`, `readIfPresent(JsonObject obj)` and
`writeConfig(JsonWriter writer)`, plus static `grab(obj, name, default)` helpers.

## World rules

```java
// dev.golem.core.world.WorldRules
public static BoolRule bool(String name, boolean defaultValue)
public static IntRule integer(String name, int defaultValue, int min, int max)
public static DoubleRule decimal(String name, double defaultValue, double min, double max)
```

A rule is set with `/gamerule <name> <value>` (HBM's RBMK dials are these), saved with the world, clamped when read and
synced to clients. Read it with `rule.get(level)`. Vanilla game rules hold no doubles and 26.1 names them by lower-case
id, so use these for 1.7-style camelCase rules. Declare at mod construction on both sides, with a name your mod owns.

