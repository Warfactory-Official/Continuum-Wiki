---
title: Pedestal, books, tool conversion
description: The pedestal, magic, lemegeton and tool_conversion tables.
sidebar:
  order: 24
---

Tables for HBM's rituals and books, and for converting blocks with a tool.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:pedestal` | Pedestal rituals, revealed by clay tablets | own | first match in `order` | 17 |
| `hbm:magic` | The Book of Boxcars | own | first match in `order` | 7 |
| `hbm:lemegeton` | Lemegeton | own | first match in `order` | 37 |
| `hbm:tool_conversion` | Blowtorch and Pneumatic Rivet Gun on convertible blocks | own | tool and block; last recipe id wins | 4 |

## pedestal

A ritual on a 3 × 3 field of pedestals.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `output` | item id (string) | yes | | The product. An id that is not registered makes a ritual that never completes. |
| `count` | int | no | `1` | Output count. |
| `grid` | list of exactly 9 slots | yes | | Row by row. A slot is an item id or `#tag` string, `{"id", "count"}` (that exact count on the pedestal), or `""` for an empty pedestal. |
| `extra` | condition name | no | `none` | An extra condition (below). |
| `set` | int | no | `0` | Which clay tablet set reveals this ritual (taken modulo 2). |
| `order` | int | no | after HBM's | Search order and tablet draw order. |

Conditions: `none`, `full_moon`, `new_moon` (at night with that moon phase), `sun` (around noon), `good_karma`,
`bad_karma` (a player within 20 blocks with reputation of at least 10, or at most -10). An addon may register more,
named with its namespace.

```json title="data/hbm/recipe/pedestal/ammo_secret_folly_nuke.json (HBM)"
{
  "type": "hbm:pedestal",
  "output": "hbm:ammo_secret_folly_nuke",
  "grid": [
    "#c:ingots/starmetal", "hbm:powder_magic", "#c:ingots/starmetal",
    "hbm:powder_magic", { "id": "hbm:ammo_standard_nuke_high", "count": 4 }, "hbm:powder_magic",
    "#c:ingots/starmetal", "hbm:powder_magic", "#c:ingots/starmetal"
  ],
  "extra": "full_moon",
  "set": 1,
  "order": 14
}
```

Each pedestal must hold exactly the slot's count (1 unless stated). The order matters twice: the pedestal uses the
first ritual in `order` that matches, and a clay tablet's seeded pick of rituals walks its set in `order`.

## magic

The Book of Boxcars' extended crafting. The filled grid slots are read in slot order, without gaps, and must match the
row's ingredients one for one, in order.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `ingredients` | list of item ids or `#tag` strings | yes | | In order. |
| `result` | item id (string) | yes | | One of that item. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/magic/balefire_and_steel.json (HBM)"
{
  "type": "hbm:magic",
  "ingredients": ["#c:ingots/steel", "hbm:egg_balefire_shard"],
  "result": "hbm:balefire_and_steel",
  "order": 2
}
```

## lemegeton

The Lemegeton's one-slot conversion: each ingot or gem into the next rung of its ladder.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | item id or `#tag` (string) | yes | | What is converted. |
| `output` | item id (string) | yes | | One of that item. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

```json title="data/hbm/recipe/lemegeton/dusts_fluorite.json (HBM)"
{
  "type": "hbm:lemegeton",
  "input": "#c:dusts/fluorite",
  "output": "hbm:gem_sodalite",
  "order": 31
}
```

## tool_conversion

Hitting a block with a tool, while carrying the materials, consumes the materials and replaces the block.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `tool` | tool type | yes | | `torch` (Blowtorch) or `bolt` (Pneumatic Rivet Gun). The type list also has `screwdriver`, `hand_drill`, `defuser` and `wrench`. |
| `from` | block id | yes | | The block hit. |
| `to` | block id | yes | | The block it becomes. |
| `materials` | list of [ingredients](../common-fields/#ingredients) | no | none | Taken from the player's inventory. |

```json title="data/hbm/recipe/tool_conversion/watz_casing.json (HBM)"
{
  "type": "hbm:tool_conversion",
  "tool": "bolt",
  "from": "hbm:watz_casing",
  "to": "hbm:watz_casing_tooled",
  "materials": [{ "material": "dura_steel", "shape": "bolt", "count": 4 }]
}
```

Notes:

- Only blocks built to be tool-convertible react to this table (HBM's Watz casing, fusion coil and ICF parts). A row
  whose `from` is an ordinary block does nothing.
- One conversion per tool and block; the row whose recipe id sorts last wins, and data rows win over conversions an
  addon registers in code.
