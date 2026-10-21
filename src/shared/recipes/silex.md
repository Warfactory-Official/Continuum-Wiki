---
title: SILEX
description: The silex table of the Laser Isotope Separation Chamber, with its laser strengths, pellet and fluid inputs and weighted outputs.
sidebar:
  order: 20
---

The SILEX table: what the Laser Isotope Separation Chamber makes from each input, and at which laser strength.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:silex` | Laser Isotope Separation Chamber (SILEX), fed by the FEL | own | first match in `order` | 301 |

## How a SILEX recipe works

One input item (or fluid) dissolves into a pool of solution: each item adds `fluid_produced` mB. The laser then uses
`fluid_consumed` mB per output and rolls **one** item from the weighted `outputs` each time. A 900/100 recipe
therefore turns one ingot into nine rolls, and the weights are the isotope ratios.

`laser_strength` is a **minimum**. A recipe runs on that wavelength or any stronger one, and each step above the
minimum doubles the speed.

## Fields

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | input (below) | yes | | What is dissolved. |
| `fluid_produced` | int | yes | | mB of solution per input item. |
| `fluid_consumed` | int | yes | | mB of solution per output roll. |
| `laser_strength` | wavelength | yes | | The weakest wavelength that runs the recipe. |
| `outputs` | list of `{"data", "weight"}` | yes | | `data` is an item output (`"id"` or `{"id", "count"}`), `weight` a positive int. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

Wavelengths, weakest first: `ir`, `visible`, `uv`, `gamma`, `drx`. An addon's wavelength is named as it registered it.

The `input` is one of:

| Form | Matches |
|---|---|
| an [ingredient](../common-fields/#ingredients) | Any normal ingredient. |
| `{"rbmk_pellet": "<item id>", "stage": 0..9}` | An RBMK pellet at one depletion stage; stages 5 to 9 are the xenon-poisoned ones. |
| `{"fluid_icon": "<fluid id>"}` | A fluid, piped into the chamber's tank. |

```json title="data/hbm/recipe/silex/crystal_schraranium.json (HBM)"
{
  "type": "hbm:silex",
  "input": { "ingredient": "hbm:crystal_schraranium" },
  "fluid_produced": 900,
  "fluid_consumed": 100,
  "laser_strength": "uv",
  "outputs": [
    { "data": "hbm:nugget_schrabidium", "weight": 5 },
    { "data": "hbm:nugget_uranium", "weight": 2 },
    { "data": "hbm:nugget_neptunium", "weight": 2 }
  ],
  "order": 11
}
```

```json title="data/hbm/recipe/silex/rbmk_pellet_balefire_0.json (HBM)"
{
  "type": "hbm:silex",
  "input": { "rbmk_pellet": "hbm:rbmk_pellet_balefire", "stage": 0 },
  "fluid_produced": 400,
  "fluid_consumed": 100,
  "laser_strength": "uv",
  "outputs": [
    { "data": "hbm:powder_balefire", "weight": 90 },
    { "data": "hbm:nuclear_waste_tiny", "weight": 10 }
  ],
  "order": 55
}
```

```json title="data/hbm/recipe/silex/fluid_puf6.json (HBM)"
{
  "type": "hbm:silex",
  "input": { "fluid_icon": "hbm:puf6" },
  "fluid_produced": 900,
  "fluid_consumed": 100,
  "laser_strength": "visible",
  "outputs": [
    { "data": "hbm:nugget_pu238", "weight": 3 },
    { "data": "hbm:nugget_pu239", "weight": 4 },
    { "data": "hbm:nugget_pu240", "weight": 2 }
  ],
  "order": 6
}
```

## Notes

- HBM's rows are 1.7's base recipes, every RBMK pellet family at its stages (with the xenon variants), and the nuclear
  waste reprocessing recipes. 1.7's aliases (uranium hexafluoride or uranium powder treated like the uranium ingot,
  and so on) are rows of their own with the same outputs.
- **Tiny waste** is a rule, not rows: a tiny nuclear waste item runs the row of its full-size counterpart, with
  `(fluid_produced / 900) × 100` mB of solution (integer division). Recipe viewers do not list these, as 1.7's did not.
