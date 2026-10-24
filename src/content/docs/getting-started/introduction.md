---
title: Introduction
description: What NTM - Continuum is, which versions it runs on, and how this wiki is organised.
sidebar:
  order: 1
---

**NTM - Continuum** is a port of HBM's Nuclear Tech Mod (NTM) 1.7.10 to modern Minecraft. Its mod id is `hbm`, the
same as the original, so item, block and fluid ids look like `hbm:ingot_uranium` and `hbm:oil`.

The behaviour target is 1.7: recipes, formulas, machine values and hazards follow the 1.7.10 code. Where this wiki
says "1.7", it means that original behaviour.

:::tip[Start from a template]
The [template generator](../template-generator/) downloads a ready-to-edit datapack or addon mod project, set up with
your names and the Minecraft versions and loaders you pick.
:::

## Supported targets

One source tree is built into six jars:

| Minecraft | Loaders | Java |
|---|---|---|
| 26.1 | NeoForge, Fabric | 25 |
| 1.21.1 | NeoForge, Fabric | 21 |
| 1.20.1 | Forge, Fabric | 17 |

Every jar needs **Golem Core** (mod id `golemcore`), the compatibility library the port is built on. Golem Core is
also what reads most of the data formats in this wiki, and what makes KubeJS support work, so you will see its name in
JSON keys such as `golem:requires`.

The data formats on this site are the same on all six targets unless a page says otherwise. The exceptions are
vanilla's own: 1.20.1 names some data folders differently (`recipes` instead of `recipe`), and vanilla crafting
recipes use an older ingredient shape before 26.1. [Key concepts](../concepts/#one-tree-six-targets) lists them.

## How this wiki is organised

The wiki has one section for each way of changing the mod. Switch sections with the buttons at the top of the
sidebar.

| Section | For | Starts at |
|---|---|---|
| Datapacks | Pack makers and server owners who change recipes, fluids and values with JSON files. No other mod needed. | [What a datapack can change](../../datapacks/overview/) |
| KubeJS | Pack makers who script recipes, react to events or read radiation, on the targets KubeJS supports. | [KubeJS setup](../../kubejs/setup/) |
| Addon mods | Java developers who build a mod on top of NTM - Continuum and Golem Core. | [Addon mods](../../addons/overview/) |

Every section also contains the same reference pages: machine recipes, data maps, fluids, tags and the other data
files, and the lists of tables, maps and fluids. They are written once and read the same in each section; the KubeJS
and addon copies add a note on where the files go.

## What you can change, and how

| You want to | Use | Section |
|---|---|---|
| Add, change or remove machine recipes | Datapack or KubeJS | [Machine recipes](../../datapacks/recipes/overview/), [KubeJS recipes](../../kubejs/recipe-scripts/) |
| Change a fluid's temperature, traits or hazard | Datapack | [Fluids](../../datapacks/data/fluids/) |
| Change hazard levels, reactor fuels, armour protection and other per-item values | Datapack | [Data maps](../../datapacks/data-maps/overview/) |
| React to nukes, missiles, explosions and radiation | KubeJS or addon mod | [KubeJS events](../../kubejs/events/), [Hooks](../../addons/hooks/) |
| Read or set a player's radiation, or a chunk's | KubeJS or addon mod | [The HBM global](../../kubejs/hbm-global/) |
| Add a new material for the foundry and crucible | KubeJS or addon mod | [Startup registry](../../kubejs/startup-registry/), [Registries](../../addons/registries/) |
| Add new blocks, machines, fluids, dimensions | Addon mod | [Addon mods](../../addons/overview/) |

Not sure which one fits? Read [Choosing an approach](../choosing-an-approach/). Then read [Key concepts](../concepts/)
for the ids, units and rules every section relies on.

## Sources

- NTM - Continuum: [github.com/Warfactory-Official/NTM-Continuum](https://github.com/Warfactory-Official/NTM-Continuum)
- Golem Core: [github.com/Warfactory-Official/Golem-Core](https://github.com/Warfactory-Official/Golem-Core)

When this wiki and the code disagree, the code is right. Please open an issue or edit the page (link at the bottom of
every page).
