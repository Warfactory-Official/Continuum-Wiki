---
title: Addon mods
description: "What an addon mod for NTM - Continuum is, the rules it follows, and when a datapack or a KubeJS script is the better tool."
sidebar:
  order: 1
  label: Overview
---

An addon mod is a mod that adds to or changes NTM - Continuum (mod id `hbm`). The reference addon is
**NTM: Space** (mod id `ntmspace`, source in [NTM-Continuum-Space](https://github.com/Warfactory-Official/NTM-Continuum-Space)). A second, dev-only addon, `ntmprobe`
(`NTM-Continuum-Space/src/probe`), exists to prove that two addons work side by side. Every API in this section is used by one
of them, and the examples are shortened from their code.

## The rule

An addon uses HBM's and Golem Core's APIs and data. It never uses:

- mixins into HBM,
- access wideners or access transformers on HBM,
- reflection into HBM.

This keeps several addons working together, and it is what makes HBM reachable from datapacks and KubeJS too. Any public
HBM class may be used. If a member you need is private, that is a bug in HBM: ask for it to be opened.

## Six targets, one source tree

HBM is written once, against the 26.1 Minecraft API, and builds for six targets:

| Node | Minecraft | Loader | Java |
|---|---|---|---|
| `26.1-neoforge` | 26.1.2 | NeoForge | 25 |
| `26.1-fabric` | 26.1.2 | Fabric | 25 |
| `1.21.1-neoforge` | 1.21.1 | NeoForge | 21 |
| `1.21.1-fabric` | 1.21.1 | Fabric | 21 |
| `1.20.1-forge` | 1.20.1 | Forge | 17 |
| `1.20.1-fabric` | 1.20.1 | Fabric | 17 |

An addon is built the same way: one tree, written against 26.1, compiled for each node with
[Stonecutter](https://stonecutter.kikugie.dev/). An addon jar runs only on the HBM node it was built against.

## Golem Core

Golem Core (mod id `golemcore`, Java package `dev.golem.core`) is the compatibility layer under HBM. It gives the 26.1 API
shape on every node, so HBM and its addons call one API and never branch on the Minecraft version. It provides:

- registration (`DeferredRegister`, `Registrar`, `Substitutions`) and mod start-up (`ModEntry`),
- networking, GUI, rendering and data facades,
- datapack recipe tables (`RecipeTables`), data maps (`DataMaps`) and build-time data generation,
- hooks (`Hook`, `Verdict`) for vanilla behaviour,
- dimension, sky and weather helpers,
- the neutral scripting surface (`Scripts`) that its KubeJS adapter turns into KubeJS bindings,
- exposure of your blocks to other mods: fluid and item capabilities, AE2, Jade and CC: Tweaked
  ([Fluids and networks](../fluids-and-networks/#other-mods)),
- GameTests that run on every loader.

Golem Core's shared build scripts, copied into your project's `gradle/golem/`, convert one resource tree for every node. See
[Project setup](../project-setup/).

## When an addon mod is not needed

Much of HBM is data. Before you write an addon, check whether a datapack or a script does the job:

| You want to | Use |
|---|---|
| Add, change or remove machine recipes | a datapack ([machine recipes](../recipes/overview/)) or KubeJS |
| Change values such as hazards, fuels or reactor data | a datapack data map |
| Change a fluid's temperature, traits or hazard | a datapack `fluid_property` file or patch |
| React to explosions, missile launches or recipes finishing | KubeJS `HBMEvents` ([KubeJS setup](../../kubejs/setup/)) |
| Add a material | KubeJS startup `HBMEvents.registry` |
| Add blocks, items, machines, block entities, dimensions, new trait types or new recipe tables | an addon mod |
| Replace how an existing HBM block or item behaves | an addon mod ([substitution](../substitution/)) |

## Pages in this section

1. [Project setup](../project-setup/): the files a project needs: Gradle, Stonecutter, metadata.
2. [Your first addon mod](../first-addon/): a block, a crafting recipe, a machine recipe and a hook, end to end.
3. [Mod entry](../mod-entry/): the three start-up phases and client set-up.
4. [Registering content](../registering-content/): the registration chain, Dejson, client registrations and payloads.
5. [Substitution](../substitution/): replacing an HBM block or item under its own id.
6. [Recipes and data](../recipes-and-data/): recipe tables and generated data.
7. [Fluids and networks](../fluids-and-networks/): fluids, traits, connecting to ducts and cables, and other mods' pipes, storage and overlays.
8. [Hooks](../hooks/): `Hook`, `Environment`, `HbmEvents` and Golem Core's hooks.
9. [Registries](../registries/): materials, bullets, hazards, record registries and other extension points.
10. [Data maps in Java](../java-data-maps/): declaring and reading data maps.
11. [Dimensions](../dimensions/): dimensions, generators, skies and weather.
12. [Scripting surface](../scripting-surface/): offering your own KubeJS bindings and events.
13. [Testing](../testing/): GameTests and builds.

The shared sections below these pages (machine recipes, data maps, fluids and other data, reference) describe the JSON
formats, which are the same for a datapack and for the files an addon mod ships.
