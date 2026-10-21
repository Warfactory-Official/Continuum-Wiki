---
title: Removing recipes
description: Remove HBM's machine rows or any other recipe with recipe_removals lists, gate recipes on HBM's config with golem:requires, and load conditions per loader.
sidebar:
  order: 3
---

This page covers taking recipes out of the game: removal lists for any recipe, `golem:requires` to tie a recipe to
HBM's config, and the loaders' own load conditions. To change one of HBM's rows, remove it here and add your own as
described in [replacing an HBM row](../overview/#replacing-an-hbm-row).

## Removal lists

To remove recipes, list their ids in a file under `data/<your namespace>/recipe_removals/`:

```json title="data/mypack/recipe_removals/hbm_changes.json"
{
  "recipes": [
    "hbm:chemical_plant/sulfuricacid",
    "hbm:press/ball_resin",
    "hbm:assembly_machine/acidizer"
  ]
}
```

- The file name and any subfolders are free (`recipe_removals/machines/press.json` works too). The folder name is
  `recipe_removals` on every Minecraft version, including 1.20.1.
- `recipes` is a list of full recipe ids, `<namespace>:<path>`. For HBM's machine rows that is
  `hbm:<table>/<file name without .json>`; see [recipe ids](../overview/#recipe-ids).
- The lists of all datapacks and mods are merged. Every id listed in any of them is removed.
- **Any recipe type** can be removed this way, not only machine rows: crafting, smelting, stonecutting, other mods'
  recipes. Golem Core takes them out of the server's recipe manager after every load, before recipes are sent to
  players, so recipe books, JEI and REI never see them.
- The lists are read again on every `/reload`.
- An id that does not exist does nothing.
- Only recipe files can be removed. Rows that a machine adds in code (see
  [rows that are not files](../overview/#rows-that-are-not-files)) have no id and stay.
- Two files at the **same** path in the same namespace replace each other like any datapack file (the higher pack
  wins). Keep your lists in your own namespace and they never collide with another pack's.

After a load that removed something, the server log has one line such as:

```text
Removed 3 recipe(s) listed in recipe_removals files or with unmet golem:requires (3 id(s) listed, 0 unmet)
```

:::caution[Do not override HBM's files by path]
Putting a file at HBM's own path (`data/hbm/recipe/press/ball_resin.json`) to replace or blank it out is not reliable.
Which pack wins a path depends on pack order, and mod packs are not ordered the same way on every loader (on Fabric
1.20.1 they follow the mod list, not dependencies). Use a removal list, then add your own row under your own namespace.
:::

## golem:requires

Any recipe file, of any type, may carry a top-level `golem:requires` list. The recipe exists only while every entry
holds; prefix an entry with `!` to negate it. The loaders' recipe parsers ignore the unknown key, so the file loads as
usual, and Golem Core removes the recipe after the load when a condition fails, the same way as a removal list.

```json title="data/mypack/recipe/easy_steel.json"
{
  "golem:requires": ["lbsm_simple_alloy"],
  "type": "minecraft:smelting",
  "ingredient": "minecraft:iron_ingot",
  "result": { "id": "hbm:ingot_steel" },
  "experience": 0.1,
  "cookingtime": 200
}
```

- The value is a list of strings, or a single string.
- The entries are the flags HBM declares: `enable_528`, `expensive_mode`, `enable_528_pressurized`, `lbsm`,
  `lbsm_simple_chemistry`, `lbsm_simple_centrifuge`, `lbsm_simple_crafting`, `lbsm_simple_alloy`,
  `lbsm_unlock_anvil`, `lbsm_simple_armor`, `lbsm_simple_tool`, `lbsm_simple_medicine`. Their meaning is in
  [common fields](../common-fields/#requires).
- The `#tag` form of a machine row's `requires` is **not** supported here. An undeclared flag fails: the recipe is
  removed, with a warning naming it.
- The flags are read at each datapack load, so after changing the config, run `/reload`.
- HBM itself uses this for 1.7's config-dependent crafting recipes.
- The smelting example above uses the 1.21+ result shape. Write the recipe body in the shape your Minecraft version
  expects; only the `golem:requires` key is the same everywhere.

For machine rows, prefer the row's own `requires` field where the table has one: it is re-tested when the config
changes, without a reload, and it supports `#tag`. `golem:requires` is for recipe types that have no such field
(crafting, smelting, other mods' recipes) and for the HBM tables that have none.

## Load conditions per loader

To load a recipe only when another mod is present, use the loader's own condition key. These are standard loader
features, not HBM's, and each loader spells them differently:

| Loader | Key and spelling |
|---|---|
| NeoForge 1.21.1 | `"neoforge:conditions": [{"type": "neoforge:mod_loaded", "modid": "mekanism"}]` |
| NeoForge 26.1 | as 1.21.1; "never" is `{"type": "neoforge:never"}` (1.21.1: `neoforge:false`) |
| Forge 1.20.1 | `"conditions": [{"type": "forge:mod_loaded", "modid": "mekanism"}]` in recipes (`"forge:conditions"` in other data files); "never" is `{"type": "forge:false"}` |
| Fabric 1.21.1, 26.1 | `"fabric:load_conditions": [{"condition": "fabric:all_mods_loaded", "values": ["mekanism"]}]`; "never" is `{"condition": "fabric:not", "value": {"condition": "fabric:true"}}` |
| Fabric 1.20.1 | as above, but there is no `fabric:true`; "never" is `{"condition": "fabric:any_mod_loaded", "values": []}` |

Negation is `neoforge:not` / `forge:not` / `fabric:not` with a `value`. Golem Core's build writes the conditions key
as the first key of the file; do the same in your own files.

### golem:conditions (mods built with Golem Core only)

Mods built on Golem Core, HBM among them, write one neutral key in their source and let the build rewrite it into the
spellings above for each target:

```json
"golem:conditions": [{ "type": "mod_loaded", "mod": "mekanism" }]
```

The neutral forms are `{"type": "never"}`, `{"type": "mod_loaded", "mod": "<id>"}` and
`{"type": "not", "value": <condition>}`; all listed conditions must hold. This is a **build step**
(`recipe-conditions.gradle.kts`, applied to a mod's `processResources`), not a runtime feature: the game never reads
`golem:conditions`. In a plain datapack it does nothing, so a datapack uses the loader spellings from the table above.

Conditions only decide whether **your** file loads. They cannot remove another mod's recipe; use a removal list for
that.
