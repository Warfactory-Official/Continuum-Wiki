---
title: Crucible and material distribution
description: The crucible alloying table and the material_distribution table that says what an item melts into.
sidebar:
  order: 16
---

The crucible's alloying table, and the table that says what any item melts into.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:crucible` | Crucible | own | selector, saves `name` | 13 |
| `hbm:material_distribution` | Crucible, foundry, Electric Arc Furnace | own | item tags, then item row (below) | 54 |

Both work in molten material, counted in quanta: 8 to the nugget, 72 to the ingot, 648 to the block. Materials are
named by their HBM material name (`iron`, `steel`, `arsenic_bronze`, `flux`, `slag`, ...); see
[material stacks](../common-fields/#material-stacks).

## crucible

Alloying recipes. The player picks one in the crucible's recipe selector, and the crucible saves its `name`. While
the selected recipe's inputs are all in the crucible's recipe stack, it runs once every `frequency` ticks.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `name` | string | yes | | Internal name, saved by the crucible. Unique in the table. |
| `frequency` | int | no | `1` | Ticks between runs. |
| `icon` | item output (`"id"` or `{"id", "count"}`) | no | none | Icon in the selector. |
| `inputs` | list of material stacks | yes | | Consumed per run. |
| `outputs` | list of material stacks | yes | | Produced per run. |
| `order` | int | no | after HBM's | Selector order. |

```json title="data/hbm/recipe/crucible/steel.json (HBM)"
{
  "type": "hbm:crucible",
  "name": "crucible.steel",
  "frequency": 20,
  "icon": "hbm:ingot_steel",
  "inputs": [
    { "material": "iron", "amount": 16 },
    { "material": "carbon", "amount": 24 },
    { "material": "flux", "amount": 8 }
  ],
  "outputs": [{ "material": "steel", "amount": 16 }],
  "order": 0
}
```

Notes:

- The crucible does not check that the outputs fit. Keep the output total at or below the input total, as 1.7 warns,
  or material "expands" while alloying.
- Two rows with the same `name`: the one first in `order` is kept, the other dropped with a warning.
- The recipe is shown under its icon's item name.
- There is no `requires` field.

## material_distribution

What an item consists of when melted. The crucible, the foundry and the arc furnace (its liquid-mode rule) all read
it.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | item id or `#tag` (string) | yes | The item, or every item in a tag. |
| `materials` | list of material stacks | yes | What one item melts into, in quanta. |

```json title="data/hbm/recipe/material_distribution/tag_ores_iron.json (HBM)"
{
  "type": "hbm:material_distribution",
  "input": "#c:ores/iron",
  "materials": [
    { "material": "iron", "amount": 144 },
    { "material": "titanium", "amount": 24 },
    { "material": "stone", "amount": 162 }
  ]
}
```

How an item's materials are found, as in 1.7:

1. Its tags are checked in turn. The first tag that has a **tag row** gives that row's materials, and the search of
   tags stops. If instead a `c:<shape>/<material>` tag comes first (`c:ingots/steel`, `c:plates/copper`, ...) for a
   smeltable material, the item counts as that shape of that material (an ingot is 72 quanta) and the search stops.
2. An **item row** for the item is then **added** to what the tags gave.
3. If nothing was found, an HBM autogen item counts as its own shape and material.
4. A scrap item adds the material it holds.

So a tag row replaces the automatic `c:` shape scan for every item in that tag, while an item row adds to it. A
second row for the same item or tag replaces the first: the one whose recipe id sorts last wins.

Most items need no row: anything tagged `c:ingots/<material>`, `c:nuggets/<material>`, `c:plates/<material>` and so
on already melts by its tag. Rows are for things that are not one shape of one material, such as ores, rails or
stamps.
