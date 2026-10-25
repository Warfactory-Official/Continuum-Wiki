---
title: Choosing an approach
description: When to use a datapack, a KubeJS script or an addon mod to change NTM - Continuum.
sidebar:
  order: 2
---

This page helps you pick a section. There are three ways to change NTM - Continuum. They build on each other: a KubeJS script can do everything a
datapack can, and an addon mod can do everything both can.

## Datapacks

A datapack is a folder or zip of JSON files. It needs no other mod and works on all six targets.

Use a datapack to:

- add machine recipes, or remove HBM's ([Machine recipes](../../datapacks/recipes/overview/), [Removing recipes](../../datapacks/recipes/removing-recipes/))
- change fluid properties ([Fluids](../../datapacks/data/fluids/))
- change per-item, per-block and per-fluid values such as hazards, fuels and armour protection ([Data maps](../../datapacks/data-maps/overview/))
- change what nuclear fallout turns blocks into ([Fallout transform](../../datapacks/data/fallout-transform/)), HBM's
  item pools ([Item pools](../../datapacks/data/item-pools/)), and mob drops and structure loot
  ([Advancements and loot](../../datapacks/data/advancements-and-loot/))
- add blocks or items to the tags HBM reads, and change HBM's world features and structures
  ([World generation](../../datapacks/data/worldgen/), [Datapack overview](../../datapacks/overview/))

A datapack cannot add new items, blocks or fluids by itself, and cannot run code when something happens.

Some settings are config files, not datapacks: 1.7's `hbm.cfg` (recipe modes, structure weights, radiation switches)
and `hbmMachines.json` (machine power, tanks and speeds). They apply to the whole game or server. See
[Config files](../../datapacks/reference/config/) and [Machine settings](../../datapacks/reference/machine-settings/).

## KubeJS scripts

[KubeJS](https://kubejs.com) runs JavaScript inside the game. NTM - Continuum supports it on the four targets that have
a KubeJS release (26.1 NeoForge, 1.21.1 NeoForge, 1.20.1 Forge, 1.20.1 Fabric). On 26.1 Fabric and 1.21.1 Fabric the
HBM script features are inert. See [KubeJS setup](../../kubejs/setup/).

Use KubeJS to:

- write recipes with shorter syntax, or generate many from a loop
- react to events: nuclear blasts, explosions, missile launches and impacts, finished machine recipes, radiation doses
- read and change radiation, digamma, asbestos and black lung on entities, and radiation in chunks
- add new materials for the foundry, crucible and material shapes
- make new fluids (with KubeJS's own fluid builder) that work in HBM's ducts and tanks

## Addon mods

An addon is a mod that depends on NTM - Continuum and Golem Core. It is built like HBM itself: one source tree, six
jars. See [Addon mods](../../addons/overview/).

Use an addon to:

- add blocks, items, machines, entities, dimensions
- replace an HBM block with your own subclass
- change rules HBM asks about through hooks (can a machine breathe here, is this a vacuum, how strong is gravity)
- add new recipe tables, data maps, fluid traits, hazard types, bullets

The reference addon is **NTM: Space**, a port of hbm-space as an addon. Its code is the best example of every addon
API.

:::note
Addons use HBM's and Golem Core's public APIs and data only. No mixins, access wideners or reflection into HBM. That
is what keeps several addons working side by side. If something you need is private, ask for it to be opened.
:::

## Quick comparison

| | Datapack | KubeJS | Addon mod |
|---|---|---|---|
| Needs extra mods | no | KubeJS (+ Rhino/its deps) | no |
| Targets | all six | 4 of 6 | all six |
| Add/remove machine recipes | yes | yes | yes |
| Change fluid properties and data maps | yes | through datapack files | yes |
| Events | no | observe only | full hooks |
| New items and blocks | no | KubeJS's own builders | yes |
| New materials | no | yes | yes |
| New machines | no | no | yes |
