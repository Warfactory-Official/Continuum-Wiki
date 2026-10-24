---
title: World
description: Block erosion by drill blasts, radiation decay of surface blocks, and the fluid deposits oil drills pump from.
sidebar:
  order: 9
---

Block-keyed maps that change what happens to the world. The [overview](../overview/) explains the file format. For
what fallout does to blocks, see [Fallout transform](../../data/fallout-transform/).

## erosion

`data/hbm/value_maps/block/erosion.json`. Registry: block. HBM ships 4 entries.

Value: a block id. What an eroding blast (the drill missile) leaves of the block.

```json title="data/hbm/value_maps/block/erosion.json"
{
  "values": {
    "hbm:concrete": "minecraft:gravel",
    "hbm:concrete_smooth": "minecraft:gravel",
    "hbm:brick_concrete": "hbm:brick_concrete_broken",
    "hbm:brick_concrete_broken": "minecraft:gravel"
  }
}
```

## radiation_decay

`data/hbm/value_maps/block/radiation_decay.json`. Registry: block. HBM ships no entries.

How radiation decays the surface blocks of a heavily irradiated area (1.7's `RadiationWorldHandler.decayBlock`). HBM's own rules for grass blocks,
grass and ferns, double plants and leaves stay in code. A block named in this map follows its value instead.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `to` | block state string | required | The block it becomes: an id, or an id with properties (`"minecraft:oak_log[axis=y]"`). `""` means the block does not decay. |
| `chance` | float | `1.0` | Chance (0 to 1) to become `to`; otherwise it becomes air. |

```json title="data/mypack/value_maps/patches/hbm/block/radiation_decay.json"
{
  "values": {
    "minecraft:moss_block": { "to": "minecraft:dirt", "chance": 0.5 },
    "#minecraft:leaves": { "to": "" }
  }
}
```

## fluid_deposit

`data/hbm/value_maps/block/fluid_deposit.json`. Registry: block. HBM ships 2 entries.

The deposit blocks the oil drills (oil derrick, pumpjack, fracking tower) draw from. Each drill keeps its own 1.7
amounts; a deposit names its fluids and scales those amounts.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `primary` | fluid id | required | Fills the drill's first tank. |
| `secondary` | fluid id | `minecraft:empty` | Fills the second tank. `minecraft:empty` for none. |
| `empty` | block id | none | The block a drained deposit becomes. Absent: it never drains. |
| `yield` | double | `1` | Scales the drill's primary amount. |
| `secondary_yield` | double | `yield` | Scales the drill's secondary amount. |
| `drain` | double | `1` | Scales the drill's chance to drain the deposit. |
| `fracking_only` | boolean | `false` | Only the fracking tower reaches it. |

Drills search through drained deposit blocks (any block named as an `empty`) to find live ones.

```json title="data/hbm/value_maps/block/fluid_deposit.json"
{
  "values": {
    "hbm:ore_oil": { "primary": "hbm:oil", "secondary": "hbm:gas", "empty": "hbm:ore_oil_empty" },
    "hbm:ore_bedrock_oil": { "primary": "hbm:oil", "secondary": "hbm:gas", "yield": 0.1, "fracking_only": true }
  }
}
```

A deposit can hold any fluid. For a brine deposit block from another mod:

```json title="data/hbm/value_maps/block/fluid_deposit.json"
{
  "values": {
    "othermod:brine_deposit": { "primary": "othermod:brine", "empty": "minecraft:stone", "yield": 0.5 }
  }
}
```

## fluid_deposit_states

`data/hbm/value_maps/block/fluid_deposit_states.json`. Registry: block. HBM ships no entries.

Deposits that differ by one block state property of a single block. A block with an entry here is looked up by its
state first; a property value without an entry falls back to [fluid_deposit](#fluid_deposit).

| Field | Type | Meaning |
|---|---|---|
| `property` | string | The block state property name. |
| `values` | object | Property value name to a [fluid_deposit](#fluid_deposit) value. |

A drained deposit keeps every property its `empty` block shares with it by name.

```json title="data/mypack/value_maps/patches/hbm/block/fluid_deposit_states.json"
{
  "values": {
    "othermod:planet_oil": {
      "property": "body",
      "values": {
        "duna": { "primary": "hbm:oil", "secondary": "hbm:gas", "empty": "othermod:planet_oil_empty" },
        "eve": { "primary": "hbm:gas", "empty": "othermod:planet_oil_empty", "yield": 2.0 }
      }
    }
  }
}
```
