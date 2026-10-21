---
title: PUREX, breeding, waste, exposure, cyclotron
description: The purex, breeder, storage_drum, exposure_chamber and cyclotron tables.
sidebar:
  order: 19
---

Tables for fuel reprocessing, breeding, waste decay, particle exposure and the cyclotron.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:purex` | PUREX | [generic](../common-fields/#generic-schema) | selector, saves `name` | 58 |
| `hbm:breeder` | Breeding Reactor (LEGACY) | own | input item; last in `order` wins | 31 |
| `hbm:storage_drum` | Nuclear Waste Disposal Drum | own | input item; first recipe id wins | 32 |
| `hbm:exposure_chamber` | Exposure Chamber | [generic](../common-fields/#generic-schema) | first match in `order` | 4 |
| `hbm:cyclotron` | Cyclotron | own | first match in `order` | 42 |

## purex

Generic schema, no extra fields. The player selects a recipe; PUREX saves its `name`. Its power buffer is sized from
the selected recipe (`power` × 100).

```json title="data/hbm/recipe/purex/watznaqadah.json (HBM)"
{
  "type": "hbm:purex",
  "name": "purex.watznaqadah",
  "input_items": [{ "ingredient": "hbm:watz_pellet_depleted_nqd" }],
  "input_fluids": [
    { "type": "hbm:kerosene", "amount": 500 },
    { "type": "hbm:nitric_acid", "amount": 250 }
  ],
  "output_items": [
    { "tag": "c:nuggets/naquadria", "count": 12 },
    { "id": "hbm:nugget_euphemium", "count": 6 },
    { "id": "hbm:nuclear_waste", "count": 2 }
  ],
  "output_fluids": [{ "type": "hbm:watz", "amount": 1000 }],
  "duration": 60,
  "power": 10000,
  "icon": { "id": "hbm:watz_pellet_depleted_nqd" },
  "name_wrapper": "purex.recycle",
  "auto_switch_group": "autoswitch.watz",
  "order": 48,
  "requires": ["#c:nuggets/naquadria"]
}
```

Notes:

- ZIRNOX and plate spent fuel must cool first: those rows use `{"type": "hbm:cold", "item": ...}`. PWR spent rods are
  matched with `"exact": true`.
- `name_wrapper: "purex.recycle"` titles the recipe "Reprocessing of" plus the icon's name.
- The fuel families share auto-switch groups (`autoswitch.plate`, `autoswitch.watz`, ...), so a PUREX set to one
  fuel switches to the matching row when you load another of the family.
- The two naquadah Watz rows exist only when another mod adds an item to `c:nuggets/naquadria`, as in 1.7.

## breeder

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | item id (string) | yes | | The item bred. A plain item id, not an ingredient object. |
| `output` | [item stack](../common-fields/#item-stacks) | yes | | The result. |
| `flux` | int | yes | | The flux needed; the reactor's progress per tick is scaled by the reactor flux divided by this. |
| `order` | int | no | after HBM's | Display order. |

```json title="data/hbm/recipe/breeder/meteorite_sword_etched.json (HBM)"
{
  "type": "hbm:breeder",
  "input": "hbm:meteorite_sword_etched",
  "output": "hbm:meteorite_sword_bred",
  "flux": 1000,
  "order": 30
}
```

One recipe per input item. With two rows for one item, the one that comes **last** in `order` wins, so a row of yours
without `order` replaces HBM's.

## storage_drum

The waste drum's decay table: each slot holding an input item turns into the output at random, and releases liquid
and gaseous waste.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | item output (`"id"` or `{"id", "count"}`) | yes | | The decaying item. |
| `output` | item output | yes | | What it decays into. |
| `decay` | `"long"` or `"short"` | yes | | Which decay time from the config applies. |
| `divisor` | int, at least 1 | no | `1` | Divides the decay time (faster decay). |
| `liquid` | int | no | `0` | Liquid waste released (mB). |
| `gas` | int | no | `0` | Gaseous waste released (mB). |

```json title="data/hbm/recipe/storage_drum/ingot_au198.json (HBM)"
{
  "type": "hbm:storage_drum",
  "input": "hbm:ingot_au198",
  "output": "hbm:nugget_mercury",
  "decay": "short",
  "divisor": 20
}
```

Every tick each slot rolls a 1 in N chance, N = decay time ÷ `divisor`. The decay times come from the config, as in
1.7: long is 3 hours (15 hours in 528 mode, 15 minutes with LBSM's shorter decay), short is 15 minutes (3 hours in 528
mode, 3 minutes with LBSM). The input matches by item and data; the first row for an item (recipe-id order) is used.

## exposure_chamber

Generic schema. Each row is one cycle: input 0 is the particle, input 1 the ingredient, and the first output item the
product.

```json title="data/hbm/recipe/exposure_chamber/uranium238.json (HBM)"
{
  "type": "hbm:exposure_chamber",
  "name": "exposure.uranium238",
  "input_items": [
    { "ingredient": "hbm:particle_higgs" },
    { "ingredient": "#c:ingots/u238" }
  ],
  "output_items": ["hbm:ingot_schrabidium"],
  "duration": 200,
  "power": 10000,
  "order": 1
}
```

Notes:

- The chamber's speed and energy use are its own (with upgrades); `duration` and `power` are shown in recipe viewers.
- One particle capsule is good for 8 cycles, so recipe viewers show each row with 8 times the ingredient and output,
  as 1.7 did. Write the row for **one** cycle.
- The schrabidate row has an `input_items_expensive` variant.
- The first row in `order` whose particle and ingredient match is used. Rows with fewer than two inputs or no output
  item are ignored.

## cyclotron

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `particle` | item id (string) | yes | | The particle item. |
| `input` | [ingredient](../common-fields/#ingredients) | yes | | The target. |
| `output` | item output (`"id"` or `{"id", "count"}`) | yes | | The product. |
| `antimatter` | int | yes | | mB of antimatter one conversion yields. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/cyclotron/beryllium_powder_cerium.json (HBM)"
{
  "type": "hbm:cyclotron",
  "particle": "hbm:part_beryllium",
  "input": { "ingredient": "hbm:powder_cerium" },
  "output": "hbm:powder_neodymium",
  "antimatter": 25,
  "order": 18
}
```

The particles themselves (`hbm:part_lithium`, `hbm:part_beryllium`, ...) are assembly machine recipes.
