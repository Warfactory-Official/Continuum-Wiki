---
title: Oil processing
description: The refinery, vacuum_distill, fraction, cracking, radiolysis, reforming, hydrotreating, coker and pyrolysis tables.
sidebar:
  order: 12
---

Tables for the oil chain: refining, cracking, reforming, hydrotreating, coking and pyrolysis.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:refinery` | Oil Refinery | own | input fluid; last recipe id wins | 4 |
| `hbm:vacuum_distill` | Vacuum Refinery | own | input fluid; last recipe id wins | 2 |
| `hbm:fraction` | Fractioning Tower | own | input fluid; last recipe id wins | 19 |
| `hbm:cracking` | Catalytic Cracking Tower | own | input fluid; last recipe id wins | 12 |
| `hbm:radiolysis` | Radioisotope Thermoelectric Generator and Radiolysis Chamber | own | input fluid; cracking rows win | 1 |
| `hbm:reforming` | Catalytic Reformer | own | input fluid; last recipe id wins | 9 |
| `hbm:hydrotreating` | Hydrotreater | own | input fluid; last recipe id wins | 6 |
| `hbm:coker` | Coker Unit | own | input fluid; last recipe id wins | 33 |
| `hbm:pyrolysis` | Pyrolysis Oven | own | first match in a fixed list (below) | 40 |

All of these have their own record schema; none uses the generic fields. Fluids are
[fluid stacks](../common-fields/#fluid-stacks) or plain fluid ids.

**One row per input fluid.** Every table here except pyrolysis holds one recipe per input fluid. If two files name the
same input, the one whose recipe id sorts **last** wins (so `mypack:cracking/oil` would beat `hbm:cracking/oil`, but a
namespace that sorts before `hbm` would lose). Do not rely on that: to change HBM's row for a fluid, remove it and add
yours. None of these tables has `order` or `requires`.

## refinery

Per 100 mB of hot input, four fractions; every 100 operations, one byproduct item.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `outputs` | list of exactly 4 fluid stacks | yes | Products per 100 mB of input. |
| `byproduct` | item output (`"id"` or `{"id", "count"}`) | yes | Item made every 100 operations. |

```json title="data/hbm/recipe/refinery/hotcrackoil.json (HBM)"
{
  "type": "hbm:refinery",
  "input": "hbm:hotcrackoil",
  "outputs": [
    { "type": "hbm:naphtha_crack", "amount": 40 },
    { "type": "hbm:lightoil_crack", "amount": 30 },
    { "type": "hbm:aromatics", "amount": 15 },
    { "type": "hbm:unsaturateds", "amount": 15 }
  ],
  "byproduct": "hbm:oil_tar_crack"
}
```

## vacuum_distill

Per 100 mB of input, four fractions. HBM's input is crude oil at pressure 2.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `outputs` | list of exactly 4 fluid stacks | yes | Products per 100 mB of input. |

```json title="data/hbm/recipe/vacuum_distill/oil.json (HBM)"
{
  "type": "hbm:vacuum_distill",
  "input": "hbm:oil",
  "outputs": [
    { "type": "hbm:heavyoil_vacuum", "amount": 40 },
    { "type": "hbm:reformate", "amount": 25 },
    { "type": "hbm:lightoil_vacuum", "amount": 20 },
    { "type": "hbm:sourgas", "amount": 15 }
  ]
}
```

## fraction

100 mB of input per operation splits into two outputs.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `left` | fluid stack | yes | First product. |
| `right` | fluid stack | yes | Second product. |

```json title="data/hbm/recipe/fraction/bauxite_solution.json (HBM)"
{
  "type": "hbm:fraction",
  "input": "hbm:bauxite_solution",
  "left": { "type": "hbm:redmud", "amount": 50 },
  "right": { "type": "hbm:sodium_aluminate", "amount": 50 }
}
```

## cracking

Per 100 mB of input, two products. The steam (200 mB per operation, giving 2 mB spent steam) is fixed in the machine.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `left` | fluid stack | yes | First product. |
| `right` | fluid stack | no | Second product. Leave it out for a single product (HBM's kerosene row). |

```json title="data/hbm/recipe/cracking/biogas.json (HBM)"
{
  "type": "hbm:cracking",
  "input": "hbm:biogas",
  "left": { "type": "hbm:petroleum", "amount": 20 },
  "right": { "type": "hbm:aromatics", "amount": 20 }
}
```

## radiolysis

The same fields as [cracking](#cracking): `input`, `left`, optional `right`. The chamber uses 100 mB of input per
cycle.

```json title="data/hbm/recipe/radiolysis/water.json (HBM)"
{
  "type": "hbm:radiolysis",
  "input": "minecraft:water",
  "left": { "type": "hbm:peroxide", "amount": 80 },
  "right": { "type": "hbm:hydrogen", "amount": 20 }
}
```

:::note[Radiolysis copies cracking]
As in 1.7, the radiolysis chamber also runs **every cracking row**. Its list is its own rows first, then a copy of the
`hbm:cracking` table, and a cracking row for the same input replaces a radiolysis row. So adding a cracking row adds a
radiolysis recipe, and a radiolysis row for a fluid that also has a cracking row has no effect.
:::

## reforming

Per 100 mB of input, three products. The machine also needs a catalytic converter and 20,000 HE per operation.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `outputs` | list of exactly 3 fluid stacks | yes | Products per 100 mB of input. |

```json title="data/hbm/recipe/reforming/cholesterol.json (HBM)"
{
  "type": "hbm:reforming",
  "input": "hbm:cholesterol",
  "outputs": [
    { "type": "hbm:estradiol", "amount": 50 },
    { "type": "hbm:reformgas", "amount": 35 },
    { "type": "hbm:hydrogen", "amount": 15 }
  ]
}
```

## hydrotreating

Per 100 mB of input plus the hydrogen, two products. The machine also needs a catalytic converter and 20,000 HE per
operation.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `hydrogen` | fluid stack | yes | The hydrogen (or other fluid) per operation, with its pressure. |
| `outputs` | list of exactly 2 fluid stacks | yes | Products per 100 mB of input. |

```json title="data/hbm/recipe/hydrotreating/coaloil.json (HBM)"
{
  "type": "hbm:hydrotreating",
  "input": "hbm:coaloil",
  "hydrogen": { "type": "hbm:hydrogen", "amount": 10, "pressure": 1 },
  "outputs": [
    { "type": "hbm:coalgas", "amount": 80 },
    { "type": "hbm:sourgas", "amount": 15 }
  ]
}
```

## coker

The coker is heated from below and turns an amount of fluid into one item, with an optional byproduct fluid. A row
is either literal or 1.7's "solid fuel" rule.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | fluid id | yes | The input fluid. |
| `amount` | int | one of `amount` / `solid_fuel_energy` | mB of input per item. |
| `solid_fuel_energy` | long | one of `amount` / `solid_fuel_energy` | Rule form: the energy (TU) one output item is worth. |
| `output` | item output (`"id"` or `{"id", "count"}`) | yes | The item made. |
| `byproduct` | fluid stack | no | Literal form: the byproduct per item. |
| `byproduct_type` | fluid id | no | Rule form: the byproduct fluid. |

A row must have exactly one of `amount` and `solid_fuel_energy`.

```json title="data/hbm/recipe/coker/bitumen.json (HBM)"
{
  "type": "hbm:coker",
  "input": "hbm:bitumen",
  "amount": 16000,
  "output": "hbm:coke_petroleum",
  "byproduct": { "type": "hbm:oil_coker", "amount": 1600 }
}
```

```json title="data/hbm/recipe/coker/aromatics.json (HBM, rule form)"
{
  "type": "hbm:coker",
  "input": "hbm:aromatics",
  "solid_fuel_energy": 820000,
  "output": "hbm:coke_petroleum",
  "byproduct_type": "hbm:gas_coker"
}
```

**The rule form.** The amount is computed from the fluid's fuel value, read from its `fluid_property` data, so a pack
that changes a fuel's energy also changes its coker row:

- energy per bucket = the larger of the fluid's flammable and combustible energy;
- mB = `solid_fuel_energy` × 1000 / energy per bucket, then cut to two significant digits (above 10,000 to whole
  thousands, above 1,000 to hundreds, above 100 to tens);
- byproduct = `max(10, mB / 10)` mB of `byproduct_type`;
- a fluid with no fuel value gets no recipe.

HBM uses 820,000 TU per petroleum coke and 340,000 TU per charcoal (wood oil).

## pyrolysis

The pyrolysis oven takes an optional fluid and an optional item, and makes an optional fluid and an optional item.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input_fluid` | fluid stack | no | Fluid input. Not allowed together with `solid_fuel`. |
| `input_item` | [ingredient](../common-fields/#ingredients) | no | Item input, with `count`. |
| `output_fluid` | fluid stack | no | Fluid output. |
| `output_item` | item output (`"id"` or `{"id", "count"}`) | no | Item output. |
| `duration` | int | yes | Ticks per operation. |
| `solid_fuel` | fluid id | with `solid_fuel_energy` | Rule form: the fluid turned into solid fuel. |
| `solid_fuel_energy` | long | with `solid_fuel` | Rule form: TU per output item. |

```json title="data/hbm/recipe/pyrolysis/carbondioxide_from_tars.json (HBM)"
{
  "type": "hbm:pyrolysis",
  "input_item": { "ingredient": "#c:tars", "count": 4 },
  "output_fluid": { "type": "hbm:carbondioxide", "amount": 1000 },
  "output_item": "hbm:powder_ash_soot",
  "duration": 40
}
```

```json title="data/hbm/recipe/pyrolysis/solid_fuel_aromatics.json (HBM, rule form)"
{
  "type": "hbm:pyrolysis",
  "output_item": "hbm:solid_fuel",
  "duration": 60,
  "solid_fuel": "hbm:aromatics",
  "solid_fuel_energy": 1440000
}
```

**The rule form** takes `solid_fuel_energy` × 1000 × 0.5 / (the fluid's flammable energy per bucket) mB of the fluid,
cut to two significant digits as for the coker and at least 1 mB. A fluid that is not flammable gets no recipe.

**Order matters here.** The oven uses the first recipe that matches, and the table has no `order` field. The list is
built in this order:

1. all rule rows (`solid_fuel`), in recipe-id order;
2. the bedrock-ore roasting recipes, which HBM adds in code;
3. all literal rows, in recipe-id order.

This is 1.7's order. It is why syngas plus tungsten dust makes solid fuel: the syngas solid-fuel rule comes before
the literal syngas row.
