---
title: Armor and protection
description: Radiation resistance, gas mask protection classes, Faraday armor, full armor sets and damage resistance.
sidebar:
  order: 3
---

These maps hold 1.7's `HazmatRegistry`, `ArmorRegistry`, `ArmorUtil` and `DamageResistanceHandler` tables. The
[overview](../overview/) explains the file format.

## radiation_resistance

`data/hbm/value_maps/item/radiation_resistance.json`. Registry: item. HBM ships 124 entries.

Value: a double. The worn pieces' values are added up, and incoming radiation is multiplied by `10^-sum`. HBM's values
for a set are 1.7's set value split by slot: helmet 0.2, chestplate 0.4, leggings 0.3, boots 0.1 of the total.

```json title="data/hbm/value_maps/item/radiation_resistance.json (part)"
{
  "values": {
    "hbm:ajr_helmet": 0.26,
    "hbm:ajr_plate": 0.52,
    "hbm:ajr_legs": 0.39,
    "hbm:ajr_boots": 0.13
  }
}
```

Example: a full set with a total of 2.0 lets through 1% of radiation.

## protection_classes

`data/hbm/value_maps/item/protection_classes.json`. Registry: item. HBM ships 32 entries.

What a helmet, a gas mask filter or an armor module protects against. Value: a list of protection class names.
HBM's classes are `GAS_LUNG`, `GAS_MONOXIDE`, `GAS_INERT`, `PARTICLE_COARSE`, `PARTICLE_FINE`, `BACTERIA`,
`NERVE_AGENT`, `GAS_BLISTERING`, `SAND` and `LIGHT`; addon mods may add more. Fluid toxins and other hazards name these
classes (see [toxin](../../data/fluids/#toxin)).

```json title="data/hbm/value_maps/item/protection_classes.json (part)"
{
  "values": {
    "hbm:ajr_helmet": ["PARTICLE_COARSE", "PARTICLE_FINE", "GAS_LUNG", "BACTERIA", "GAS_BLISTERING", "GAS_MONOXIDE", "LIGHT", "SAND"]
  }
}
```

A gas mask's protection comes from its installed filter; the filter item is the one that needs the entry.

## faraday_armor

`data/hbm/value_maps/item/faraday_armor.json`. Registry: item. HBM ships no entries.

Value: a boolean. Whether a piece is conductive ("Faraday") armor. For items without an entry, HBM keeps 1.7's rule,
which looks for metal names in the item's id. `true` or `false` here overrides that rule.

```json title="data/mypack/value_maps/patches/hbm/item/faraday_armor.json"
{
  "values": {
    "othermod:copper_chestplate": true
  }
}
```

## armor_sets

`data/hbm/value_maps/item/armor_sets.json`. Registry: item. HBM ships 34 entries.

Full four-piece sets, keyed by the chestplate.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `helmet` | item id | none | The set's helmet. Absent: the helmet slot must be empty. |
| `legs` | item id | none | The set's leggings. Absent: that slot must be empty. |
| `boots` | item id | none | The set's boots. Absent: that slot must be empty. |
| `checks` | list of strings | empty | The set checks the full set passes: `hazmat`, `hazmat2`, `digamma`, `asbestos`. |
| `resistance` | resistance stats | none | The full set's damage resistance (format below). |

The checks are 1.7's full-set tests: `hazmat` (a full hazmat set, needed against `full_body` fluid toxins, mud,
cold items and more), `hazmat2` (heavy hazmat), `digamma` (digamma protection) and `asbestos` (protection from the
thermal blast).

```json title="data/hbm/value_maps/item/armor_sets.json (part)"
{
  "values": {
    "hbm:asbestos_plate": {
      "helmet": "hbm:asbestos_helmet",
      "legs": "hbm:asbestos_legs",
      "boots": "hbm:asbestos_boots",
      "checks": ["asbestos"],
      "resistance": { "category": { "FIRE": { "threshold": 10.0, "resistance": 0.9 } } }
    }
  }
}
```

## damage_resistance (items)

`data/hbm/value_maps/item/damage_resistance.json`. Registry: item. HBM ships 2 entries.

One piece's damage resistance, whether worn alone or as part of a set. Value: resistance stats.

```json title="data/hbm/value_maps/item/damage_resistance.json"
{
  "values": {
    "hbm:jackt": { "category": { "PHYS": { "threshold": 1.0, "resistance": 0.2 } } },
    "hbm:jackt2": { "category": { "PHYS": { "threshold": 2.0, "resistance": 0.25 } } }
  }
}
```

## damage_resistance (entity types)

`data/hbm/value_maps/entity_type/damage_resistance.json`. Registry: entity type. HBM ships 2 entries.

An entity's own damage resistance. Value: resistance stats.

```json title="data/hbm/value_maps/entity_type/damage_resistance.json"
{
  "values": {
    "minecraft:creeper": { "category": { "EXPL": { "threshold": 2.0, "resistance": 0.25 } } },
    "hbm:entity_mob_nuclear_creeper": { "category": { "EXPL": { "threshold": 5.0, "resistance": 0.35 } } }
  }
}
```

## Resistance stats

The format shared by `armor_sets`' `resistance` and both `damage_resistance` maps:

```json
{
  "category": { "PHYS": { "threshold": 4.0, "resistance": 0.15 }, "EXPL": { "threshold": 7.5, "resistance": 0.25 } },
  "exact": { "fall": { "resistance": 1.0 } },
  "other": { "resistance": 0.15 }
}
```

| Field | Meaning |
|---|---|
| `category` | By damage category: `EXPL` (explosions), `FIRE`, `PHYS` (projectiles, cactus and anything an entity deals), `EN` (lasers, plasma, microwave, subatomic, electric). |
| `exact` | By damage type message id (`fall`, `drown`, an addon mod's own type). For bullet damage `bullet_x`, an entry for `x` also matches. |
| `other` | Any other damage that armor can block. |

Each entry is `{"threshold", "resistance"}`, both floats defaulting to 0. For one hit, `exact` is checked first, then
`category`, then `other`. Damage at or below the `threshold` is blocked entirely; above it, the threshold is subtracted
and the rest is multiplied by `1 - resistance`. A `resistance` of 1.0 blocks the damage completely. The worn set, the
worn pieces and the entity's own stats are added together. Some weapons pierce part of the threshold and resistance.

## lockpick_jacket

`data/hbm/value_maps/item/lockpick_jacket.json`. Registry: item. HBM ships 2 entries.

Value: a boolean. A chestplate with `true` multiplies the chance to pick a lock a hundredfold.

```json title="data/hbm/value_maps/item/lockpick_jacket.json"
{
  "values": {
    "hbm:jackt": true,
    "hbm:jackt2": true
  }
}
```
