---
title: Common fields
description: The shared recipe schema of HBM's generic machine tables, and the ingredient, output, fluid and material forms every table uses.
sidebar:
  order: 2
---

Fifteen tables use one shared row schema, called the generic schema here (in the code, `GenericRecipe` and its
codec `GenericRecipeCodec`; it is the same schema ntm-next uses, so one file works for both ports). The other tables
have a record of their own, but they build it from the same pieces: the same ingredient forms, item outputs, fluid
stacks and material stacks. This page describes both.

Tables on the generic schema: `assembly_machine`, `precision_assembler`, `chemical_plant`, `mixer`, `blast_furnace`,
`difurnace`, `purex`, `exposure_chamber`, `fluid_breeder`, `outgasser`, `fusion`, `plasma_forge`, `rock_mill`,
`supercomputer`, `space_assembler`. Three of them add fields of their own (`fusion`, `plasma_forge`, `outgasser`),
listed on their pages.

## Generic schema

```json title="data/hbm/recipe/purex/platemox.json (HBM)"
{
  "type": "hbm:purex",
  "name": "purex.platemox",
  "input_items": [{ "type": "hbm:cold", "item": "hbm:waste_plate_mox" }],
  "input_fluids": [
    { "type": "hbm:kerosene", "amount": 500 },
    { "type": "hbm:nitric_acid", "amount": 250 }
  ],
  "output_items": [
    "hbm:powder_sr90_tiny",
    { "id": "hbm:nugget_pu_mix", "count": 3 },
    "hbm:powder_cs137_tiny",
    { "id": "hbm:nuclear_waste_tiny", "count": 4 }
  ],
  "duration": 100,
  "power": 1500,
  "icon": { "id": "hbm:waste_plate_mox" },
  "name_wrapper": "purex.recycle",
  "auto_switch_group": "autoswitch.plate",
  "order": 15
}
```

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `name` | string | yes | | Internal name. Machines save it, the selector shows it. Unique per table (see below). |
| `input_items` | list of [ingredients](#ingredients) | no | none | Item inputs. |
| `input_fluids` | list of [fluid stacks](#fluid-stacks) | no | none | Fluid inputs. |
| `output_items` | list of [outputs](#item-outputs-of-generic-rows) | no | none | Item outputs, or one weighted choice. |
| `output_fluids` | list of [fluid stacks](#fluid-stacks) | no | none | Fluid outputs. |
| `duration` | int | no | `0` | Ticks per operation at normal speed. |
| `power` | long | no | `0` | Energy (HE) drawn per tick while running. Some machines ignore it; their pages say so. |
| `icon` | [item stack](#item-stacks) object | no | first output | Icon in the selector and recipe viewers. Must be the object form `{"id": ...}`. |
| `custom_localization` | boolean | no | `false` | Show the translation of `name` as the recipe's title (1.7 `setNamed`) instead of the icon's item name. |
| `name_wrapper` | string | no | none | A translation key that wraps the title, with the title as its argument (`purex.recycle` gives "Reprocessing of ..."). |
| `blueprint_pools` | list of strings | no | none | Blueprint pools the recipe belongs to. A pooled recipe runs only with a blueprint of one of its pools in the machine. |
| `auto_switch_group` | string | no | none | Auto-switch group (see below). |
| `order` | int | no | after all HBM rows | Position in the table; see [order](../overview/#order-the-first-match-wins). |
| `input_items_expensive` | list of ingredients | no | none | Replaces `input_items` while expensive mode is on (1.7 `inputItemsEx`). |
| `input_fluids_expensive` | list of fluid stacks | no | none | Replaces `input_fluids` while expensive mode is on. |
| `blueprint_pools_528` | list of strings | no | none | Replaces `blueprint_pools` while 528 mode is on (1.7 `setPools528`). |
| `requires` | list of strings | no | none | Config conditions the row needs to exist; see [requires](#requires). |

Notes:

- **Icon.** Without `icon`, the recipe shows its first item output; with no item output, a fluid droplet of its first
  output fluid, else of its first input fluid.
- **Names.** Within one table, two active rows must not share a `name`. If they do, the row that comes first in
  `order` is kept and the other is dropped with a log warning. HBM names its rows `<prefix>.<thing>` (`chem.oxygen`,
  `ass.acidizer`, `precass.atomic_clock`); the prefix is only a convention.
- **Blueprint pools.** A pool is a string such as `528.arty` or `alt.plates`. The blueprint item `hbm:blueprints`
  carries one pool in its `blueprint_pool` item data. A recipe with pools is cleared from a machine whose blueprint
  slot does not hold a blueprint of one of them. HBM's pool names start with `alt.`, `discover.`, `secret.` or `528.`.
- **Auto-switch groups.** While a recipe of a group is selected, a machine that finds the first input of another
  recipe of the same group in its input slots switches to that recipe. The group string is also a translation key,
  shown in the recipe's tooltip. HBM uses it, for example, for the cyclotron particles in the assembly machine
  (`autoswitch.cyclotron`) and PUREX fuel families (`autoswitch.plate`, `autoswitch.watz`).
- **Expensive and 528 variants** are part of the same row. The row keeps its `name`; only the inputs or pools in
  force change with the config.

### Item outputs of generic rows

`output_items` entries take these forms:

```json
"output_items": [
  "hbm:ingot_desh",
  { "id": "hbm:part_copper", "count": 8 },
  { "id": "hbm:circuit_chip", "count": 8, "chance": 0.75 },
  { "id": "hbm:canister_full", "item_data": { "fluid": "hbm:oil", "fluid_amount": 1000 } },
  { "tag": "c:nuggets/naquadria", "count": 12 }
]
```

| Form | Meaning |
|---|---|
| `"id"` | One item. |
| `{"id", "count", "chance", "item_data"}` | `count` defaults to 1. `chance` (0 to 1) rolls once per item of the stack, so `count: 4, chance: 0.25` averages one item; leave it out for a guaranteed output. `item_data` is [item data](#item-data). |
| `{"id", ..., "components"}` / `{"id", ..., "nbt"}` | Any other data of the stack, in the target's own form (see [raw item data](#raw-item-data)). |
| `{"tag", "count", "chance"}` | The first item of an item tag, looked up when the table loads (1.7's `OreDictionary.getOres(name).get(0)`). If the tag is empty the output is empty, so such a row should also `require` the tag. Note the tag is written without `#` here. |

A **weighted choice** gives exactly one of several items. It must be the only entry of `output_items`, written as a
list inside the list:

```json title="data/hbm/recipe/precision_assembler/atomic_clock.json (HBM, shortened)"
"output_items": [
  [
    { "data": "hbm:circuit_atomic_clock", "weight": 50 },
    { "data": { "id": "hbm:broken_item", "item_data": { "broken_item": "hbm:circuit_atomic_clock" } }, "weight": 50 }
  ]
]
```

`data` is an [item stack](#item-stacks) and `weight` a number; one entry is picked per operation, by weight.

## Requires

`requires` lists conditions. A row is in its table only while **every** entry holds. Prefix an entry with `!` to
negate it. An entry is either a config flag or `#` plus an item tag:

| Entry | Holds when |
|---|---|
| `enable_528` | `528 / enable528Mode` is on. |
| `expensive_mode` | `01_general / 1.99_enableExpensiveMode` is on. |
| `enable_528_pressurized` | `528 / X528_enable528PressurizedRecipes` is on (always off unless 528 mode is on). |
| `lbsm` | `LESS BULLSHIT MODE / enableLessBullshitMode` is on (always off in 528 mode). |
| `lbsm_simple_chemistry` | LBSM and `LBSM_recipeSimpleChemistry` are on. |
| `lbsm_simple_centrifuge` | LBSM and `LBSM_recipeSimpleCentrifuge` are on. |
| `lbsm_simple_crafting` | LBSM and `LBSM_recipeSimpleCrafting` are on. |
| `lbsm_simple_alloy` | LBSM and `LBSM_recipeSimpleAlloy` are on. |
| `lbsm_unlock_anvil` | LBSM and `LBSM_recipeUnlockAnvil` are on. |
| `lbsm_simple_armor` | LBSM and `LBSM_recipeSimpleArmor` are on. |
| `lbsm_simple_tool` | LBSM and `LBSM_recipeSimpleTool` are on. |
| `lbsm_simple_medicine` | LBSM and `LBSM_recipeSimpleMedicine` are on. |
| `#<tag>` | The item tag has at least one item, e.g. `#c:nuggets/naquadria` (1.7's "only if another mod adds this ore dictionary entry" rows). |

The config names are the category and key in `config/hbm.cfg`. An unknown flag name never holds: the row is left out
with a warning in the log.

```json
"requires": ["enable_528", "!expensive_mode"]
```

Which tables read `requires`, and when they test it again:

- Generic-schema tables: whenever a flag value changes, at the next use. No reload needed.
- `centrifuge`, `soldering`: the same, no reload needed.
- `annihilator`, `anvil_construction`: when the table loads (`/reload`).
- `crystallizer` has a different `requires`: one tag id, without `#`, as a single string. See its
  [page](../press-and-grinding/#crystallizer).
- The other tables have no `requires`.

The same flags (not the `#tag` form) also work in the `golem:requires` key, which every recipe file of any type can
carry; see [removing recipes](../removing-recipes/#golemrequires).

## Ingredients

Item inputs of most tables accept one ingredient object. It has several forms, told apart by their keys.

### Item or tag

```json
{ "ingredient": "minecraft:clay_ball", "count": 7 }
{ "ingredient": "#c:ingots/steel", "count": 64 }
```

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `ingredient` | item id, or `#` and an item tag | yes | | What matches. |
| `count` | int | no | `1` | How many the recipe takes (some machines ignore it; see their pages). |
| `exact` | boolean | no | `false` | Match only an item with exactly the given data (see below). |
| `item_data` | [item data](#item-data) | no | none | The data an exact ingredient must have. Implies `exact`. |

A plain item ingredient matches the item **with any data**: `"hbm:canister_full"` matches a canister of any fluid. To
match one data value, use `exact`:

```json
{ "ingredient": "hbm:broken_item", "exact": true, "item_data": { "broken_item": "hbm:circuit_atomic_clock" } }
```

`"exact": true` without `item_data` matches only the item with **no** data, for example an unloaded artillery shell
(`assembly_machine/shellchlorine.json`). A tag cannot be exact.

### Autogen material shape

```json
{ "material": "steel", "shape": "weldedplate", "count": 2 }
```

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `material` | material name | yes | | An HBM material, by its name (`steel`, `titanium`, `aluminium`, ...). |
| `shape` | shape name | yes | | One of the shapes below. |
| `count` | int | no | `1` | |

This matches HBM's generated per-material items that share one item model and differ only in material: wires, dense
wires, bolts, cast and welded plates, shells, pipes, gun parts and the like. Shape names: `nugget`, `tiny`,
`fragment`, `dusttiny`, `wire`, `bolt`, `billet`, `ingot`, `gem`, `crystal`, `dust`, `densewire`, `plate`,
`castplate`, `weldedplate`, `shell`, `pipe`, `heavy_component`, `lightbarrel`, `heavybarrel`, `lightreceiver`,
`heavyreceiver`, `mechanism`, `stock`, `grip`, `block`, `ore`. It only matches when HBM generates an item for that
material and shape. For ingots, plates, dusts and the like, prefer the `c:` tag (`#c:plates/steel`), which also
accepts other mods' items.

### Typed ingredients

These carry a `type` key:

| `type` | Fields | Matches |
|---|---|---|
| `hbm:fluid_container` | `fluid` (fluid id), `amount` (int, mB), `count` (default 1) | Any full fluid container that holds `amount` mB of `fluid` (1.7's fluid dictionary entries). |
| `hbm:fluid_item` | `item`, `fluid`, `count` (default 1) | That container item holding `fluid`, at any fill. |
| `hbm:cold` | `item`, `count` (default 1) | That item when it is not hot: spent fuel that has cooled in a waste drum. |
| `hbm:any_of` | `of` (list of ingredients), `count` (default 1) | Any one of the listed ingredients, each matched with its own count. |

```json
{ "type": "hbm:fluid_container", "fluid": "hbm:diesel", "amount": 1000 }
{ "type": "hbm:fluid_item", "item": "hbm:canister_full", "fluid": "hbm:gasoline" }
{ "type": "hbm:cold", "item": "hbm:waste_plate_mox" }
{ "type": "hbm:any_of", "of": [{ "ingredient": "#c:ingots/coal" }, { "ingredient": "#c:dusts/coal" }] }
```

### Stirling engine

The `anvil_smithing`, `anvil_construction`, `press`, `ammo_press`, `arc_welder`, `soldering`, `combination`,
`particle_accelerator` and `sawmill` tables also accept:

```json
{ "type": "hbm:stirling", "item": "hbm:machine_stirling", "has_cog": false }
```

It matches a Stirling engine with (`true`) or without (`false`) its gear. Both fields are required.

### Plain item-or-tag strings

Some keyed tables take a plain string instead of an ingredient object: an item id or `#` and a tag, no count
(`"input": "#c:ingots/iron"`). These are `shredder`, `liquefaction`, `material_distribution`, `lemegeton`, `magic`
and the pedestal grid. A few fields take a plain item id only, with no tag: `breeder` and `electrolyser_metal`
inputs and the `cyclotron` particle. Each page says which form a field takes.

## Item stacks

Where a table outputs a single item stack (most record tables), the form is:

| Form | Meaning |
|---|---|
| `"id"` | One item. |
| `{"id", "count", "item_data"}` | `count` defaults to 1; `item_data` is optional [item data](#item-data). |

Some record tables take an **item output without data**: `"id"` or `{"id", "count"}` only. Each page says which form a
field takes.

## Item data

Item data states the few HBM data values a recipe may need, in one form on every Minecraft version (never raw NBT or
data components):

| Field | Type | Meaning |
|---|---|---|
| `fluid` | fluid id | The fluid of a container, fluid icon or fluid-holding item. |
| `fluid_amount` | int | The fill in mB. |
| `fluid_pressure` | int | The fluid's pressure. |
| `broken_item` | item id string | What a `hbm:broken_item` is broken from. |
| `blueprint_pool` | string | The pool of a `hbm:blueprints` item. |

```json
{ "id": "hbm:fluid_pack_full", "item_data": { "fluid": "hbm:oxygen", "fluid_amount": 32000 } }
{ "id": "hbm:blueprints", "item_data": { "blueprint_pool": "528.arty" } }
```

### Raw item data

A generic row's outputs and `icon` may also carry data HBM has no name for (another mod's item, a block entity inside
a crate), in the Minecraft version's own spelling: `"components"` (a data component map, 1.20.5+) or `"nbt"` (an SNBT
string, 1.20.1). The two are not interchangeable, so such a file works on one side of 1.20.5 only; prefer `item_data`
where it can state the value. KubeJS writes this form for you when an output stack has data.

```json
{ "id": "superbwarfare:container", "components": { "minecraft:block_entity_data": { "id": "superbwarfare:container", "EntityType": "superbwarfare:lav_150" } } }
{ "id": "superbwarfare:container", "nbt": "{BlockEntityTag:{EntityType:\"superbwarfare:lav_150\"}}" }
```

## Fluid stacks

```json
{ "type": "hbm:lightoil_crack", "amount": 500, "pressure": 1 }
```

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `type` | fluid id | yes | | Any registered fluid: HBM's (`hbm:oxygen`), vanilla's (`minecraft:water`, `minecraft:lava`) or another mod's. |
| `amount` | int | yes | | mB. |
| `pressure` | int | no | `0` | Pressure level. A machine's input tank must hold the fluid at exactly this pressure; fluid is pressurised in the [compressor](../fluid-machines/#compressor). |

Fluids are named by their vanilla registry id. HBM's own fluids are `hbm:<name>` in lower case.

## Material stacks

Molten metal in the crucible, foundry and arc furnace is counted in quanta: 72 to the ingot, 8 to the nugget.

```json
{ "material": "steel", "amount": 72 }
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `material` | material name | yes | An HBM material by name. |
| `amount` | int, above 0 | yes | Quanta. |
