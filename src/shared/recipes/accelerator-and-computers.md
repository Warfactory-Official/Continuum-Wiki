---
title: Accelerator, annihilator, supercomputer, space lab
description: The particle_accelerator, annihilator, supercomputer and space_assembler tables.
sidebar:
  order: 23
---

Tables for the particle accelerator, the annihilator, the supercomputer and the Space Laboratory.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:particle_accelerator` | Particle accelerator (Particle Detector) | own | first match in `order` | 11 |
| `hbm:annihilator` | Annihilator | own | item, tag or fluid key; rows add up | 16 |
| `hbm:supercomputer` | Supercomputer | [generic](../common-fields/#generic-schema) | selector, saves `name` | 18 |
| `hbm:space_assembler` | Space Laboratory - 0G Assembler | [generic](../common-fields/#generic-schema) | first row whose single input matches | 1 |

## particle_accelerator

The collision table of the particle accelerator: two particles and a minimum momentum in, one or two items out.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input1` | [ingredient](../common-fields/#ingredients) | yes | | One particle. |
| `input2` | ingredient | yes | | The other particle. The two match in either order. |
| `momentum` | int | yes | | The particle must arrive with at least this momentum. |
| `output1` | [item stack](../common-fields/#item-stacks) | yes | | First product. |
| `output2` | item stack | no | none | Second product. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/particle_accelerator/particle_amat.json (HBM)"
{
  "type": "hbm:particle_accelerator",
  "input1": { "ingredient": "hbm:particle_hydrogen" },
  "input2": { "ingredient": "hbm:particle_copper" },
  "momentum": 300,
  "output1": "hbm:particle_amat",
  "order": 0
}
```

HBM keeps 1.7's joke row: two chickens at momentum 100 give two `hbm:nugget`.

## annihilator

The Annihilator destroys what it is fed and counts, per key, how much it has swallowed. When a running total passes a
milestone, it pays out an item. A key is one item, one item tag or one fluid.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `item` | item id | one of `item` / `tag` / `fluid` | | Count this item. |
| `tag` | item tag id, **without `#`** | one of the three | | Count every item in this tag. |
| `fluid` | fluid id | one of the three | | Count this fluid. |
| `milestones` | list of `{"amount", "payout"}` | yes | | `amount` is a long; `payout` an [item stack](../common-fields/#item-stacks). |
| `requires` | list of strings | no | none | [Config conditions](../common-fields/#requires), tested when the table loads. |

A row names exactly one of `item`, `tag` and `fluid`.

```json title="data/hbm/recipe/annihilator/billets_uranium.json (HBM)"
{
  "type": "hbm:annihilator",
  "tag": "c:billets/uranium",
  "milestones": [
    {
      "amount": 256,
      "payout": { "id": "hbm:blueprints", "item_data": { "blueprint_pool": "528.gascent" } }
    }
  ],
  "requires": ["enable_528"]
}
```

Notes:

- Rows with the same key **add** their milestones together. To give one of HBM's keys another milestone, add a file of
  your own with the same key; you do not need to remove HBM's.
- When one batch passes several milestones, the highest one pays out.
- Every 1.7 milestone is a 528-mode blueprint, so all of HBM's rows have `"requires": ["enable_528"]` and the table is
  empty on a default config.
- An item is counted under each of its tags and under the item itself.

## supercomputer

Generic schema, no extra fields. The player picks a row in the machine's selector, and the Supercomputer saves its
`name`; `power` × 100 sizes its energy buffer. The Supercomputer runs simulations and processes data drives, often with a weighted
choice between a finished and a broken drive, and with a coolant fluid in and out.

```json title="data/hbm/recipe/supercomputer/blueprints.json (HBM)"
{
  "type": "hbm:supercomputer",
  "name": "com.blueprints",
  "input_items": [
    { "ingredient": "minecraft:paper", "count": 16 },
    { "ingredient": "#c:dyes/blue", "count": 16 }
  ],
  "output_items": [
    [
      { "data": "hbm:blueprint_folder", "weight": 20 },
      { "data": { "id": "minecraft:paper", "count": 16 }, "weight": 80 }
    ]
  ],
  "duration": 18000,
  "power": 50000,
  "order": 15
}
```

HBM's drive-processing rows come in threes per job, one per coolant (`_water` with water, `_pfm` with cold
perfluoromethyl, `_helium` with helium-4): the better the coolant, the shorter the time and the lower the success
weight. The copy rows use `name_wrapper: "com.copy"` ("Copy of ...").

## space_assembler

Generic schema, no extra fields. The Space Laboratory satellite's 0G assemblers take orbital assemblies sent up on
its frequency and finish them, first in, first out. A row needs **exactly one** item input, matched without its count;
the assembler takes `duration` (divided by the number of assemblers) and gives the outputs.

HBM's only row, `space.crystalcircuit`, turns an `hbm:orbital_assembly_crystal_circuit` into an
`hbm:circuit_crystal` in 3 minutes (3600 ticks).
