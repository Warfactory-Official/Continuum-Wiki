---
title: Assembly machines
description: The assembly_machine and precision_assembler tables, used by the Assembly Machine, the Assembly Factory and the Precision Assembly Machine.
sidebar:
  order: 10
---

The tables of the three assembly machines.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:assembly_machine` | Assembly Machine, Assembly Factory | [generic](../common-fields/#generic-schema) | selector, saves `name` | 342 |
| `hbm:precision_assembler` | Precision Assembly Machine | [generic](../common-fields/#generic-schema) | selector, saves `name` | 52 |

Both tables use the generic schema with no extra fields. The player picks a recipe in the machine's selector, so
`order` is the selector order. The machines save the recipe's `name`.

## assembly_machine

```json title="data/hbm/recipe/assembly_machine/acidizer.json (HBM, shortened)"
{
  "type": "hbm:assembly_machine",
  "name": "ass.acidizer",
  "input_items": [
    { "material": "steel", "shape": "weldedplate", "count": 2 },
    { "material": "titanium", "shape": "shell", "count": 3 },
    { "ingredient": "#c:ingots/desh", "count": 4 },
    { "ingredient": "hbm:motor" },
    { "ingredient": "hbm:circuit_basic", "count": 2 }
  ],
  "output_items": ["hbm:machine_crystallizer"],
  "duration": 200,
  "power": 100,
  "order": 90,
  "input_items_expensive": [
    { "ingredient": "hbm:item_expensive_heavy_frame", "count": 2 },
    { "material": "titanium", "shape": "shell", "count": 3 },
    { "ingredient": "hbm:motor" },
    { "ingredient": "hbm:item_expensive_circuit" }
  ]
}
```

Notes:

- **Blueprints.** Rows with `blueprint_pools` need a blueprint of that pool in the machine. HBM's pools here include
  `alt.plates` (alternative plate recipes), `discover.*` and `secret.*` pools, and, through `blueprint_pools_528`, the
  `528.*` pools that only apply in 528 mode. For example `assembly_machine/arty.json` has
  `"blueprint_pools_528": ["528.arty"]`: outside 528 mode it needs no blueprint.
- **Expensive mode.** 84 rows have `input_items_expensive` and one has `input_fluids_expensive`.
- **528 mode.** The overdrive upgrades only exist outside 528 mode (`"requires": ["!enable_528"]`); in 528 mode the
  precision assembler makes them.
- **Auto-switch.** The cyclotron particle recipes share `auto_switch_group: "autoswitch.cyclotron"`, so a machine set
  to one of them switches to whichever particle's input you load.

### Fluid packs (rule rows)

On top of the data rows, the table adds a pair of recipes for every fluid the fluid pack can hold, as 1.7 did: fill an
empty `hbm:fluid_pack_empty` with 32,000 mB of the fluid, and empty a full pack again (40 ticks, 100 HE/t). They are
named `ass.packagehbmfluid.<fluid>` and `ass.unpackagehbmfluid.<fluid>` and are inserted right after the row named
`ass.emptypackage` (at the end if that row is removed). Fluids that addon mods register get their pair too; fluids
that cannot go in a container (the [`nocontainer` flag](../../data/fluids/#flags)) get none. These rows are
not recipe files and cannot be removed with a removal list.

## precision_assembler

```json title="data/hbm/recipe/precision_assembler/atomic_clock.json (HBM)"
{
  "type": "hbm:precision_assembler",
  "name": "precass.atomic_clock",
  "input_items": [
    { "ingredient": "hbm:circuit_chip", "count": 8 },
    { "ingredient": "#c:ingots/any_plastic", "count": 4 },
    { "material": "zirconium", "shape": "wire", "count": 8 },
    { "ingredient": "#c:dusts/strontium" }
  ],
  "output_items": [
    [
      { "data": "hbm:circuit_atomic_clock", "weight": 50 },
      { "data": { "id": "hbm:broken_item", "item_data": { "broken_item": "hbm:circuit_atomic_clock" } }, "weight": 50 }
    ]
  ],
  "duration": 200,
  "power": 2000,
  "blueprint_pools": ["528.strontium"],
  "order": 6,
  "requires": ["enable_528"]
}
```

Notes:

- Most rows are 1.7's 528-mode circuits and upgrades and carry `"requires": ["enable_528"]`; on a default config the
  table only holds the two blueprint folder recipes.
- A product is a weighted choice between the item and its broken form, `hbm:broken_item` with
  `item_data.broken_item`.
- Each product has a `.recycle` row that takes the broken item (an `exact` ingredient with that `broken_item`) and
  returns the inputs with a `chance`. Where 1.7 lowered the chances in expensive mode, the row exists twice: one file
  with `"!expensive_mode"` and one with `"expensive_mode"`, sharing a `name`.
