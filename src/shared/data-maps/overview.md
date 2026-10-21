---
title: Data maps
description: The value_maps format, how copies and patches merge, and which pages document each of HBM's maps.
sidebar:
  order: 1
  label: Overview
---

A data map attaches a value to registry entries: a radiation level to an item, a fuel value to a fluid, a
damage resistance to an entity type. HBM keeps most of 1.7's per-item tables this way, so a datapack can change them.
The format is NeoForge's data-map format, and Golem Core provides it on every loader and Minecraft version.

## Where the files go

```
data/<map namespace>/value_maps/<registry>/<map>.json
```

The map `hbm:hazards` over items is `data/hbm/value_maps/item/hazards.json`. The registry folder is `item`, `block`,
`fluid` or `entity_type`; HBM has one map keyed by material name, under `material`. The folder names are the same on
every Minecraft version.

## File format

```json title="data/hbm/value_maps/item/hazards.json (a datapack's copy)"
{
  "replace": false,
  "values": {
    "#c:ingots/uranium": { "mutex": 1, "entries": [{ "type": "hbm:radiation", "level": 0.35 }] },
    "hbm:ingot_pu238": {
      "mutex": 1,
      "entries": [{ "type": "hbm:radiation", "level": 10.0 }, { "type": "hbm:hot", "level": 3.0 }]
    }
  },
  "remove": ["hbm:ingot_u235"]
}
```

| Field | Type | Meaning |
|---|---|---|
| `replace` | boolean, optional | `true` drops every value that lower-priority copies of this file gave. Default `false`. |
| `values` | object, optional | Keys are an entry id (`"hbm:ingot_pu238"`) or a tag (`"#c:ingots/uranium"`). The value's shape depends on the map. |
| `remove` | list, optional | Entry ids or `#tags` to take away from what lower-priority copies gave. |

Inside one file, `replace` is applied first, then `values`, then `remove`. A `remove` or `replace` only affects what
was loaded before it, so a later file can add the entry back.

A value that does not decode is skipped with a log line (`Data map hbm:hazards: skipping <key>: <reason>`); the rest of
the file still loads.

## How copies merge

Every pack's copy of a map file is read, lowest priority first, the same way vanilla tags merge. So HBM's jar, an
addon mod and a server datapack can all add to one map without one file replacing another. A later copy that names the
same key overrides its value.

When the game looks up an entry:

1. The entry's own id wins.
2. Otherwise, the tags are tried from the last one given to the first, and the first that holds the entry wins. A
   tag keeps the place where it was first given: a later file that gives it a new value changes the value, not the
   place.
3. Otherwise there is no value, and the code's default applies (often 1.7's own rule for unlisted items).

The [hazards](../hazards/#hazards) map is an exception: every tag that matches applies, plus the item's own value.

To add an entry, ship a file at the map's path with only your values:

```json title="data/hbm/value_maps/item/difurnace_fuel.json"
{
  "values": {
    "minecraft:blaze_rod": 400
  }
}
```

## Patching another mod's map

A copy at the map's own path merges in pack order. Pack order between mods is not the same on every loader (Fabric
1.20.1 serves all mods as one pack, in mod list order). So when a mod or a modpack changes another mod's values,
especially with `remove` or by overriding a value, it should ship a patch in its own namespace:

```
data/<your ns>/value_maps/patches/<map namespace>/<registry>/<map>.json
```

The format is the same. Patches apply after every copy of the map's own file, sorted by the patching namespace, each
namespace's copies lowest priority first. A `remove` or an overridden value in a patch therefore always wins over the
map's own files.

```json title="data/mypack/value_maps/patches/hbm/item/difurnace_fuel.json"
{
  "values": {
    "minecraft:feather": 50
  },
  "remove": ["hbm:briquette_wood"]
}
```

## When values are read

HBM reads a map value at the moment it needs it, so a `/reload` changes behaviour at once. The bundled values are
loaded when the game starts, so menus and tooltips have them before a world is open. Each datapack load replaces them
with the merged values of all packs, and clients receive the same values.

Many maps only describe items of a matching kind. An `rbmk_fuel` value on an item that is not an RBMK fuel rod does
nothing, for example. A datapack can change the values of existing items; a new fuel rod item needs an addon mod.

## HBM's maps

| Page | Maps |
|---|---|
| [Hazards and radiation](../hazards/) | `item/hazards`, `item/hazard_multiplier`, `fluid/cell_hazards`, `block/radiation_emission` |
| [Armor and protection](../armor/) | `item/radiation_resistance`, `item/protection_classes`, `item/faraday_armor`, `item/armor_sets`, `item/damage_resistance`, `entity_type/damage_resistance`, `item/lockpick_jacket` |
| [Reactor fuels](../reactor-fuels/) | `item/rbmk_fuel`, `item/pwr_fuel`, `item/zirnox_fuel`, `item/watz_pellet`, `item/pile_rod`, `item/rtg_pellet`, `item/betavoltaic`, `item/plate_fuel`, `item/research_reactor_fuel`, `item/radgen_fuel`, `fluid/icf_fuel`, `material/icf_fuel` |
| [Machine parts](../machine-parts/) | `item/pa_coil`, `item/drill_bit`, `item/piston`, `item/machine_upgrade`, `item/plasma_forge_booster`, `item/battery_pack` |
| [Fuels and containers](../fuels-and-containers/) | `item/fuel_category`, `item/difurnace_fuel`, `item/brick_furnace_speed`, `fluid/autosaw_fuel`, `fluid/gas_turbine_fuel_consumption`, `item/fluid_container`, `fluid/fluid_containers` |
| [World](../world/) | `block/erosion`, `block/radiation_decay`, `block/fluid_deposit`, `block/fluid_deposit_states` |
| [Weapons and satellites](../weapons-and-satellites/) | `item/custom_nuke`, `fluid/custom_nuke`, `item/satellite` |

The [data map reference](../../reference/data-maps/) lists them all in one table. HBM's own files, with every value,
are in the NTM - Continuum jar under `data/hbm/value_maps/`.
