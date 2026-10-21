---
title: Gas centrifuge
description: The pseudo_fluid table that drives the Gas Centrifuge cascade, and the gas_centrifuge table that recipe viewers show.
sidebar:
  order: 21
---

The two tables of the Gas Centrifuge: the cascade the machine runs, and its summary for recipe viewers.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:pseudo_fluid` | Gas Centrifuge (the cascade it runs) | own | pseudo-fluid `name` | 7 |
| `hbm:gas_centrifuge` | Gas Centrifuge (recipe viewers only) | own | display only | 4 |

The Gas Centrifuge does not use ordinary fluid recipes. It turns a real fluid tank (UF6, PuF6, Watz mud) into an
internal **pseudo-fluid**, processes it, and passes the enriched pseudo-fluid on to the next centrifuge in line. The
cascade is the `pseudo_fluid` table. The `gas_centrifuge` table only describes the whole cascade for recipe viewers;
it does not change what the machine does. If you change one, change the other to match.

## pseudo_fluid

One row per pseudo-fluid.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `name` | string | yes | | The pseudo-fluid's name, e.g. `NUF6`. Saved in the machine. |
| `from` | fluid id | no | none | The real fluid a centrifuge turns into this pseudo-fluid. |
| `consumed` | int | yes | | mB of this pseudo-fluid used per operation. |
| `produced` | int | yes | | mB of the `next` pseudo-fluid made per operation. |
| `next` | string | no | none | The pseudo-fluid name it becomes, passed to the next centrifuge. |
| `high_speed` | boolean | no | `false` | Needs the centrifuge's speed upgrade. |
| `outputs` | list of item outputs (`"id"` or `{"id", "count"}`) | yes | | Items made per operation. |

```json title="data/hbm/recipe/pseudo_fluid/nuf6.json (HBM)"
{
  "type": "hbm:pseudo_fluid",
  "name": "NUF6",
  "from": "hbm:uf6",
  "consumed": 400,
  "produced": 300,
  "next": "LEUF6",
  "outputs": ["hbm:nugget_u238"]
}
```

HBM's chain: `uf6` becomes `NUF6`, then `LEUF6`, `MEUF6`, `HEUF6` (the last one needs the speed upgrade);
`puf6` becomes `PF6`; Watz mud (`hbm:watz`) becomes `MUD`, then `MUD_HEAVY`.

Notes:

- A file with a new `name` creates a new pseudo-fluid. Its display name is the translation key
  `hbmpseudofluid.<name in lower case>`; add it in a resource pack.
- A pseudo-fluid whose file is removed has no values (nothing consumed or produced), so the chain stops there.
- Rows are read in recipe-id order; a second file with the same `name` overwrites the first's values, and the last
  `from` for a real fluid wins.

## gas_centrifuge

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [fluid stack](../common-fields/#fluid-stacks) | yes | | The real fluid fed in. |
| `outputs` | list of item outputs | yes | | Everything the cascade makes from it. |
| `high_speed` | boolean | no | `false` | Shown as needing the speed upgrade. |
| `centrifuges` | int | yes | | How many centrifuges in line the cascade needs. |

```json title="data/hbm/recipe/gas_centrifuge/uf6_high_speed.json (HBM)"
{
  "type": "hbm:gas_centrifuge",
  "input": { "type": "hbm:uf6", "amount": 1200 },
  "outputs": [
    { "id": "hbm:nugget_u238", "count": 11 },
    "hbm:nugget_u235",
    { "id": "hbm:fluorite", "count": 4 }
  ],
  "high_speed": true,
  "centrifuges": 4
}
```
