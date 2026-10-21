---
title: Troubleshooting
description: Common KubeJS problems with NTM - Continuum, from threads and fluid units to error messages and Fabric.
sidebar:
  order: 7
---

## Nothing HBM-related exists

`event.recipes.hbm` is undefined, or `HBM` / `HBMEvents` is not defined.

- **Check the target.** 26.1 Fabric and 1.21.1 Fabric have no KubeJS release, so the HBM script features are not there.
  See [Setup](../setup/).
- **Check the log** for `Registered N recipe table schema(s) with KubeJS`. If it is missing, Golem Core's KubeJS plugin
  did not load: KubeJS is not installed, or it is a KubeJS line the target does not support.
- **Only in startup scripts?** Look for `Script group HBMEvents was declared after KubeJS loaded its plugins`. Startup
  scripts then miss `HBMEvents` (server scripts still have it). Golem Core orders its mods before KubeJS, so this
  points at a pack that overrides mod order.

## The game crashes on the first world load (26.1 NeoForge)

KubeJS 8.0.6 does not work with NeoForge 26.1.2.110 or newer: its world-loader mixin finds no target ("Scanned 0
target(s)"). Use NeoForge 26.1.2.109 until a fixed KubeJS release is out. NTM - Continuum accepts 26.1.2.109.

## Threads on KubeJS 6

On 1.20.1 (KubeJS 6), some events are posted **off the server thread**, chat (`PlayerEvents.chat`) among them.
Touching the world from there is unsafe.

- The [chunk radiation](../hbm-global/#chunk-radiation) methods of `HBM` handle this themselves: a write is queued onto
  the server thread, a read waits for it.
- Everything else that changes the world (spawning entities, explosions, the entity setters of `HBM`) belongs in
  `server.execute(...)`:

```js
PlayerEvents.chat(event => {
  const player = event.player
  const server = player.level.server
  if (event.message == 'rad me') {
    server.execute(() => {
      HBM.setRadiation(player, 100)
      HBM.setChunkRadiation(player.level, player.blockPosition(), 50)
    })
  }
})
```

All `HBMEvents` server events are posted on the server thread on every KubeJS line, so their handlers need none of this.

Another Rhino trap: a `const` or `let` declared inside an `if` block is scoped to the whole handler function, so two
`if` blocks in one handler cannot each declare the same name. Declare it once at the top, or use different names.

## Fluid amounts: mB and droplets

HBM counts fluids in millibuckets (mB) everywhere. What KubeJS counts depends on the line and loader:

| KubeJS | Loader | `Fluid.of(id, n)` means |
|---|---|---|
| 8 (26.1) | NeoForge | n mB |
| 7 (1.21.1) | NeoForge | n mB |
| 6 (1.20.1) | Forge | n mB |
| 6 (1.20.1) | Fabric | n **droplets** (81 per mB, 81,000 per bucket) |

The adapter converts what KubeJS hands it into mB (`amount × 1000 / bucket`, rounded down). So on 1.20.1 Fabric
`Fluid.of('hbm:oxygen', 500)` becomes 6 mB, and anything under 81 droplets becomes 0.

Two forms mean the same on every target:

- HBM's plain object, which is written unchanged and is always mB: `{type: 'hbm:oxygen', amount: 500}`.
- A bare fluid id, which is one bucket (1000 mB): `'hbm:oxygen'`.

Fields that hold only a fluid id (for example a refinery's `input`) ignore the amount entirely.

## Reading a recipe error

A typed value the field cannot hold fails with the table id, the field and the reason:

```
hbm:shredder.input: this input takes no count (got 2)
hbm:press.output: this output takes no chance: minecraft:diamond
hbm:cyclotron.particle: this input takes an item, not the tag #minecraft:logs
hbm:annihilator.tag: this input takes a tag, not the item minecraft:stone
hbm:press.input: takes one item or one tag, not ...
hbm:press.input: empty ingredient: ...
```

The fix is in the field's form ([Signatures](../recipe-scripts/#signatures)): drop the count, use one item instead of a tag, or
write the value as a plain object in HBM's JSON form.

`empty ingredient`, `empty item` and `empty fluid` usually mean an id that does not exist on this target (a typo, or an
item from a mod that is not installed).

A plain object is not checked by the script. If it is wrong inside, the table reports it when it reads the recipe, in
the log, like a broken datapack file.

## A recipe works but the machine finishes instantly or uses no power

A generic-table recipe (chemical plant, assembler, ...) without `.duration(...)` and `.power(...)` gets 0 for both. Set
them.

## `HBM.contaminate` returns false

It returns `false` when the dose did not get through: on a client, for an unknown hazard or protection name, for a
spectator or creative player (except with `NONE` and `DIGAMMA2`), for a player whose armour blocks it, for a player in
the first 200 ticks after joining or respawning, and for radiation on a radiation-immune entity. Use
`HBM.addRadiation` to skip all of these.

## An event never fires

- `HBMEvents.*` server events need a **server** script; `HBMEvents.registry` needs a **startup** script.
- `entityIrradiated` does not fire when the `RADIATION_00_enableContamination` config is off, for `HBM.addRadiation`,
  or for doses of 0.
- `bombDetonated` covers detonators only, not redstone.
- `explosion` covers HBM's own explosions, not vanilla TNT or creepers. Nuclear blasts are `nuclearBlast`.

## A data file in kubejs/data has no effect

- **Check the path.** It is the datapack path without the leading `data/`: `kubejs/data/<ns>/value_maps/...`, not
  `kubejs/data/data/<ns>/...` or `kubejs/value_maps/...`. Folder names are on the page for each file type; see
  [Data files in a KubeJS pack](../setup/#data-files-in-a-kubejs-pack).
- **Run `/reload`** after changing a file, or restart.
- **Read the log.** A data map value that does not decode is skipped with
  `Data map <map>: skipping <key>: <reason>`; the rest of the file still loads.
- **Changing HBM's own values?** Use the patch folders (`value_maps/patches/hbm/...`, `fluid_property_patch/hbm/...`) or
  a `recipe_removals` list. A copy of HBM's file at its own path depends on pack order, which is not the same on every
  loader.

## A script material is missing

Look for `[HBM] Added N material(s) from startup scripts` and `[HBM] Script material '<name>' skipped: <reason>` in the
log. The usual reasons are a name already taken and a `smeltsInto` target that does not exist. If the material exists
but its items do not melt, check that they carry the right `c:` tags and that the material (or the one it melts into)
is `SMELTABLE` or `ADDITIVE`. See [Startup registry](../startup-registry/#how-items-become-the-material).

If materials look wrong in multiplayer, make sure the client runs the same startup scripts as the server.

## Fabric notes

- **26.1 Fabric and 1.21.1 Fabric:** no KubeJS. Use datapacks for recipes and properties there.
- **1.20.1 Fabric:** KubeJS 6 with Architectury. Fluid amounts are droplets (see above). Fabric has no mod ordering in
  its metadata, so Golem Core's KubeJS plugin makes sure HBM's declarations exist before KubeJS reads them; you do not
  need to do anything.
