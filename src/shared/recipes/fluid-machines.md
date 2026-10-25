---
title: Compressor, electrolyser, liquefactor, solidifier
description: The compressor, electrolyser_fluid, electrolyser_metal, liquefaction and solidification tables.
sidebar:
  order: 13
---

Tables for machines that compress, split, liquefy or solidify fluids.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:compressor` | Compressor, Compact Compressor | own | input fluid and pressure; last recipe id wins | 5 |
| `hbm:electrolyser_fluid` | Electrolyser (fluid side) | own | input fluid; last recipe id wins | 8 |
| `hbm:electrolyser_metal` | Electrolyser (metal side) | own | input item; last in `order` wins | 36 |
| `hbm:liquefaction` | Industrial Liquefaction Machine | own | input item, then tag; first recipe id wins | 34 |
| `hbm:solidification` | Industrial Solidification Machine | own | input fluid; last recipe id wins | 47 |

None of these tables has `requires`; only `electrolyser_metal` has `order`.

## compressor

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | fluid id | yes | | The fluid compressed. |
| `pressure` | int | no | `0` | The pressure the input has before compressing. |
| `amount` | int | yes | | mB of input per operation. |
| `output` | [fluid stack](../common-fields/#fluid-stacks) | yes | | The result, with its new `pressure`. |
| `duration` | int | yes | | Ticks per operation. |

```json title="data/hbm/recipe/compressor/petroleum_0.json (HBM)"
{
  "type": "hbm:compressor",
  "input": "hbm:petroleum",
  "amount": 2000,
  "output": { "type": "hbm:petroleum", "amount": 2000, "pressure": 1 },
  "duration": 20
}
```

**Most fluids have no row.** For a fluid and pressure without a row, the compressor uses 1.7's generic step, which is
code: 1000 mB in, 1000 mB of the same fluid out at pressure + 1. That is how crude oil reaches pressure 2 for the
vacuum refinery and hydrogen pressure 1 for the hydrotreater. The rows are the fluids that change in other ways when
compressed (HBM's blood at pressure 3 becomes heavy oil). One row per input fluid and pressure; if two files have the
same pair, the one whose recipe id sorts last wins.

## electrolyser_fluid

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | fluid id | yes | | The fluid split. |
| `amount` | int | yes | | mB of input per operation. |
| `output1` | fluid stack | no | none | First product. |
| `output2` | fluid stack | no | none | Second product. |
| `duration` | int | no | `20` | Ticks per operation. |
| `byproducts` | list of item outputs (`"id"` or `{"id", "count"}`) | no | none | Items made per operation. |

```json title="data/hbm/recipe/electrolyser_fluid/alumina.json (HBM)"
{
  "type": "hbm:electrolyser_fluid",
  "input": "hbm:alumina",
  "amount": 200,
  "output1": { "type": "hbm:carbondioxide", "amount": 100 },
  "duration": 40,
  "byproducts": [
    { "id": "hbm:powder_aluminium", "count": 7 },
    { "id": "hbm:fluorite", "count": 2 }
  ]
}
```

One row per input fluid; with two files for one fluid, the recipe id that sorts last wins.

## electrolyser_metal

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | item id (string) | yes | | The item dissolved. A plain item id, not an ingredient object or tag. |
| `molten` | list of 1 or 2 [material stacks](../common-fields/#material-stacks) | yes | | Molten outputs, in quanta. |
| `byproducts` | list of item outputs | no | none | Items made per operation. |
| `duration` | int | no | `600` | Ticks per operation. |
| `order` | int | no | after HBM's | Display order. |

```json title="data/hbm/recipe/electrolyser_metal/crystal_iron.json (HBM)"
{
  "type": "hbm:electrolyser_metal",
  "input": "hbm:crystal_iron",
  "molten": [
    { "material": "iron", "amount": 432 },
    { "material": "titanium", "amount": 144 }
  ],
  "byproducts": [{ "id": "hbm:powder_lithium_tiny", "count": 3 }],
  "order": 0
}
```

The lookup is by input item. When two rows have the same item, the one that comes **last** in `order` wins (1.7 kept
a map). A row without `order` sorts after HBM's rows and therefore replaces HBM's row for that item; it still pays to
remove HBM's row so recipe viewers do not show both.

## liquefaction

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | item id or `#tag` (string) | yes | One item is consumed per operation. |
| `output` | fluid stack | yes | The fluid made from one item. |

```json title="data/hbm/recipe/liquefaction/cobblestone.json (HBM)"
{
  "type": "hbm:liquefaction",
  "input": "minecraft:cobblestone",
  "output": { "type": "minecraft:lava", "amount": 250 }
}
```

How an item is looked up, as in 1.7:

1. a row for that exact item;
2. otherwise the first tag row (in recipe-id order) whose tag holds the item;
3. otherwise, for any food, 1.7's fallback (code): Salient Green (`hbm:salient`), nutrition × saturation modifier × 20 mB.

For one item or one tag, the row whose recipe id sorts **first** wins. Remove HBM's row to replace it.

## solidification

The reverse of the liquefactor: an amount of fluid becomes one item. A row is literal or 1.7's "solid fuel" rule.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The fluid. |
| `amount` | int | one of `amount` / `solid_fuel_energy` | mB per item. |
| `solid_fuel_energy` | long | one of `amount` / `solid_fuel_energy` | Rule form: TU one output item is worth. |
| `output` | item output (`"id"` or `{"id", "count"}`) | yes | The item made. |

```json title="data/hbm/recipe/solidification/biogas.json (HBM)"
{
  "type": "hbm:solidification",
  "input": "hbm:biogas",
  "amount": 250,
  "output": { "id": "hbm:biomass_compressed", "count": 4 }
}
```

```json title="data/hbm/recipe/solidification/aromatics.json (HBM, rule form)"
{
  "type": "hbm:solidification",
  "input": "hbm:aromatics",
  "solid_fuel_energy": 1440000,
  "output": "hbm:solid_fuel"
}
```

**The rule form** takes `solid_fuel_energy` × 1000 × 1.25 / (the fluid's flammable energy per bucket, from its
`fluid_property` data) mB, cut to two significant digits (above 10,000 to thousands, above 1,000 to hundreds, above
100 to tens) and at least 1. A fluid that is not flammable gets no recipe. HBM's solid fuel is worth 1,440,000 TU,
balefire solid fuel 24,000,000.

One row per input fluid; with two files for one fluid, the recipe id that sorts last wins.
