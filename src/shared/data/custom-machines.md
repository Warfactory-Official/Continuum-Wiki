---
title: Custom machines
description: Player-defined multiblock machines from hbmCustomMachines.json, their structures and their recipes.
sidebar:
  order: 6
---

Custom machines are 1.7's player-defined multiblocks: a controller, a structure of custom-machine blocks around it, and
a set of recipes. They are defined in two **config files**, not in a datapack, in the same format as 1.7, so a 1.7 file
carries over.

| File | Holds | When changes apply |
|---|---|---|
| `config/hbmConfig/hbmCustomMachines.json` | The machines: size, tanks, slots, power, structure, controller recipe | Game restart |
| `config/hbmRecipes/hbmCustomMachines.json` | The recipes each machine runs, by `recipeKey` | Game restart, or `/ntmreload` |

Both files sit in the game's (or the server's) `config/` folder and apply to every world. The first file is written
with 1.7's example machine, a paper press, when it is missing.

## The machine file

```json title="config/hbmConfig/hbmCustomMachines.json"
{
  "machines": [
    {
      "recipeKey": "paperPress",
      "unlocalizedName": "paperPress",
      "localizedName": "Paper Press",
      "localization": { "de_DE": "Papierpresse" },
      "fluidInCount": 1,
      "fluidInCap": 1000,
      "itemInCount": 1,
      "fluidOutCount": 0,
      "fluidOutCap": 0,
      "itemOutCount": 1,
      "generatorMode": false,
      "maxPollutionCap": 100,
      "fluxMode": false,
      "recipeSpeedMult": 1.0,
      "recipeConsumptionMult": 1.0,
      "maxPower": 10000,
      "maxHeat": 0,
      "recipeShape": ["IPI", "PCP", "IPI"],
      "recipeParts": [
        "I", ["dict", "ingotSteel"],
        "P", ["dict", "plateSteel"],
        "C", ["item", "hbm:circuit_basic"]
      ],
      "components": [
        { "block": "hbm:tile.cm_block", "x": -1, "y": -1, "z": 0, "metas": [0] },
        { "block": "hbm:tile.cm_port", "x": 0, "y": -1, "z": 0, "metas": [0] }
      ]
    }
  ]
}
```

(The example's `components` list is shortened; the written default has 26 entries.)

| Field | Type | Meaning |
|---|---|---|
| `recipeKey` | string | Which recipe set from the recipe file the machine runs. Several machines may share one. |
| `unlocalizedName` | string | The machine's id. The controller item stores it, so renaming a machine orphans placed controllers. |
| `localizedName` | string | The display name. |
| `localization` | object | Optional names per language code (`de_DE`); matched case-insensitively. |
| `fluidInCount`, `fluidInCap` | integers | Number of input tanks (at most 3) and the size of each, in mB. |
| `itemInCount` | integer | Number of input slots. |
| `fluidOutCount`, `fluidOutCap` | integers | Number of output tanks and the size of each, in mB. |
| `itemOutCount` | integer | Number of output slots. |
| `generatorMode` | boolean | `true`: the machine is a generator. It takes the inputs when a recipe starts and produces `consumptionPerTick` HE each tick instead of using it. |
| `maxPollutionCap` | integer | Optional, default `0`. How much pollution the machine's smoke ports buffer. |
| `fluxMode` | boolean | Optional. `true`: a recipe needs at least its `flux` of neutron flux, read from a research reactor next to a `cm_flux` block. |
| `recipeSpeedMult` | double | Divides every recipe's duration. |
| `recipeConsumptionMult` | double | Multiplies every recipe's power use. |
| `maxPower` | integer | The HE buffer. |
| `maxHeat` | integer | Optional. Above `0`, the machine pulls heat through its `cm_heat` blocks, up to this much. |
| `recipeShape`, `recipeParts` | lists | Optional. A shaped crafting recipe for the controller: the rows, then alternating key character and stack (see [Stacks](#stacks)). |
| `components` | list | The structure: every block other than the controller. |

Each component:

| Field | Meaning |
|---|---|
| `block` | A block id. 1.7's `hbm:tile.<name>` spelling is accepted: `cm_block`, `cm_sheet`, `cm_tank` and `cm_port` with meta 0 to 3 are the steel, alloy, desh and TC-alloy variants (`hbm:cm_block_steel` and so on); `cm_engine` metas are standard, desh and bismuth; `cm_circuit` metas are aluminium, copper, red copper, gold and schrabidium. Any other block id, from any mod, works as written. |
| `x`, `y`, `z` | The offset from the controller, turned with the controller's facing: `y` is up, `z` grows away from the controller's front, `x` is sideways. |
| `metas` | The 1.7 metadata values the position accepts (for the flattened families above). Ignored for other blocks. |

`cm_port` blocks are the machine's item, fluid and energy connections. `cm_flux` blocks read neutron flux and
`cm_heat` blocks pull heat (see `fluxMode` and `maxHeat`). The structure is checked every 15 seconds.

## The recipe file

Without `config/hbmRecipes/hbmCustomMachines.json` the machines use the built-in recipes, and the game writes them to
`_hbmCustomMachines.json` as a template. Remove the underscore to make the file yours: from then on it replaces the
built-in recipes entirely.

```json title="config/hbmRecipes/hbmCustomMachines.json"
{
  "recipes": [
    {
      "recipeKey": "paperPress",
      "recipes": [
        {
          "inputFluids": [["WATER", 250]],
          "inputItems": [["item", "hbm:powder_sawdust"]],
          "outputFluids": [],
          "outputItems": [["minecraft:paper", 3, 1.0]],
          "duration": 60,
          "consumptionPerTick": 10,
          "pollutionType": "SOOT",
          "pollutionAmount": 0.03,
          "radiationAmount": 0.0,
          "flux": 0,
          "heat": 0
        }
      ]
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `inputFluids`, `outputFluids` | Fluid stacks: `[fluid, amount]` or `[fluid, amount, pressure]`. The fluid is its HBM name in capitals (`WATER`, `HEAVYWATER`). |
| `inputItems` | Item stacks (see [Stacks](#stacks)). |
| `outputItems` | `[item id, count, chance]`, or `[item id, chance]` for one item. A chance of `1.0` always drops. |
| `duration` | Ticks per operation, before `recipeSpeedMult`. |
| `consumptionPerTick` | HE per tick, before `recipeConsumptionMult`. In generator mode, HE made per tick. |
| `pollutionType`, `pollutionAmount` | Optional. Pollution added each second (`SOOT`, `POISON`, `HEAVYMETAL`, `FALLOUT`). A negative amount removes pollution. |
| `radiationAmount` | Optional. Radiation added to the chunk each second; negative removes it. |
| `flux` | Optional. Neutron flux the recipe needs, with `fluxMode`. |
| `heat` | Optional. Heat used per tick. |

## Stacks

Item stacks in both files are 1.7's lists:

- `["item", "hbm:circuit_basic"]` or `["item", "hbm:circuit_basic", 2]`: an item and an optional count. 1.7's
  `item.`/`tile.` prefixes are dropped; metadata is ignored.
- `["dict", "ingotSteel"]` or `["dict", "ingotSteel", 4]`: a 1.7 ore dictionary name, read as the matching `c:` tag
  (`ingotSteel` is `#c:ingots/steel`). A `#namespace:path` tag id works too.

Reload the recipe file with `/ntmreload` after editing it. Changes to the machine file need a restart.
