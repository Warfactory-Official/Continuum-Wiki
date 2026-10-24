---
title: Crafting recipe types
description: HBM's crafting and smelting recipe types beyond vanilla's, including recipes that check or copy item data.
sidebar:
  order: 4
---

Most of HBM's crafting recipes are ordinary `minecraft:crafting_shaped` and `minecraft:crafting_shapeless` files. Where a
recipe has to check an ingredient's item data, take a filled fluid container, wear a tool or copy a container's contents,
it uses one of HBM's own types instead. A datapack can use these types for its own recipes. Remove any of HBM's with a
[removal list](../removing-recipes/).

| Type | What it does |
|---|---|
| `hbm:component_shaped` | Shaped crafting whose ingredients can check item data; can copy one ingredient's data to the result |
| `hbm:component_shapeless` | Shapeless crafting whose ingredients can check item data |
| `hbm:component_copy_shapeless` | Shapeless crafting that copies one ingredient's data to the result |
| `hbm:component_smelting` | Furnace smelting whose result carries item data |
| `hbm:grenade_universal` and others | Fixed recipes decided in code; see [Special recipes](#special-recipes) |

## Component ingredients

The `component_*` types take an ingredient object instead of vanilla's. A plain string (`"hbm:billet_les"`) is one item.
Otherwise:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `items` | list of strings | empty | Item ids and `#tag`s; any one matches. |
| `components` | object | empty | Item data the stack must carry, by component id. A number matches a number; a string matches a value written as that string (a registry name such as `minecraft:water`). |
| `absent_components` | list of strings | empty | Component ids the stack must not carry. |
| `fluid` | string | none | A full fluid container of this HBM fluid, whatever the container: the fluid's HBM name in capitals, such as `WATER` or `KEROSENE`. The grid keeps the emptied container. |
| `fluid_amount` | integer | `0` | With `fluid`: how many mB the container holds. Required with `fluid`. |
| `potion` | string | none | The potion the stack holds (`minecraft:water` for a water bottle). |
| `remainder` | string | none | An item left in the grid instead of the ingredient's own remainder. |
| `degrade` | boolean | `false` | The ingredient stays in the grid, one point more worn (HBM's chemistry sets and other crafting tools). |

Every constraint given must hold. An ingredient needs `items` or `fluid`.

## hbm:component_shaped

Like `minecraft:crafting_shaped`, with component ingredients in `key`.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `pattern` | list of strings | required | As vanilla. |
| `key` | object | required | Pattern character to component ingredient. |
| `result` | item stack | required | As vanilla's result (`{"id", "count", "components"}`). |
| `copy_key` | string | none | A key character: the result keeps that ingredient's item data, so an upgraded crate keeps its contents. |
| `category` | string | `misc` | As vanilla. |

```json title="data/mypack/recipe/crate_desh_upgrade.json"
{
  "type": "hbm:component_shaped",
  "key": {
    "D": { "items": ["hbm:plate_desh"] },
    "S": { "items": ["hbm:crate_steel"] }
  },
  "pattern": [" D ", "DSD", " D "],
  "result": { "id": "hbm:crate_desh" },
  "copy_key": "S"
}
```

A key that needs a full tank of water and gives the empty tank back:

```json
"D": {
  "items": ["hbm:fluid_tank"],
  "components": { "hbm:fluid": "minecraft:water", "hbm:fluid_amount": 1000 },
  "remainder": "hbm:fluid_tank"
}
```

## hbm:component_shapeless

Like `minecraft:crafting_shapeless`, with component ingredients in `ingredients`.

```json title="data/mypack/recipe/ball_tnt.json"
{
  "type": "hbm:component_shapeless",
  "ingredients": [
    { "fluid": "AROMATICS", "fluid_amount": 1000 },
    { "items": ["#c:dusts/niter"] },
    { "items": ["hbm:chemistry_set", "hbm:chemistry_set_boron"], "degrade": true }
  ],
  "result": { "id": "hbm:ball_tnt", "count": 4 }
}
```

## hbm:component_copy_shapeless

Shapeless crafting over vanilla ingredients whose result takes the item data of one of them. HBM uses it to load
ZIRNOX rods.

| Field | Type | Meaning |
|---|---|---|
| `ingredients` | list of ingredients | Vanilla ingredients (strings or `#tags`). |
| `copy_from` | ingredient | Which of the ingredients the data is copied from. |
| `result` | item stack | The result, before the copied data. |

```json
{
  "type": "hbm:component_copy_shapeless",
  "ingredients": ["hbm:rod_zirnox_empty", "hbm:billet_les", "hbm:billet_les"],
  "copy_from": "hbm:rod_zirnox_empty",
  "result": { "id": "hbm:rod_zirnox_les_fuel" }
}
```

## hbm:component_smelting

Furnace smelting with a component ingredient and a result that carries item data, such as a hot item.

| Field | Type | Meaning |
|---|---|---|
| `ingredient` | component ingredient | The input. |
| `result` | item stack | The output, with `components`. |
| `experience` | float | As vanilla. |
| `cookingtime` | integer | As vanilla, in ticks. |

```json
{
  "type": "hbm:component_smelting",
  "ingredient": { "items": ["hbm:blade_meteorite"] },
  "result": { "id": "hbm:blade_meteorite", "components": { "hbm:heat": 100 } },
  "experience": 0.0,
  "cookingtime": 200
}
```

## On 1.20.1

1.20.1 has no item components. There the folder is `recipes/`, a result is `{"item": ..., "count": ..., "tag": {...}}`
with the data as NBT under `tag`, and component ids in ingredients read the same NBT keys:

```json
"result": { "item": "hbm:blade_meteorite", "tag": { "hbm:heat": 100 } }
```

The ingredient fields are the same on every version.

## Special recipes

These types have no fields: the file is just `{"type": "hbm:<type>"}`, and the code decides what crafts. Each exists once
in HBM's data under the id shown. Remove one with a [removal list](../removing-recipes/) to turn it off.

| Type and id | What crafts |
|---|---|
| `hbm:grenade_universal` | One shell, one filling, one fuze and at most one extra, anywhere in the grid, make the matching universal grenade. |
| `hbm:ammo_arty_cargo` | An empty cargo artillery shell and exactly one other item load that item into the shell. |
| `hbm:scraps_split` | One stack of foundry scraps alone in the grid splits into two of half the amount each (an odd unit is lost, as in 1.7). |
| `hbm:scraps_from_powders` | 1.7's five recipes that mix powders into foundry scraps. |
| `hbm:rbmk_fuel_disassembly` | A used RBMK fuel rod, cooler than 50 °C in hull and core, gives eight of its pellets, with the depletion stage and xenon poisoning of the rod. A fresh rod does not disassemble. |
| `hbm:zirnox_waste` | A depleted ZIRNOX rod alone in the grid gives two hot spent-fuel waste and leaves the empty rod. |
| `hbm:fluid_duct_retype` | One or eight ducts (plain or typed) with a fluid identifier give as many ducts of the identifier's fluid; the identifier stays in the grid. |
| `hbm:syringe_mkunicorn` | The secret MKU syringe: six ingredients in an arrangement shuffled by the world seed. Meteor-dungeon books each reveal one slot. |

Retyping a duct back to a plain one is an ordinary shapeless recipe (`hbm:fluid_duct_neo_from_fluid_duct`).
