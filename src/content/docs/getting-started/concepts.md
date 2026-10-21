---
title: Key concepts
description: Ids, namespaces, units, tags, config gates, how data files combine, and what differs between the six targets.
sidebar:
  order: 3
---

These rules hold for datapacks, KubeJS scripts and addon mods alike. The other pages assume you know them.

## Namespaces and ids

- HBM's content uses the namespace `hbm`: `hbm:ingot_uranium`, `hbm:machine_press`, `hbm:oil`.
- Your content uses your own namespace. Never put files under `data/hbm/` to add something; HBM may ship a file at
  the same path later, and pack order decides which one wins. The exception is a tag file, which merges (see
  [Tags](../../datapacks/data/tags/)).
- Machine recipe ids are `<namespace>:<table>/<file name>`, for example `hbm:press/ball_resin` for
  `data/hbm/recipe/press/ball_resin.json`. You need the id to [remove a recipe](../../datapacks/recipes/removing-recipes/).
- "1.7" on this wiki means HBM's Nuclear Tech Mod for Minecraft 1.7.10, the behaviour NTM - Continuum follows.

## Everything is saved by name

NTM - Continuum never saves numeric ids. Fluids, block states, materials and enum values are stored by their registry
name or enum name (`"hbm:oil"`, `"iron"`, `"high"`). For you this means:

- Fluids are always written as ids: `"hbm:hydrogen"`, `"minecraft:water"`, `"minecraft:lava"`. Water, lava and "no
  fluid" (`minecraft:empty`) are vanilla's own ids.
- Materials (for the foundry and crucible) are written by name: `"iron"`, `"steel"`.
- 1.7's numeric fluid ids and metadata values do not exist in any file format. A 1.7 item family that used
  metadata values is one item per value here, each with its own id.

## Fluids are vanilla fluids

Every HBM fluid is also registered as a vanilla `Fluid`, and **any** registered fluid works in HBM's ducts, tanks and
recipes. A fluid made by another mod, or by KubeJS, is an HBM fluid as soon as it exists. A datapack can give it HBM
properties (temperature, traits, hazards) with a `fluid_property` file. See [Fluids](../../datapacks/data/fluids/).

## Units

| Quantity | Unit |
|---|---|
| Fluid amounts | millibuckets (mB); 1000 mB is one bucket. Fabric's own fluid API counts droplets (81 per mB); HBM converts at the boundary, so you never write droplets. |
| Power | HE, HBM's energy unit. In the recipe-module machines (assembler, chemical plant and the others that share the [common fields](../../datapacks/recipes/common-fields/)), `power` is HE per tick. |
| Time | ticks, 20 per second (`duration`, effect durations, delays). |
| Temperature | °C (`temperature` in fluid properties). |

## Tags

Ingredients may name an item tag with `#`, like `#c:ingots/lead`. HBM uses the common `c:` convention tags on every
loader. On 1.20.1 Forge, HBM also publishes its `c:` tags under `forge:` and points its crafting recipes at those, but
machine recipes and data maps still read `c:`. See [Tags](../../datapacks/data/tags/).

## How data files combine

When two packs ship a file at the same path, one of two things happens:

- **Merge**: every pack's copy is read and combined. Data maps, item pools and vanilla tags work this way.
- **Replace**: only the highest-priority pack's copy is read. Everything else works this way: recipes, fluid
  property files, fallout transform files, removal lists and patches.

Pack order between mods is not the same on every loader (on Fabric 1.20.1 it follows the mod list), so never rely on
replacing another mod's file. Change it from your own namespace instead: a [removal
list](../../datapacks/recipes/removing-recipes/) for recipes, a patch for fluids and data maps, or a merging file. Files
under your own namespace never collide with anyone else's. The [datapack overview](../../datapacks/overview/) lists
every folder and how it combines.

## Configuration gates

Some HBM recipes only exist under a config option from 1.7's `config/hbm.cfg` (for example 528 mode, expensive mode
or LBSM, "less bullshit mode"). A machine recipe states this with a `requires` field where its table has one; any other recipe file
(crafting, smelting, or a table without that field) uses a top-level `golem:requires` list. Machine tables re-test
their rows when the config changes; `golem:requires` is checked at each datapack load, so run `/reload` after
changing the config. See [Requires](../../datapacks/recipes/common-fields/#requires) and
[golem:requires](../../datapacks/recipes/removing-recipes/#golemrequires).

## One tree, six targets

The mod is written once against 26.1 and built for 1.21.1 and 1.20.1 through Golem Core. HBM's own data formats
(machine recipes, data maps, fluid properties, item pools, fallout rules) are the same on all targets. Only
vanilla's and the loaders' own formats differ by version:

| | 26.1 | 1.21.1 | 1.20.1 |
|---|---|---|---|
| Data pack format | `min_format`/`max_format` 101 | `pack_format` 48 | `pack_format` 15 |
| Recipe folder | `recipe/` | `recipe/` | `recipes/` |
| Other vanilla folders | singular (`loot_table/`, `tags/item/`) | singular | plural (`loot_tables/`, `tags/items/`) |
| Vanilla crafting ingredient | `"minecraft:stick"` | `{"item": "minecraft:stick"}` | `{"item": "minecraft:stick"}` |
| Item stack extra data | components | components | NBT `tag` |
| Convention tag namespace | `c:` | `c:` | `c:` (Fabric), `forge:` and `c:` (Forge) |

The [datapack overview](../../datapacks/overview/#version-differences) has the full folder list, and
[Removing recipes](../../datapacks/recipes/removing-recipes/#load-conditions-per-loader) has the loaders' load
conditions, which also differ per loader.
