---
title: KubeJS setup
description: Which targets and KubeJS versions NTM - Continuum supports, where scripts go, and the known version traps.
sidebar:
  order: 1
---

NTM - Continuum has no KubeJS dependency and ships no KubeJS code. Its library, Golem Core, contains a KubeJS plugin
that turns what HBM declares into KubeJS features: one recipe type per machine table, the `HBM` global and the
`HBMEvents` event group. The same script works on every target that has KubeJS.

## Supported targets

| Target | KubeJS line | Tested with | Status |
|---|---|---|---|
| 26.1 NeoForge | 8.x | KubeJS `26.1.2-8.0.6`, Rhino `2101.2.8-build.91` | Supported (see [NeoForge version](#neoforge-version-on-261)) |
| 1.21.1 NeoForge | 7.x | KubeJS `2101.7.2-build.379`, Rhino `2101.2.7-build.81` | Supported |
| 1.20.1 Forge | 6.x | KubeJS `2001.6.5-build.26`, Rhino `2001.2.2-build.17`, Architectury `9.1.12` | Supported |
| 1.20.1 Fabric | 6.x | KubeJS `2001.6.5-build.26`, Rhino `2001.2.2-build.17`, Architectury `9.1.12` | Supported (fluid amounts in droplets, see [Troubleshooting](../troubleshooting/#fluid-amounts-mb-and-droplets)) |
| 26.1 Fabric | none | | Inert: no KubeJS release exists for this target |
| 1.21.1 Fabric | none | | Inert: no KubeJS release exists for this target |

"Inert" means the KubeJS plugin is not compiled into Golem Core for that target. Nothing breaks; there is just no
`HBM` global, no `HBMEvents` and no `event.recipes.hbm`. Datapacks still work there, so prefer a datapack for anything
that must work on all six targets.

Without KubeJS installed, none of this costs anything: HBM's event forwarding is only set up after KubeJS has run its
startup scripts.

:::caution[Install Better Advanced Tooltips with KubeJS 7 and 8]
KubeJS 7 (1.21.1 NeoForge) and 8 (26.1 NeoForge) load classes from Better Advanced Tooltips while registering, even
though their mod metadata lists it as optional. Add it to the pack with KubeJS. The dev runs use
`2101.1.0-build.6` on 1.21.1 and `2601.1.0-build.11` on 26.1.
:::

## Where scripts go

Scripts live in the instance's `kubejs/` folder, as with any KubeJS mod:

| Folder | Runs | Use it for |
|---|---|---|
| `kubejs/startup_scripts/` | once, at game start, on client and server | `HBMEvents.registry` (new materials), KubeJS's own item and fluid registration |
| `kubejs/server_scripts/` | on the logical server, again on `/reload` | `ServerEvents.recipes` with `event.recipes.hbm.*`, every other `HBMEvents.*` handler, the `HBM` global |
| `kubejs/client_scripts/` | on the client | nothing HBM-specific; the `HBM` global is bound here too, but its setters do nothing on a client |
| `kubejs/data/` | loaded as a datapack, again on `/reload` | HBM's data files, see [below](#data-files-in-a-kubejs-pack) |

A startup script that adds materials must be present on both the client and the server, unchanged. See
[Startup registry](../startup-registry/#client-and-server-must-match).

## Data files in a KubeJS pack

Much of HBM is changed with data files, not scripts: fluid properties, data maps, recipe removal lists, item pools and
the fallout transform. In a KubeJS pack they go in `kubejs/data/`, which KubeJS 6, 7 and 8 all load as a datapack. The
path inside is the datapack path without the leading `data/`, and `/reload` applies changes as it does for scripts.

| To change | File in a KubeJS pack | Format |
|---|---|---|
| A machine recipe | a script (`event.recipes.hbm.*`), or `kubejs/data/<ns>/recipe/<table>/<name>.json` (`recipes` on 1.20.1) | [Recipe scripts](../recipe-scripts/), [Machine recipes](../recipes/overview/) |
| Remove recipes by id | `event.remove(...)`, or `kubejs/data/<ns>/recipe_removals/<name>.json` | [Removing recipes](../recipes/removing-recipes/) |
| A data map value (hazards, fuels, armor, ...) | `kubejs/data/<ns>/value_maps/patches/hbm/<registry>/<map>.json` | [Data maps](../data-maps/overview/) |
| An HBM fluid's properties | `kubejs/data/<ns>/fluid_property_patch/hbm/<fluid>.json` | [Fluids](../data/fluids/#patching-a-fluid-you-do-not-own) |
| A KubeJS fluid's HBM properties | `kubejs/data/kubejs/fluid_property/<fluid>.json` | [Fluids](../data/fluids/), [Startup registry](../startup-registry/#fluids) |
| Item pools, fallout, tags | as in a datapack, under `kubejs/data/` | [Item pools](../data/item-pools/), [Fallout transform](../data/fallout-transform/), [Tags](../data/tags/) |

`<ns>` is your own namespace, such as your pack's name. Use the patch folders above, not a copy of HBM's file at its own
path: they apply after HBM's files on every loader, while a copy at HBM's path depends on pack order.

## What this section covers

- [Recipe scripts](../recipe-scripts/): every HBM machine table as `event.recipes.hbm.<table>`, with its arguments.
- [The HBM global](../hbm-global/): radiation, exposure, fluid and material lookups from any script.
- [HBMEvents](../events/): explosions, bombs, missiles, machine operations and radiation doses.
- [Startup registry](../startup-registry/): new crucible materials, and new fluids HBM understands.
- [Examples](../examples/) and [Troubleshooting](../troubleshooting/).
- The shared reference pages in this topic's sidebar: machine recipes, data maps, fluids and other data files, and the
  [reference tables](../reference/recipe-tables/).

## Checking that it works

After the game starts, look for these lines in the main log:

- `Registered N recipe table schema(s) with KubeJS` (logger "Golem Core scripts"): one schema per machine table.
- `[HBM] Added N material(s) from startup scripts`: printed when a startup script requested materials.

A quick server script check:

```js title="kubejs/server_scripts/check.js"
ServerEvents.recipes(event => {
  console.info(`hbm press schema: ${typeof event.recipes.hbm.press}`)  // "function"
  console.info(`HBM global: ${typeof HBM}`)                           // "object"
})
```

## NeoForge version on 26.1

KubeJS 8.0.6 crashes on the first world load with NeoForge 26.1.2.110 or newer. Its `WorldLoaderMixin` targets
vanilla's 4-argument `RegistryDataLoader.load`; NeoForge 26.1.2.110 patched that call to 5 arguments, so the mixin finds
no target ("Scanned 0 target(s)"). This is a KubeJS bug, not an HBM one, and KubeJS's source already has the fix.

Until a KubeJS release with the fix is out, run NeoForge **26.1.2.109** in a KubeJS pack. NTM - Continuum and Golem Core
accept NeoForge 26.1.2.109 and newer on 26.1 for this reason, even though they are built against a newer NeoForge.
Packs without KubeJS can use any NeoForge from 26.1.2.109 up.

## Load order

KubeJS runs startup scripts inside its own mod constructor, so a mod's startup events only reach startup scripts if that
mod was set up before KubeJS. Golem Core handles this for you:

- On NeoForge and Forge, every Golem-based mod's metadata lists KubeJS as an optional dependency ordered `BEFORE`.
- On Fabric (and as a second guard on Forge 1.20.1, which constructs mods in parallel), Golem Core's KubeJS plugin runs
  the pending declarations itself before KubeJS asks for them.

If something still loads late, the log says so:

```
Script group HBMEvents was declared after KubeJS loaded its plugins: startup scripts cannot see it (is its mod ordered BEFORE kubejs?)
```

Server and client scripts still get the group in that case; only startup scripts miss it.
