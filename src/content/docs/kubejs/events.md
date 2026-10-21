---
title: HBMEvents
description: The HBMEvents script events, when each fires, and every field of its event object.
sidebar:
  order: 4
---

`HBMEvents` is a KubeJS event group. Its server events tell scripts that something happened in HBM. They are
**observe-only**: a handler reads the event and cannot cancel or change what HBM does. There is one startup event,
[`HBMEvents.registry`](#hbmeventsregistry-startup), for adding materials.

```js title="kubejs/server_scripts/hbm_events.js"
HBMEvents.explosion(event => {
  console.info(`boom ${event.kind} ${event.size} at ${event.x} ${event.y} ${event.z}`)
})
```

## How the event object works

- Each field is a property: `event.level`, `event.radius`. The values are read once, when the event is posted.
- The object is read-only. Assigning a property throws `Script events are read-only (<name>)`. KubeJS's `cancel()` is
  not offered.
- Game objects are the real ones: `event.level` is the level, `event.missile` the missile entity, `event.pos` a block
  position. Use them as you would in any KubeJS event (`event.level.server`, `event.entity.level`).
- Fields marked "or null" can be missing; check before use.
- A handler that throws is reported by KubeJS. HBM carries on.

All server events fire on the logical server, on the server thread, in the middle of HBM's own work. Keep handlers
short, and do not change blocks at the event's own position from inside the handler (the explosion is still being
processed, the machine is mid-tick).

### Cost

HBM only forwards an event to KubeJS when at least one script listens to it. With no handler for an event, it costs one
check per occurrence. With a handler, every occurrence builds an event object and calls your script, so mind the
frequent ones: [`entityIrradiated`](#entityirradiated) can fire every tick for every entity standing in radiation, and
[`machineRecipeCompleted`](#machinerecipecompleted) once per finished operation of every recipe machine.

## Server events

### nuclearBlast

A nuclear blast started.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | The server level |
| `x` | number | Blast centre X |
| `z` | number | Blast centre Z |
| `radius` | number | Blast radius in blocks |

Fires once for each large nuclear explosion, on its first server tick, and once for each mini nuke when it goes off.
There is no `y`. This is the same moment addon mods see as `Environment.NUCLEAR_BLAST`.

### explosion

An HBM explosion finished: its blocks and entities have been processed.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | |
| `x`, `y`, `z` | number | Centre |
| `size` | number | Explosion size (strength) |
| `exploder` | entity or null | The entity the blast is attributed to |
| `kind` | string | `vnt` or `large` |

`vnt` is HBM's composable explosion, used by most HBM blasts. `large` is a vanilla explosion plus HBM's smoke, rubble
and shrapnel. For nuclear blasts use `nuclearBlast`. Vanilla explosions (TNT, creepers) are not reported.

### bombDetonated

A detonator triggered an HBM bomb block.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | |
| `pos` | block position | The bomb block |
| `block` | string | The bomb block's registry id, read before it went off |
| `detonator` | entity or null | The entity that triggered it, if online |
| `result` | string | `DETONATED`, `TRIGGERED`, `LAUNCHED`, `ERROR_MISSING_COMPONENT`, `ERROR_INCOMPATIBLE`, `ERROR_NO_BOMB` or `UNDEFINED` |
| `success` | boolean | `true` for `DETONATED`, `TRIGGERED` and `LAUNCHED` |

Fires for the detonator, the laser detonator, the multi detonator, the dead man's detonator, and a detonation that was
waiting for its chunk to load. It fires for failed attempts too: check `success`. Bombs set off by redstone are not
reported (1.7 had no shared moment for them either).

### missileLaunched

A launcher put a missile into the world.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | |
| `launcher` | block position | The launcher block entity's position |
| `missile` | entity | The missile just added |
| `missileType` | string | The missile's entity type id |
| `targetX`, `targetZ` | integer | Target column |
| `launchedBy` | entity or null | Who gets credit (the player whose detonator fired the pad), if known |

Fires for launch pads, the rusted launch pad and the custom-missile launchers (compact launcher, launch table). For an
anti-ballistic missile the target is the position of the entity it chases.

### missileImpact

A ballistic missile hit a block. Fires just before its warhead goes off.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | |
| `missile` | entity | The missile |
| `missileType` | string | The missile's entity type id |
| `x`, `y`, `z` | number | The missile's position |
| `hitPos` | block position | The block it hit |
| `targetX`, `targetZ` | integer | The column it was aimed at |
| `thrower` | living entity or null | Who launched it, if known |

Covers every ballistic missile tier, the custom missile, the stealth missile and the shuttle.

### machineRecipeCompleted

A recipe machine finished one operation.

| Field | Type | Meaning |
|---|---|---|
| `level` | level | |
| `pos` | block position | The machine |
| `machine` | string | The block entity type id, `hbm:machine_chemical_plant` |
| `table` | string | The recipe table id, `hbm:chemical_plant` |
| `recipe` | string | The recipe's `name` in that table |

Fires for the machines that run generic-table recipes: assembly machine and factory, chemical plant and factory,
precision assembler, PUREX, plasma forge, fusion torus, rock mill and supercomputer. `recipe` is the generic row's
`name` (for example `chem.aggregate`), not its recipe id.

### entityIrradiated

A radiation dose got through to a living entity.

| Field | Type | Meaning |
|---|---|---|
| `entity` | living entity | Who received it |
| `hazard` | string | `RADIATION` or `NEUTRON` |
| `contamination` | string | The protection type the source used (`CREATIVE`, `HAZMAT`, `NONE`, ...) |
| `amount` | number | The dose the source asked for, in RAD |
| `dose` | number | The dose actually added, after the entity's radiation resistance (`amount` for `RAD_BYPASS`) |

Fires from HBM's contamination path (`HBM.contaminate` included) only when every protection check passed and the dose
is above 0. It does not fire for `HBM.addRadiation` / `setRadiation`, for digamma or monoxide, or when the
`RADIATION_00_enableContamination` config is off. An entity standing in radiation gets a dose every tick, so this event
is frequent: keep the handler cheap.

```js
HBMEvents.entityIrradiated(event => {
  if (event.dose > 5) console.info(`heavy ${event.hazard} dose: ${event.dose.toFixed(1)} RAD`)
})
```

## HBMEvents.registry (startup)

The startup event, for startup scripts. HBM posts it once, right after KubeJS has loaded the startup scripts. Its event
object is a registry with one method, `material(name)`, that adds a crucible material:

```js title="kubejs/startup_scripts/hbm_materials.js"
HBMEvents.registry(event => {
  event.material('zinc').displayName('Zinc').colors(0xA8B3B5, 0x4E5A5C, 0xC6CFD0).smelting('SMELTABLE')
})
```

The full builder is on the [Startup registry](../startup-registry/) page. A material can only be added while this event
runs; calling `material` later throws.

## Your own events in an addon mod

An addon mod can offer events of its own through Golem Core's `dev.golem.core.script.Scripts` (no KubeJS dependency),
and HBM's `HbmEvents` hooks are the same moments as these script events. See the
[Addon mods](../../addons/overview/) section.
