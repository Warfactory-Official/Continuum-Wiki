---
title: Fuels and containers
description: Burner fuel classes, furnace values, fluid fuels for the autosaw and gas turbine, and fluid containers.
sidebar:
  order: 8
---

The [overview](../overview/) explains the file format.

## fuel_category

`data/hbm/value_maps/item/fuel_category.json`. Registry: item. HBM ships 7 entries.

Value: a string, the fuel class HBM's burners apply their per-class bonuses to: `log`, `wood`, `coal`, `lignite`,
`coke`, `solid`, `rocket` or `balefire`. Items without an entry are classed by 1.7's rule, which looks for "coke",
"lignite", "coal", logs and wood in the item.

```json title="data/hbm/value_maps/item/fuel_category.json (part)"
{
  "values": {
    "hbm:solid_fuel": "solid",
    "hbm:solid_fuel_bf": "balefire",
    "hbm:rocket_fuel": "rocket"
  }
}
```

## difurnace_fuel

`data/hbm/value_maps/item/difurnace_fuel.json`. Registry: item. HBM ships 19 entries.

Value: an integer, the burn value one item adds to the legacy Blast Furnace (`hbm:machine_difurnace_off`). An item's own entry beats a tag.

```json title="data/hbm/value_maps/item/difurnace_fuel.json (part)"
{
  "values": {
    "minecraft:coal": 200,
    "minecraft:charcoal": 200,
    "minecraft:coal_block": 2000,
    "hbm:block_coke_coal": 4000
  }
}
```

## brick_furnace_speed

`data/hbm/value_maps/item/brick_furnace_speed.json`. Registry: item. HBM ships 12 entries.

Value: an integer. For an input of the brick furnace, how many burn ticks one operation on it takes away per tick
(1.7's `TileEntityFurnaceBrick`). An input without an entry takes 2 if it is a log (`#minecraft:logs`) and 1 otherwise.

```json title="data/hbm/value_maps/item/brick_furnace_speed.json (part)"
{
  "values": {
    "minecraft:clay_ball": 4,
    "hbm:ball_fireclay": 4,
    "minecraft:netherrack": 4,
    "minecraft:cobblestone": 2
  }
}
```

## autosaw_fuel

`data/hbm/value_maps/fluid/autosaw_fuel.json`. Registry: fluid. HBM ships 5 entries.

Value: a boolean. Fluids with `true` are the fuels the autosaw and the thresher burn.

```json title="data/hbm/value_maps/fluid/autosaw_fuel.json"
{
  "values": {
    "hbm:woodoil": true,
    "hbm:ethanol": true,
    "hbm:fishoil": true,
    "hbm:heavyoil": true,
    "hbm:coalcreosote": true
  }
}
```

## gas_turbine_fuel_consumption

`data/hbm/value_maps/fluid/gas_turbine_fuel_consumption.json`. Registry: fluid. HBM ships 4 entries.

Value: a double. The mB of fuel the gas turbine burns per tick at full throttle. A fuel without a value burns 5.

```json title="data/hbm/value_maps/fluid/gas_turbine_fuel_consumption.json"
{
  "values": {
    "hbm:gas": 50.0,
    "hbm:syngas": 10.0,
    "hbm:oxyhydrogen": 100.0,
    "hbm:reformgas": 5.0
  }
}
```

## fluid_container

`data/hbm/value_maps/item/fluid_container.json`. Registry: item. HBM ships 20 entries.

Fixed fluid containers (1.7's `FluidContainerRegistry`), keyed by the full item: what the item holds and what it leaves
when emptied.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `fluid` | fluid id | required | The fluid it holds. |
| `amount` | integer | required | How much, in mB. |
| `empty` | item id | none | The item left after emptying. Absent: the item is used up. |

```json title="data/hbm/value_maps/item/fluid_container.json (part)"
{
  "values": {
    "minecraft:water_bucket": { "fluid": "minecraft:water", "amount": 1000, "empty": "minecraft:bucket" },
    "minecraft:lava_bucket": { "fluid": "minecraft:lava", "amount": 1000, "empty": "minecraft:bucket" }
  }
}
```

## fluid_containers

`data/hbm/value_maps/fluid/fluid_containers.json`. Registry: fluid. HBM ships 61 entries.

Which portable containers a fluid comes in, and their colours. Every field is an optional `"#RRGGBB"` colour; a
fluid with `canister` gets a canister of that colour, and one with `gas_bottle` gets a gas tank with that bottle colour
and `gas_label` label colour.

```json title="data/hbm/value_maps/fluid/fluid_containers.json (part)"
{
  "values": {
    "hbm:oil": { "canister": "#424242" },
    "hbm:heavyoil": { "canister": "#513F39" },
    "hbm:deuterium": { "gas_bottle": "#0000FF", "gas_label": "#FFFFFF" }
  }
}
```
