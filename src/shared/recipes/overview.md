---
title: Machine recipes
description: How HBM's machine recipe tables work as datapack recipes, how they load, sort and sync, and how to add or replace a row.
sidebar:
  order: 1
  label: Overview
---

Every HBM machine that has a recipe list reads it from a **recipe table**. A table is an ordinary vanilla recipe type,
so its rows are plain recipe files in a datapack. There is no HBM-specific folder, no script and no config file
involved: you add a JSON file, run `/reload`, and the machine knows the recipe.

## Where rows live

A row is a recipe file whose `type` names the table:

```json title="data/mypack/recipe/press/plate_tin.json"
{
  "type": "hbm:press",
  "stamp": "plate",
  "input": { "ingredient": "#c:ingots/tin" },
  "output": "mypack:plate_tin"
}
```

- The `type` is always `hbm:<table>`. The list of tables is in the
  [recipe table reference](../../reference/recipe-tables/).
- The file can sit anywhere under `data/<namespace>/recipe/`. HBM keeps each table in a folder of the same name
  (`data/hbm/recipe/press/`), and it is a good habit to do the same.
- On 1.20.1 the vanilla folder is `recipes` (plural): `data/<namespace>/recipes/press/plate_tin.json`. The file
  contents are the same on every Minecraft version and loader.
- The fields after `type` depend on the table. About half the tables share one schema, described in
  [common fields](../common-fields/); the others have a record of their own, described on each machine's page.

## Recipe ids

A row's id is the vanilla recipe id: namespace, then the path under the recipe folder, without `.json`. HBM's own
rows are `hbm:<table>/<name>`, for example:

| File | Recipe id |
|---|---|
| `data/hbm/recipe/chemical_plant/oxygen.json` | `hbm:chemical_plant/oxygen` |
| `data/hbm/recipe/press/ball_resin.json` | `hbm:press/ball_resin` |
| `data/hbm/recipe/precision_assembler/atomic_clock.recycle.enable_528.expensive_mode.json` | `hbm:precision_assembler/atomic_clock.recycle.enable_528.expensive_mode` |

You need the id to [remove a row](../removing-recipes/). HBM's file names are what HBM generated; they are not
always the recipe's display name, so look the id up in HBM's jar (or in the source repository under
`build/generated/data/pack/data/hbm/recipe/`) instead of guessing it.

Tables built on the common schema also have a `name` field (`"chem.oxygen"`). That is a different thing from the
recipe id: it is the internal name machines save and show. See [names and replacing](#replacing-an-hbm-row).

## Loading, syncing and `/reload`

- Rows load with the rest of the datapack: on server start and on every `/reload`. A file that fails to parse is
  skipped and the server log names it; the rest of the table still loads.
- After each load the server sends every table to every client with its own sync packet, on join and after every
  `/reload`. Recipe viewers (JEI, REI) and machine screens on the client therefore always show the server's rows,
  also on 26.1 where vanilla sends no custom recipe types to clients.
- Machines rebuild their lookup after every load, so a `/reload` takes effect at once, without a restart or
  replacing the machine.
- Unknown keys in a row are ignored, as in any vanilla recipe. A misspelt optional field (`"ordre"`) is therefore
  silently left at its default. Check the field names against the page of the table.

### Config switches

Some rows only exist under a config switch, as 1.7 registered them only in certain modes (528 mode, expensive mode,
"less bullshit mode"). Those rows carry a `requires` list. For the tables built on the common schema, and for
`centrifuge` and `soldering`, the condition is tested again whenever the config value changes, without a reload.
For `annihilator` and `anvil_construction` it is tested when the table loads, so run `/reload` after changing the
config. The `crystallizer` has a `requires` of its own that names a tag, not a config switch. Details and the list of
flags: [common fields](../common-fields/#requires).

## Order: the first match wins

1.7 kept each machine's recipes in a list and used the first one that matched. Many tables carry this list position
as `order`:

- Rows are sorted by `order`, lowest first. Equal orders keep recipe-id order (string order of the full id, so
  `hbm:press/x` comes before `mypack:press/x`).
- A row without `order` gets the largest possible value, so it comes **after all of HBM's rows** (HBM numbers its rows
  from 0 in 1.7's order).
- For tables that match by input, the first matching row in that order is used. For tables picked from a selector
  screen, `order` is the display order.

So if your new press row has the same input and stamp as one of HBM's, HBM's row wins unless you give yours a lower
`order` (or remove HBM's row). Which tables have `order`, and what it does there, is stated on each table's page.

A few tables have no `order` and are keyed instead (by input fluid, input item or name). For those, two rows with the
same key resolve as the table's page says; most of them keep the row that comes last in recipe-id order, a few the
first. The safe way to change such a row is always to remove HBM's row and add your own.

## Adding a recipe, step by step

1. Pick the table. The [recipe table reference](../../reference/recipe-tables/) lists the type id and the machine for
   each one.
2. Copy a similar HBM row as a starting point. HBM's rows are in its jar under `data/hbm/recipe/<table>/`
   (`recipes/` on 1.20.1); every machine page here shows one.
3. Save it in your datapack under your own namespace, for example
   `data/mypack/recipe/chemical_plant/my_acid.json`, with `"type": "hbm:chemical_plant"`.
4. Change the inputs and outputs. For a table with a `name` field, pick a name no other row uses (see below).
5. Leave out `order` to put the row after HBM's, or set it to sit among them.
6. Run `/reload` and look for the recipe in the machine's screen or in JEI/REI. If it is missing, search the server
   log for your recipe id: a parse error names the file and the field.

A complete common-schema row:

```json title="data/mypack/recipe/chemical_plant/my_acid.json"
{
  "type": "hbm:chemical_plant",
  "name": "mypack.my_acid",
  "input_items": [{ "ingredient": "#c:dusts/sulfur", "count": 2 }],
  "input_fluids": [{ "type": "minecraft:water", "amount": 1000 }],
  "output_fluids": [{ "type": "hbm:sulfuric_acid", "amount": 500 }],
  "duration": 100,
  "power": 1000
}
```

## Replacing an HBM row

To change one of HBM's recipes, **remove HBM's row and add your own**:

```json title="data/mypack/recipe_removals/hbm_changes.json"
{ "recipes": ["hbm:chemical_plant/sulfuricacid"] }
```

plus your replacement file in `data/mypack/recipe/chemical_plant/`. Do not put a file at HBM's own path
(`data/hbm/recipe/...`) to override it; [removing recipes](../removing-recipes/) explains why and covers removal
lists in full.

What happens with names when you do not remove the original:

- **Common-schema tables** (assembly machine, chemical plant, PUREX, ...): when two rows have the same `name`, the
  first one in `order` is kept and the other is dropped with a warning in the log
  (`Recipe name ... appears twice ...; keeping the first`). A replacement without `order` sorts after HBM's row and is
  the one dropped. So: remove HBM's row, and give your row **the same `name` and the same `order`** as the row it
  replaces. Machines that had the old recipe selected keep running it, because they save the `name`, and it stays in
  the same place in the selector.
- **Crucible**: the same rule, by `name`.
- **Keyed tables** (by fluid, item or tag): see the table's page. Remove-and-add works on all of them.
- **Ammo press and anvil construction** save the recipe **id**, not a name. A replacement under your own id is a new
  recipe for machines that had the old one selected.

HBM's own data uses duplicate names on purpose in one case: a recipe that has two variants for two config modes is two
files with the same `name` and opposite `requires`. For example `chemical_plant/bakelite.json` and
`chemical_plant/bakelite.enable_528_pressurized.json` are both `chem.bakelite`, one with `"!enable_528_pressurized"`
and one with `"enable_528_pressurized"`. Only one of them is active at a time, so they never clash.

## Rows that are not files

Some machines add rows by rule, in code, on top of their table, exactly as 1.7 did: the assembly machine's fluid
pack/unpack recipes, the arc furnace's per-material melting, the shredder's tag sweeps and scrap fallback, the
liquefactor's food fallback, radiolysis copying every cracking row, the compressor's generic +1 pressure step, and
a few more. These are not recipes, so they cannot be removed with a removal list; each machine page says which rules
exist and how they interact with data rows.
