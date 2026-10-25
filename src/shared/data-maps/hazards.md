---
title: Hazards and radiation
description: The item hazard map, the hazard multiplier, fluid cell hazards and hazard block radiation.
sidebar:
  order: 2
---

These maps decide which items are radioactive, hot, blinding or otherwise dangerous to hold, and how much radiation
HBM's hazard blocks give off. The [overview](../overview/) explains the file format.

## hazards

`data/hbm/value_maps/item/hazards.json`. Registry: item. HBM ships 693 entries, 148 of them tags.

The hazards an item carries in an inventory, on the ground or worn. These are 1.7's `HazardRegistry` values.

```json title="data/hbm/value_maps/item/hazards.json (part)"
{
  "values": {
    "#c:dusts/coal": { "entries": [{ "type": "hbm:coal", "level": 3.0 }] },
    "#c:ingots/uranium": { "mutex": 1, "entries": [{ "type": "hbm:radiation", "level": 0.35 }] },
    "hbm:ingot_pu238": {
      "mutex": 1,
      "entries": [{ "type": "hbm:radiation", "level": 10.0 }, { "type": "hbm:hot", "level": 3.0 }]
    },
    "hbm:pellet_rtg_gold": {
      "entries": [
        { "type": "hbm:radiation", "level": 750.0, "modifiers": [{ "type": "hbm:rtg_radiation", "target": 0.0 }] },
        { "type": "hbm:hot", "level": 5.0 }
      ]
    }
  }
}
```

Value fields:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `entries` | list | empty | The hazards. |
| `mutex` | integer | `0` | Bit mask. A value whose bits overlap the bits of a value applied before it is skipped. |
| `override` | boolean | `false` | When `true`, this value clears every hazard applied before it. |
| `immune` | boolean | `false` | When `true`, an item matched by this value has no hazards at all (1.7's hazard blacklist). |

Each entry:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `type` | string | required | The hazard type: `hbm:radiation`, `hbm:contaminating`, `hbm:digamma`, `hbm:hot`, `hbm:blinding`, `hbm:asbestos`, `hbm:coal`, `hbm:hydroactive`, `hbm:explosive`, `hbm:toxic`, `hbm:cold`, or an addon mod's type. |
| `level` | double | `1.0` | The strength. For `hbm:radiation` it is rads per second for each item in the stack. |
| `modifiers` | list | empty | Modifiers that change the level from the item's state, applied in order. |

Modifiers, each an object with a `type`:

| Type | Fields | Use |
|---|---|---|
| `hbm:rbmk_radiation` | `target` (double), `linear` (boolean, default `false`) | Depleted RBMK fuel's radiation curve, with xenon. |
| `hbm:rbmk_hot` | none | RBMK rod heat. |
| `hbm:fuel_radiation` | `target` (double) | Radiation from fresh to depleted fuel. |
| `hbm:rtg_radiation` | `target` (double) | Radiation that falls with an RTG pellet's remaining life. |
| `hbm:hot_scale` | `cold_factor` (double) | Scales the entry down while a spent plate is not hot. |

### How an item's hazards are put together

Unlike other maps, every matching value applies, not just the best one:

1. Every tag value the item matches, in the order the tags were given in the files.
2. The item's own value.

Going through that list, an `override` value clears what came before, and a value whose `mutex` bits overlap an
earlier value's is skipped. HBM's uranium items use `mutex: 1` on both the tag and the item, so an item in
`#c:ingots/uranium` with its own value is not counted twice.

An `immune` value on the item or on any matching tag removes every hazard.

`hbm:contaminating` entries only apply while ground contamination is on. Continuum has no `hbm.cfg` key for it and keeps
it off, so these entries currently have no effect.

### Example: make another mod's item radioactive

```json title="data/hbm/value_maps/item/hazards.json"
{
  "values": {
    "othermod:glowing_rock": { "entries": [{ "type": "hbm:radiation", "level": 5.0 }] }
  }
}
```

Or put the item in a `c:` tag HBM already lists, such as `#c:ingots/uranium` (see [Tags](../../data/tags/)).

### Containers

A toolbox is as radioactive as everything in it together. The containment box lets through only part of its
contents' radiation: the square root of the total, roughly. Other containers, such as crates, do not pass their
contents' radiation on.

## hazard_multiplier

`data/hbm/value_maps/item/hazard_multiplier.json`. Registry: item. HBM ships no entries.

Value: a double. Every hazard level the item carries is multiplied by it. A multiplier an addon mod sets in code wins
over this map.

```json title="data/mypack/value_maps/patches/hbm/item/hazard_multiplier.json"
{
  "values": {
    "hbm:ingot_u235": 0.5
  }
}
```

## cell_hazards

`data/hbm/value_maps/fluid/cell_hazards.json`. Registry: fluid. HBM ships 2 entries.

The hazards of a filled fluid cell (`hbm:cell`), keyed by the fluid in it. The value has the same shape as a
[hazards](#hazards) value.

```json title="data/hbm/value_maps/fluid/cell_hazards.json (part)"
{
  "values": {
    "hbm:sas3": {
      "entries": [{ "type": "hbm:radiation", "level": 5.0 }, { "type": "hbm:blinding", "level": 60.0 }]
    }
  }
}
```

## radiation_emission

`data/hbm/value_maps/block/radiation_emission.json`. Registry: block. HBM ships 29 entries.

The radiation of HBM's hazard blocks (storage blocks of radioactive materials, waste blocks and the like). It only
applies to those blocks.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `radiation` | float | `0` | Radiation fed into the chunk. The chunk receives a tenth of it per tick, up to the full value. |
| `area` | float | `0` | A radiation pulse to nearby entities once per second. |

```json title="data/hbm/value_maps/block/radiation_emission.json (part)"
{
  "values": {
    "hbm:block_actinium": { "radiation": 300.0 },
    "hbm:block_au198": { "radiation": 5000.0 }
  }
}
```
