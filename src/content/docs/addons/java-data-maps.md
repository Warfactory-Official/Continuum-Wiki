---
title: Data maps in Java
description: "Declaring your own data maps with Golem Core's DataMaps, reading HBM's maps from Java, and patching another mod's map from an addon."
sidebar:
  order: 10
---

A data map attaches values to registry entries as data (NeoForge's data-map format, on every loader and version). The
file format and HBM's maps are described in the [Data maps](../data-maps/overview/) section. This page covers the Java
side.

## Declaring a map

```java
// dev.golem.core.data.DataMaps
public static <T, V> DataMap<T, V> map(Class<?> owner, String namespace, String path, String registryPath,
                                       Supplier<? extends Registry<T>> registry, Codec<V> codec)
```

The map `<namespace>:<path>` covers `registry` (for example `() -> BuiltInRegistries.ITEM`, registry path `"item"`),
and its files are `data/<namespace>/value_maps/<registryPath>/<path>.json`. `owner` is any class of your mod: your own
file is read from your jar at once, so the values exist before any world (menus, tooltips). Every datapack load then
replaces them with the merged datapack values, and clients receive the same files. Call it at mod construction; a map
declared twice throws.

HBM declares its maps the same way:

```java title="com/hbm/api/data/HbmDataMaps.java (shortened)"
private static <V> DataMap<Item, V> item(String name, Codec<V> codec) {
    return DataMaps.map(HbmDataMaps.class, Constants.MOD_ID, name, "item", () -> BuiltInRegistries.ITEM, codec);
}

public static final DataMap<Item, Integer> BRICK_FURNACE_SPEED = item("brick_furnace_speed", Codec.INT);
```

## Reading a map

| `DataMap<T, V>` member | Does |
|---|---|
| `get(T entry)` | the value: the entry's own id first, then the last tag given that holds it; null if none |
| `byId()` | every value given to an entry id, in file order |
| `byTag()` | every value given to a tag, in the order they apply |
| `changed` | a `Hook<Runnable>` fired after the values changed (datapack load, client sync) |
| `id()`, `namespace()`, `path()`, `registryPath()`, `codec()` | the map's identity |

Read at use time and never cache a value across a reload; rebuild derived indexes from `changed`.

```java title="com/hbm/tileentity/machine/TileEntityFurnaceBrick.java"
Integer speed = HbmDataMaps.BRICK_FURNACE_SPEED.get(inventory.getStackInSlot(0).getItem());
```

HBM's maps are public constants in `com.hbm.api.data`: `HbmDataMaps`, `HazardDataMaps`, `ArmorDataMaps`,
`ReactorDataMaps`, `WorldDataMaps`, `FluidDataMaps`, `SatelliteDataMaps`, `MachineDataMaps`, `DiFurnaceDataMaps`,
`MachinePartDataMaps` and `DepositDataMaps`. Fluid maps are keyed by vanilla `Fluid`; for an HBM `FluidType` use
`FluidType.getFluid()`.

## Merging and patching

Every pack's copy of a map's file merges, lowest priority first. An entry's own id beats a tag; among tags, the last one
given wins. `"replace": true` drops what lower packs gave; `"remove"` takes entries away.

An addon that changes **another mod's** map ships a patch in its own namespace instead of a file at the other mod's path:
`data/<own ns>/value_maps/patches/<map ns>/<registry>/<map>.json`, same format. Patches apply after every copy of the
map's own file, by patch namespace (sorted), so a `remove` or an overridden value always wins. A file at the other mod's
path depends on pack order, which Fabric 1.20.1 does not tie to mod dependencies.

## Writing map files in Java

`dev.golem.core.data.DataMapSource<V>` is a [data source](../recipes-and-data/#other-data-folders) for one map file:

```java
protected DataMapSource(DataMaps.DataMap<?, V> map, boolean patch)   // patch: your patch of another mod's map
protected abstract void values();
protected final void put(String entry, V value);                       // an id or "#tag"
protected final void removeEntry(String entry);
protected final void replace();
```

Values are encoded with the map's own codec. NTM: Space patches HBM's fluid container colours:

```java title="com/ntmspace/recipes/data/SpaceFluidContainers.java (shortened)"
public static final class Colors extends DataMapSource<Containers> {

    public Colors() {
        super(FluidDataMaps.FLUID_CONTAINERS, true);
    }

    @Override
    protected void values() {
        put("ntmspace:hydrazine", new Containers(Optional.of(0x31517D), Optional.empty(), Optional.empty()));
        put("ntmspace:neon", new Containers(Optional.empty(), Optional.of(0xF1F600), Optional.of(0x303030)));
    }
}
```

This writes `data/ntmspace/value_maps/patches/hbm/fluid/fluid_containers.json`. List the source in your `DataSources`.
