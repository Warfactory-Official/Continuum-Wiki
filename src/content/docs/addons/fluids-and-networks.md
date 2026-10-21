---
title: Fluids and networks
description: "Registering fluids for HBM's tanks and ducts, their properties, traits and textures, and the interfaces a machine implements to join HBM's fluid and power networks."
sidebar:
  order: 7
---

The vanilla fluid registry is the identity of every fluid. Water, lava and empty are `minecraft:water`,
`minecraft:lava` and `minecraft:empty`; HBM's fluids are `hbm:<name>`; yours are `<ns>:<name>`. Saves name fluids by id,
never by number.

**Any registered fluid works in HBM's tanks and ducts.** A fluid from another mod becomes a "foreign" `FluidType`
(`FluidType.isForeign()`). Register through HBM when you want HBM's properties, traits, icons and tank skins.

## Registering

```java
// com.hbm.inventory.fluid.Fluids
public static synchronized FluidType register(String namespace, String name, int color)
public static synchronized void declareVanilla(String namespace, List<FluidType> fluids)
```

`register` creates `<namespace>:<lower-case name>`, after HBM's own fluids. Call it at mod construction. A second
registration of the same id throws. `declareVanilla` makes your fluids vanilla `Fluid`s too (Golem Core `TokenFluids`).
Without it, recipe JSON naming `<ns>:<name>` and other mods' fluid APIs cannot see them.

```java title="com/ntmspace/fluid/SpaceFluids.java (shortened)"
public final class SpaceFluids {

    public static final FluidType NITROGEN = Fluids.register(NtmSpace.MOD_ID, "NITROGEN", 0xB3C6D2);
    public static final FluidType HCL = Fluids.register(NtmSpace.MOD_ID, "HCL", 0x00D452);

    private static boolean initialised;

    /** Mod construction: the trait format, the files, the vanilla fluids. */
    public static synchronized void init() {
        if (initialised) return;
        initialised = true;
        SpaceFluidTraits.register();
        List<FluidType> all = List.of(NITROGEN, HCL /* ... */);
        FluidProperties.applyBundled(SpaceFluids.class, all);
        FluidProperties.applyBundledPatches(SpaceFluids.class, NtmSpace.MOD_ID);
        Fluids.declareVanilla(NtmSpace.MOD_ID, all);
    }
}
```

Order matters: register your trait types first, then the fluids, then apply the bundled files, then declare them as
vanilla fluids.

## Properties

A fluid's colour, tint, temperature, phases, flags, traits and hazard diamond come from
`data/<ns>/fluid_property/<name>.json`, in the same schema as HBM's files. Datapacks may replace them.

```java
// com.hbm.inventory.fluid.FluidProperties
public static void applyBundled(Class<?> owner, Iterable<FluidType> fluids)
public static synchronized void applyBundledPatches(Class<?> owner, String namespace)
```

- `applyBundled` reads each fluid's file from your own jar (`owner` is any class of your mod) when you create the
  fluids, so menus, tooltips and registration see the values before any world. A fluid without a file keeps its code
  defaults. Every datapack load applies the files again.
- `applyBundledPatches` reads your patches of other mods' fluids,
  `data/<ns>/fluid_property_patch/<fluid ns>/<fluid path>.json`, from your jar.

### Changing another mod's fluid

Never ship a file at `data/hbm/fluid_property/<name>.json`: which mod's pack wins a path is not reliable across loaders.
Ship a patch under your own namespace:

```json title="data/ntmspace/fluid_property_patch/hbm/kerosene.json"
{
  "add": {
    "traits": {"ntmspace:rocket": {"isp": 308, "thrust": 981000}}
  }
}
```

A patch may also hold `"remove": [names]` (traits, flags or phases) and the overrides `"color"`, `"tint"`,
`"temperature"` and `"hazard"`. After every load each patched fluid starts again from its own file, then takes every
patch in patching-namespace order: removals, additions, then overrides. Two mods patching one fluid apply in namespace
order (`ntmprobe` before `ntmspace`), so a trait both add is the later namespace's. A patch naming an unregistered fluid
is ignored.

## New trait types

```java
// com.hbm.inventory.fluid.FluidProperties
public static void registerTrait(String name, Class<?> type, Function<JsonObject, Object> reader,
                                 Function<Object, JsonObject> writer)
public static synchronized void registerFlag(String name, Object trait)
```

`registerTrait` adds a parameterised trait, `"traits": {"<name>": {...}}`, to the file format. `registerFlag` adds a
parameterless one (a singleton instance) to `"flags"`. Name them `<ns>:<name>` and call at mod construction, before any
property file is read. A name registered twice throws.

```java title="com/ntmspace/fluid/trait/SpaceFluidTraits.java (shortened)"
public static synchronized void register() {
    FluidProperties.registerTrait(FT_Rocket.NAME, FT_Rocket.class, FT_Rocket::read, FT_Rocket::write);
    FluidProperties.registerTrait(FT_Terraformer.NAME, FT_Terraformer.class, FT_Terraformer::read, FT_Terraformer::write);
    FluidProperties.registerFlag("ntmspace:uk", ULTRAKILL);
    FluidProperties.registerFlag("ntmspace:explosive", EXPLOSIVE);
}
```

Read a trait in code with `fluid.hasTrait(FT_Rocket.class)`.

## Textures

- **Droplet icons**: ship a greyscale droplet as `assets/<ns>/textures/items/fluid_icon.png` (a copy of HBM's, or your
  own) and call `com.hbm.client.FluidSprites.install(ns)` from your client set-up, after registering your fluids and
  before the first resource load. It generates one tinted sprite per fluid, `<ns>:items/fluid_icon_<key>`.
- **Fluid tank skins**: `assets/<ns>/textures/models/tank/tank_<key>.png`. A fluid without one shows `tank_none`.

Container colours (canisters, gas tanks) are the data map `hbm:fluid/fluid_containers`; add yours with a patch
(see [Data maps](../java-data-maps/)).

## Connecting to HBM's networks

A block entity joins HBM's fluid ducts and power cables by implementing the network interfaces and declaring its ports.
The interfaces are in `com.hbm.api.fluidmk2` and `com.hbm.api.energymk2`.

### Fluid interfaces

| Interface | Methods |
|---|---|
| `IFluidConnectorMK2` | `canConnect(FluidType type, ForgeDirection dir)`; default: any side but `UNKNOWN` |
| `IFluidUserMK2` | extends the connector; `FluidTankNTM[] getAllTanks()` |
| `IFluidReceiverMK2` | `long transferFluid(FluidType type, int pressure, long amount)` (returns the remainder), `long getDemand(FluidType type, int pressure)`; defaults for `getReceiverSpeed`, `getReceivingPressureRange`, `getFluidPriority` |
| `IFluidProviderMK2` | `void useUpFluid(FluidType type, int pressure, long amount)`, `long getFluidAvailable(FluidType type, int pressure)`; defaults for `getProviderSpeed`, `getProvidingPressureRange` |
| `IFluidStandardReceiverMK2` | implements the receiver from `FluidTankNTM[] getReceivingTanks()` |
| `IFluidStandardSenderMK2` | implements the provider from `FluidTankNTM[] getSendingTanks()` |
| `IFluidStandardTransceiverMK2` | both of the above |
| `IFluidConnectorBlockMK2` | for a block (a multiblock cell with no block entity): `canConnect(FluidType type, BlockGetter world, int x, int y, int z, ForgeDirection dir)` |

Pressure ranges from 0 to `IFluidUserMK2.HIGHEST_VALID_PRESSURE` (5).

### Power interfaces

| Interface | Methods |
|---|---|
| `IEnergyConnectorMK2` | `canConnect(ForgeDirection dir)`; default: any side but `UNKNOWN` |
| `IEnergyHandlerMK2` | `long getPower()`, `void setPower(long power)`, `long getMaxPower()`; defaults for `usePower`, `transferPower`, `getProviderSpeed`, `getReceiverSpeed`, `getPriority`, `allowDirectProvision` |
| `IEnergyReceiverMK2` | a handler that takes power; `getReceiverSpeed()` defaults to `getMaxPower()` |
| `IEnergyProviderMK2` | a handler that sends power; `getProviderSpeed()` defaults to `getMaxPower()` |
| `IEnergyConnectorBlock` | for a block: `canConnect(BlockGetter world, BlockPos pos, ForgeDirection dir)` (visual connection only); `isPort(connections, cell, dir)` helpers |

Priority is `IEnergyHandlerMK2.ConnectionPriority`: `LOWEST`, `LOW`, `NORMAL`, `HIGH`, `HIGHEST`.

### Ports

A machine's connection points are its ports. HBM's `com.hbm.tileentity.TileEntityLoadedBase` (the root of HBM's block
entities, and of `TileEntityMachineBase`) holds them. Connections are made when the machine is placed or a port's fluid
type changes; there are no per-tick subscriptions.

```java title="com/ntmspace/tileentity/atmosphere/TileEntityAirScrubber.java (shortened)"
public class TileEntityAirScrubber extends TileEntityMachineBase implements IFluidStandardSenderMK2, IEnergyReceiverMK2 {

    public final FluidTankNTM tank = new FluidTankNTM(Fluids.CARBONDIOXIDE, 16_000);
    private long power;
    private PortDef[] cachedPorts;

    public static void serverTick(Level level, BlockPos pos, BlockState state, TileEntityAirScrubber te) {
        te.setupAllPorts(te.getPorts());
        te.updatePortPIFIFO();
        // ... the machine's work
    }

    /** Power in and CO2 out on all six sides. */
    public PortDef[] getPorts() {
        if (cachedPorts == null) cachedPorts = TilePortShapes.around(worldPosition.getX(), worldPosition.getY(), worldPosition.getZ());
        return cachedPorts;
    }

    @Override public FluidTankNTM[] getAllTanks() { return new FluidTankNTM[] {tank}; }
    @Override public FluidTankNTM[] getSendingTanks() { return new FluidTankNTM[] {tank}; }
    @Override public long getPower() { return power; }
    @Override public void setPower(long power) { this.power = power; }
    @Override public long getMaxPower() { return 10_000; }
}
```

| `TileEntityLoadedBase` method | Does |
|---|---|
| `setupAllPorts(PortDef[] ports)` | power ports, plus fluid in and out ports where the tile is a standard receiver or sender; does nothing once set up |
| `setupPowerPorts(ports)` / `setupFluidPorts(ports)` | one kind only |
| `updatePortFIFO()` | updates ports, then receives into the receiving tanks and provides from the sending tanks |
| `updatePortPIFIFO()` | the same, plus power in |
| `updatePortPOFIFO()` | the same, plus power out |
| `destroyAllPorts()` | disables and drops every port (a machine that stops being a machine) |

`TilePort.PortDef` describes ports: `PortDef.make(x, y, z, dirs...)`, `atPos(...)`, `withCon(DirPos...)`, and
`PortDef.combine(...)`. `TilePortShapes` has HBM's common shapes, such as `around(x, y, z)` (all six sides),
`horizontal(x, y, z)` and `fromConnections(DirPos...)`.

### Other mods

Other mods' pipes reach HBM machines through `com.hbm.capability.ForeignFluids`, which exposes a machine's own
`getDemand`/`transferFluid` and `getFluidAvailable`/`useUpFluid` on each loader's fluid capability (Golem Core
`FluidExposure`), at pressure 0 only. It is registered for blocks in the `hbm` namespace only, so it does not cover an
addon's blocks. HBM's own duct network does not reach foreign tanks.
