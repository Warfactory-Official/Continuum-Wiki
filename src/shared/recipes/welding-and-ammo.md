---
title: Arc welder, soldering station, ammo press
description: The arc_welder, soldering and ammo_press tables.
sidebar:
  order: 17
---

Tables for the arc welder, the soldering station and the ammo press.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:arc_welder` | Arc Welder | own | first match in `order` | 42 |
| `hbm:soldering` | Soldering Station | own | first match in `order` | 43 |
| `hbm:ammo_press` | Ammo Press | own | player picks it; saves the recipe id | 90 |

All three accept the [Stirling engine ingredient](../common-fields/#stirling-engine) besides the normal
[ingredient](../common-fields/#ingredients) forms, and take [item stacks](../common-fields/#item-stacks) (with
`item_data`) as outputs.

## arc_welder

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `ingredients` | list of up to 3 ingredients | yes | | Unordered; counts are required amounts. |
| `fluid` | [fluid stack](../common-fields/#fluid-stacks) | no | none | Fluid used per operation. |
| `output` | item stack | yes | | The product. |
| `duration` | int | yes | | Ticks per operation. |
| `consumption` | long | yes | | HE per tick. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/arc_welder/fuel_tank_large.json (HBM)"
{
  "type": "hbm:arc_welder",
  "ingredients": [
    { "material": "aluminium", "shape": "weldedplate", "count": 8 },
    { "ingredient": "#c:plates/saturnite", "count": 12 },
    { "ingredient": "hbm:steel_scaffold", "count": 16 }
  ],
  "output": "hbm:fuel_tank_large",
  "duration": 200,
  "consumption": 5000,
  "order": 23
}
```

Matching: every filled input slot must be taken by one ingredient with enough items, and every ingredient must be
taken, in any order.

## soldering

The Soldering Station has three groups of input slots: three **toppings**, two **pcb** slots and one **solder** slot.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `output` | item stack | yes | | The product. |
| `duration` | int | yes | | Ticks per operation. |
| `consumption` | long | yes | | HE per tick. |
| `fluid` | fluid stack | no | none | Fluid used per operation. |
| `toppings` | list of up to 3 ingredients | no | none | For the three topping slots. |
| `pcb` | list of up to 2 ingredients | no | none | For the two board slots. |
| `solder` | list of up to 1 ingredient | no | none | For the solder slot. |
| `requires` | list of strings | no | none | [Config conditions](../common-fields/#requires). |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/soldering/circuit_advanced.json (HBM)"
{
  "type": "hbm:soldering",
  "output": "hbm:circuit_advanced",
  "duration": 300,
  "consumption": 1000,
  "fluid": { "type": "hbm:sulfuric_acid", "amount": 1000 },
  "toppings": [
    { "ingredient": "hbm:circuit_chip", "count": 16 },
    { "ingredient": "hbm:circuit_capacitor", "count": 4 }
  ],
  "pcb": [
    { "ingredient": "hbm:circuit_pcb", "count": 8 },
    { "ingredient": "#c:ingots/rubber", "count": 2 }
  ],
  "solder": [{ "material": "lead", "shape": "wire", "count": 8 }],
  "requires": ["!lbsm_simple_crafting"],
  "order": 2
}
```

Notes:

- Each group is matched as a set: every ingredient of the group needs its own slot of that group with enough items, in
  any order, and no slot of the group may hold anything else.
- What a slot group accepts is built from all rows, so an ingredient you list in `toppings` becomes insertable into the
  topping slots.
- HBM's tier II and III upgrades and control units carry `"requires": ["!enable_528"]` (in 528 mode the precision
  assembler makes them). LBSM's cheaper circuits are second rows with `lbsm_simple_crafting`.
- `requires` is re-tested when the config changes, without a reload.

## ammo_press

A positional 3 × 3 grid. The player selects a recipe in the press, and the press **saves the recipe id**
(`hbm:ammo_press/bmg50_ap`), not a name.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `output` | item stack | yes | | The product. |
| `grid` | list of exactly 9 slots | yes | | Row by row, top left first. Each slot is an ingredient, or `""` for a slot that must stay empty. |
| `order` | int | no | after HBM's | Selection screen order. |

```json title="data/hbm/recipe/ammo_press/flame_diesel.json (HBM)"
{
  "type": "hbm:ammo_press",
  "output": "hbm:ammo_standard_flame_diesel",
  "grid": [
    "", { "ingredient": "#c:plates/steel" }, "",
    "", { "type": "hbm:fluid_container", "fluid": "hbm:diesel", "amount": 1000 }, "",
    "", { "ingredient": "#c:plates/steel" }, ""
  ],
  "order": 71
}
```

Because presses save the recipe id, a datapack reload that adds or reorders rows never changes what a press makes.
Removing a row and adding a replacement under another id does: presses set to the old id lose their selection.
