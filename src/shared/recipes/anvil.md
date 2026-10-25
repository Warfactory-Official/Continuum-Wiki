---
title: Anvils
description: The anvil_smithing and anvil_construction tables, used by all of HBM's anvils.
sidebar:
  order: 18
---

The two tables behind every HBM anvil: two-slot smithing and the construction list.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:anvil_smithing` | every HBM anvil (smithing slots) | own | first match in `order` with a high enough tier | 29 |
| `hbm:anvil_construction` | every HBM anvil (construction list) | own | player picks it; the craft names the recipe id | 258 |

Both tables take [ingredients](../common-fields/#ingredients) (including the
[Stirling engine form](../common-fields/#stirling-engine)) and [item stacks](../common-fields/#item-stacks) with
`item_data`.

**Tiers.** Each anvil block has a tier, and a recipe needs an anvil of at least its `tier`. With
`LESS BULLSHIT MODE / LBSM_recipeUnlockAnvil` on (and LBSM on) every recipe of both tables is tier 1, applied when the
tables load.

## anvil_smithing

Two input slots, matched live as the player puts items in. The anvil uses the first row in `order` that matches
both slots and whose `tier` the anvil reaches.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `tier` | int | yes | | Lowest anvil tier. |
| `output` | item stack | yes | | The product. |
| `left` | ingredient | yes | | Left slot, with its count. |
| `right` | ingredient | yes | | Right slot, with its count. |
| `hot` | boolean | no | `false` | Both inputs must be hot (heated) items; the output takes their averaged heat. |
| `shapeless` | boolean | no | `false` | The two inputs may also be swapped. |
| `order` | int | no | after HBM's | Order in the anvil and recipe viewers. |

```json title="data/hbm/recipe/anvil_smithing/anvil_arsenic_bronze.json (HBM)"
{
  "type": "hbm:anvil_smithing",
  "tier": 1,
  "output": "hbm:anvil_arsenic_bronze",
  "left": { "ingredient": "hbm:anvil_iron" },
  "right": { "ingredient": "#c:ingots/arsenic_bronze", "count": 10 },
  "order": 5
}
```

Some smithing recipes are code, not rows, and cannot be removed: the dusted-steel folding chain, the casting molds,
cyanide and renaming. They sit at fixed positions in HBM's order (orders 18 to 27 and 39 to 57), so a row with an
`order` in those ranges sorts among them.

## anvil_construction

The browsable recipe list. The player crafts straight from their inventory, and the craft request names the recipe
by its **id** (`hbm:anvil_construction/chimney_brick`).

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `inputs` | list of ingredients | yes | | Taken from the player's inventory. |
| `outputs` | list of outputs (below) | yes | | Given to the player. |
| `tier` | int | yes | | Lowest anvil tier. |
| `tier_upper` | int | no | none | Highest anvil tier, for a recipe only lower anvils may do. |
| `overlay` | `none`, `construction`, `recycling` or `smithing` | no | by shape | The icon overlay in the list. |
| `requires` | list of strings | no | none | [Config conditions](../common-fields/#requires), tested when the table loads. |
| `order` | int | no | after HBM's | List order. |

An output is an object (not a bare string): `{"id", "count", "item_data", "chance"}`, where `chance` (0 to 1,
default 1) is the chance to get it.

Without `overlay`, it follows the shape: one input and one output is `smithing`, several inputs and one output
`construction`, one input and several outputs `recycling`, anything else `none`. A `recycling` row shows its input
as the icon.

```json title="data/hbm/recipe/anvil_construction/chimney_brick.json (HBM)"
{
  "type": "hbm:anvil_construction",
  "inputs": [
    { "ingredient": "#c:plates/steel", "count": 4 },
    { "ingredient": "minecraft:bricks", "count": 16 },
    { "ingredient": "hbm:steel_grate", "count": 2 }
  ],
  "outputs": [{ "id": "hbm:chimney_brick" }],
  "tier": 2,
  "order": 88
}
```

```json title="data/hbm/recipe/anvil_construction/recycle_chunk_ore_rare.json (HBM, shortened)"
{
  "type": "hbm:anvil_construction",
  "inputs": [{ "ingredient": "hbm:chunk_ore_rare" }],
  "outputs": [
    { "id": "hbm:fragment_boron" },
    { "id": "hbm:fragment_boron", "chance": 0.5 },
    { "id": "hbm:fragment_lanthanium", "chance": 0.1 }
  ],
  "tier": 2,
  "order": 203
}
```

HBM's assembly machine construction recipe is two rows, one with `"requires": ["expensive_mode"]` and one with
`"!expensive_mode"`, and the RBMK and research reactor dismantling rows need `"!enable_528"`.
