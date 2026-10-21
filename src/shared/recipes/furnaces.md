---
title: Furnaces
description: The blast_furnace, difurnace, combination, rotary_furnace and arc_furnace tables.
sidebar:
  order: 15
---

Tables for the heated furnaces, from the alloy furnaces to the arc furnace's molten output.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:blast_furnace` | Blast Furnace | [generic](../common-fields/#generic-schema) | first match in `order` | 15 |
| `hbm:difurnace` | Blast Furnace (LEGACY), Nuclear Blast Furnace (LEGACY) | [generic](../common-fields/#generic-schema) | first match in `order` | 14 |
| `hbm:combination` | Combination Furnace | own | first match in `order` | 53 |
| `hbm:rotary_furnace` | Rotary Furnace | own | first match in `order` | 12 |
| `hbm:arc_furnace` | Electric Arc Furnace | own | first row in `order` per input and mode | 79 |

## blast_furnace

The airblast Blast Furnace. Generic schema, no extra fields. The furnace uses rows with **exactly two** item inputs,
matched in either slot order and with their counts, and at most two item outputs. `duration` is in ticks; `power` is
not used (the furnace burns fuel and makes flue gas).

```json title="data/hbm/recipe/blast_furnace/firebrick.json (HBM)"
{
  "type": "hbm:blast_furnace",
  "name": "blast.firebrick",
  "input_items": [
    { "ingredient": "#c:dusts/aluminium" },
    { "ingredient": "minecraft:clay_ball", "count": 7 }
  ],
  "output_items": [{ "id": "hbm:ingot_firebrick", "count": 8 }],
  "duration": 800,
  "order": 13
}
```

The first matching row in `order` wins.

## difurnace

The legacy fuel-fired alloy furnace (1.7's `BlastFurnaceRecipes`), a separate machine from the Blast Furnace above.
Generic schema, no extra fields. Like the blast furnace it uses rows with exactly two item inputs, in either slot order,
with their counts, and the first output item. Its processing time is fixed by the machine, so `duration` does not
change it. The first matching row in `order` wins.

```json title="data/hbm/recipe/difurnace/steelfromcoke.json (HBM)"
{
  "type": "hbm:difurnace",
  "name": "difurnace.steelFromCoke",
  "input_items": [
    {
      "type": "hbm:any_of",
      "of": [
        { "ingredient": "#c:ingots/iron" },
        { "ingredient": "#c:plates/iron" },
        { "ingredient": "#c:gems/iron" },
        { "ingredient": "#c:dusts/iron" }
      ]
    },
    { "ingredient": "#c:cokes" }
  ],
  "output_items": ["hbm:ingot_steel"],
  "duration": 400,
  "order": 1
}
```

Notes:

- 1.7's "any form of this material" ingredient is `hbm:any_of`; its gasoline canister is
  `{"type": "hbm:fluid_item", "item": "hbm:canister_full", "fluid": "hbm:gasoline"}` (see `difurnace/napalm.json`).
- The furnace's fuels are not recipes. They are the item data map `hbm:difurnace_fuel`.
- The row named `difurnace.meteorSword` is hidden from recipe viewers, as 1.7 hid it.

## combination

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [ingredient](../common-fields/#ingredients) (or the Stirling form) | yes | | What is heated. |
| `item_output` | [item stack](../common-fields/#item-stacks) | no | none | Item product. |
| `fluid_output` | [fluid stack](../common-fields/#fluid-stacks) | no | none | Fluid product. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/combination/briquette_coal.json (HBM)"
{
  "type": "hbm:combination",
  "input": { "ingredient": "hbm:briquette_coal" },
  "item_output": "hbm:coke_coal",
  "fluid_output": { "type": "hbm:coalcreosote", "amount": 150 },
  "order": 2
}
```

Both outputs are optional, but the furnace refuses a row without an item output (HBM keeps 1.7's sodium-dust row
that way).

## rotary_furnace

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `inputs` | list of up to 3 [ingredients](../common-fields/#ingredients) | no | none | Unordered; counts are required amounts. |
| `fluid` | [fluid stack](../common-fields/#fluid-stacks) | no | none | Fluid the tank must hold (matched by type). |
| `output` | [material stack](../common-fields/#material-stacks) | yes | | Molten metal produced. |
| `duration` | int | yes | | Ticks per operation. |
| `steam` | int | yes | | Steam drawn per tick. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/rotary_furnace/aluminium.json (HBM)"
{
  "type": "hbm:rotary_furnace",
  "fluid": { "type": "hbm:sodium_aluminate", "amount": 150 },
  "output": { "material": "aluminium", "amount": 144 },
  "duration": 100,
  "steam": 400,
  "order": 10
}
```

Matching as in 1.7: every non-empty input slot must be taken by exactly one ingredient (with enough items), and every
ingredient must be taken, in any slot order. A row with fewer ingredients does not match while extra slots hold
items.

## arc_furnace

The Electric Arc Furnace has a solid mode and a liquid mode. A row can serve either or both.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [ingredient](../common-fields/#ingredients) | yes | | What is melted. |
| `solid_output` | item output (`"id"` or `{"id", "count"}`) | one of the two outputs | none | Result in solid mode. |
| `molten_outputs` | list of [material stacks](../common-fields/#material-stacks) | one of the two outputs | none | Result in liquid mode. |
| `order` | int | no | after HBM's | Order of the rows. |

A row needs `solid_output`, `molten_outputs` or both.

```json title="data/hbm/recipe/arc_furnace/minecraft_flint.json (HBM)"
{
  "type": "hbm:arc_furnace",
  "input": { "ingredient": "minecraft:flint" },
  "solid_output": { "id": "hbm:nugget_silicon", "count": 4 },
  "molten_outputs": [{ "material": "silicon", "amount": 36 }],
  "order": 1
}
```

**How the list is built.** The rows are taken in `order`. For each mode, the first row for an input claims it; a
later row with the same input (same item, or same tag) is dropped for that mode, as 1.7 did. After the rows, three
rules in code add more, again only for inputs not yet claimed:

1. every material shape whose `c:` tag has an item melts into its material (liquid mode), for every smeltable
   material;
2. every item that has a [material distribution](../crucible/#material_distribution) melts into its materials
   (liquid mode);
3. in solid mode, any item with a furnace (smelting) result that is an ingot, ore, plate or storage block (by its `c:`
   tags, plus 1.7's list of vanilla items) gives its furnace result.

The furnace uses the first recipe in this list that matches the item and has an output for the current mode. So a
row of yours with a lower `order` than HBM's takes an input from HBM's row, and any row comes before the rules. In
liquid mode, scrap items melt into the material they hold, before any row.
