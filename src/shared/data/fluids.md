---
title: Fluids
description: Fluid ids, the fluid_property file format with every trait, giving another mod's fluid HBM properties, and fluid property patches.
sidebar:
  order: 2
---

## Fluid identity

A fluid is named by its vanilla fluid id everywhere: in recipes, data maps, property files and saves.

- Water, lava and "no fluid" are vanilla's: `minecraft:water`, `minecraft:lava`, `minecraft:empty`.
- HBM's fluids are `hbm:<name>`, for example `hbm:oil`, `hbm:steam`, `hbm:hydrogen`. The full list is in the
  [fluid reference](../../reference/fluids/).
- Any other registered fluid works too: another mod's, an addon's, or one made with KubeJS. HBM creates its entry the
  first time it meets the fluid. Its tanks, ducts and machines then move it like one of HBM's own.

A foreign fluid starts with no traits, white colour (`#FFFFFF`) and room temperature (20 °C). A `fluid_property` file
gives it more.

## The fluid_property file

`data/<ns>/fluid_property/<path>.json` holds the properties of the fluid `<ns>:<path>`. HBM's own files are
`data/hbm/fluid_property/<name>.json`; water's is `data/minecraft/fluid_property/water.json`.

```json title="data/hbm/fluid_property/diesel.json"
{
  "type": "liquid",
  "color": "#F2EED5",
  "temperature": 20,
  "hazard": {
    "poison": 1,
    "flammability": 2,
    "reactivity": 0,
    "symbol": "none"
  },
  "traits": {
    "flammable": { "energy": 550000 },
    "combustible": { "grade": "HIGH", "energy": 1370000 },
    "polluting": {
      "release": { "POISON": 5.0E-5 },
      "burn": { "SOOT": 0.001 }
    }
  }
}
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `type` | string or list of strings | none | The phase: `liquid`, `gaseous` or `plasma`. A list gives several (a fluid can be both gaseous and liquid). |
| `color` | `"#RRGGBB"` string or integer | the fluid's current colour | The fluid's colour (tanks, ducts, icons). |
| `tint` | `"#RRGGBB"` string or integer | `color` | The GUI tint, when it differs from `color`. |
| `temperature` | integer | `20` | Temperature in °C. |
| `hazard` | object | all zero, no symbol | The hazard diamond shown on tanks and barrels. See below. |
| `flags` | list of strings | none | Traits without parameters. See below. |
| `traits` | object | none | Traits with parameters, by name. See below. |

A file replaces all of the fluid's properties at once. Anything the file leaves out gets the default in the table,
not the value from HBM's own file.

### Hazard diamond

```json
"hazard": { "poison": 3, "flammability": 0, "reactivity": 0, "symbol": "oxidizer" }
```

`poison`, `flammability` and `reactivity` are integers (0 to 4 in HBM's data), each defaulting to 0. `symbol` is one
of `none`, `radiation`, `nowater`, `acid`, `asphyxiant`, `cryogenic`, `antimatter`, `oxidizer` (default `none`). The
diamond is only a label: it does not change behaviour.

### Flags

| Flag | Meaning |
|---|---|
| `gaseous_art` | Gaseous at room temperature (cryogenic hydrogen, for example). Counts as gaseous for the gas flare, fluid tank, mist and chemical thrower. |
| `viscous` | Too viscous to be sprayed or turned into a mist. |
| `amat` | Antimatter. A barrel other than the antimatter barrel explodes when filled with it; the fluid tank checks it too. |
| `leadcontainer` | Of the portable tanks, only the lead tank may hold it. |
| `delicious` | A mist of the fluid heals instead of harming. |
| `noid` | No fluid identifier may name it. |
| `nocontainer` | Has no portable container at all. |
| `unsiphonable` | The fluid siphon ignores it. |

### Traits

Every trait is an object under `traits`, keyed by its name. All listed fields are required unless a default is given.

#### corrosive

```json
"corrosive": { "rating": 25 }
```

`rating` (integer, 0 to 100): how badly the fluid eats its container. Above 50 it is "strongly corrosive" and goes
through iron; below that only plastics.

#### flammable

```json
"flammable": { "energy": 550000 }
```

`energy` (long): heat energy one bucket gives when burned (oil burner, gas flare, and solid-fuel rows of some machines).

#### combustible

```json
"combustible": { "grade": "HIGH", "energy": 1370000 }
```

`grade`: the fuel grade, one of `LOW`, `MEDIUM`, `HIGH`, `AERO`, `GAS`. `energy` (long): combustion energy per bucket
in engines and turbines (diesel generator, combustion engine, turbines). Combustion engine pistons rate their
efficiency per grade (see the [piston data map](../../data-maps/machine-parts/#piston)).

#### poison

```json
"poison": { "withering": true, "level": 4 }
```

Contact with a cloud or spray of the fluid poisons (or withers, when `withering` is `true`) the target. `level` is
an integer that 1.7 stores but never reads; the effect is always amplifier 0. 1.7 itself prefers `toxin` for new fluids.

#### toxin

```json title="data/hbm/fluid_property/mustardgas.json (part)"
"toxin": {
  "entries": [
    {
      "kind": "direct_damage",
      "damage": "hbm:cloud",
      "amount": 4.0,
      "delay": 10,
      "hazard": "GAS_BLISTERING",
      "full_body": false
    },
    {
      "kind": "effects",
      "effects": [
        { "id": "minecraft:wither", "duration": 100, "amplifier": 1 },
        { "id": "minecraft:nausea", "duration": 100, "amplifier": 0 }
      ],
      "hazard": "GAS_BLISTERING",
      "full_body": true
    }
  ]
}
```

What breathing or touching the fluid does to a living thing, unless it is protected. Each entry has:

| Field | Type | Meaning |
|---|---|---|
| `kind` | string | `direct_damage` or `effects`. |
| `hazard` | string, optional | The protection class a gas mask filter must have to block it: `GAS_LUNG`, `GAS_MONOXIDE`, `GAS_INERT`, `PARTICLE_COARSE`, `PARTICLE_FINE`, `BACTERIA`, `NERVE_AGENT`, `GAS_BLISTERING`, `SAND`, `LIGHT`, or an addon's class. Without it, no mask is needed. |
| `full_body` | boolean | When `true`, a full hazmat set is needed as well as the mask. |
| `damage` | damage type id | `direct_damage` only: the damage type. |
| `amount` | float | `direct_damage` only: damage per hit, scaled by the cloud's intensity. |
| `delay` | integer | `direct_damage` only: ticks between hits (`0` hits every tick). |
| `effects` | list | `effects` only: `{"id", "duration", "amplifier"}`; `amplifier` defaults to 0, `duration` is in ticks and scaled by the cloud's intensity. |

#### polluting

```json
"polluting": { "release": { "POISON": 5.0E-5 }, "burn": { "SOOT": 0.001 } }
```

Pollution added per mB when the fluid is spilled (`release`) or burned (`burn`). Keys are `SOOT`, `POISON`,
`HEAVYMETAL`, `FALLOUT`; values are floats. Both objects are optional.

#### heatable

```json title="data/minecraft/fluid_property/water.json (part)"
"heatable": {
  "steps": [
    { "amount_req": 1, "heat_req": 200, "produces": "hbm:steam", "amount_produced": 100 },
    { "amount_req": 1, "heat_req": 220, "produces": "hbm:hotsteam", "amount_produced": 10 }
  ],
  "efficiency": { "BOILER": 1.0, "HEATEXCHANGER": 0.25 }
}
```

The fluid can be heated into another. Each step turns `amount_req` mB into `amount_produced` mB of the fluid
`produces`, using `heat_req` heat units. `efficiency` lists which machines may heat it and how well (1.0 is 100%):
`BOILER`, `HEATEXCHANGER`, `PWR`, `ICF`, `PA`. A machine type that is not listed cannot use the fluid.

#### coolable

```json title="data/hbm/fluid_property/steam.json (part)"
"coolable": {
  "cools_to": "hbm:spentsteam",
  "amount_req": 100,
  "amount_produced": 1,
  "heat_energy": 200,
  "efficiency": { "TURBINE": 1.0, "HEATEXCHANGER": 0.5 }
}
```

The reverse of `heatable`: `amount_req` mB become `amount_produced` mB of `cools_to`, releasing `heat_energy`.
`efficiency` keys are `TURBINE` and `HEATEXCHANGER`.

#### pwrmoderator

```json
"pwrmoderator": { "multiplier": 1.25 }
```

A PWR coolant that also moderates the core: while the cold tank holds any, the fuel's flux and heat are multiplied by
`multiplier` (double).

#### pheromone

```json
"pheromone": { "type": 1 }
```

`type` (integer): `1` is glyphid pheromone (buffs glyphids), `2` is the modified pheromone (buffs players).

#### ventradiation

```json
"ventradiation": { "rad_per_mb": 0.2 }
```

`rad_per_mb` (float): chunk radiation one mB carries once it leaves its container (vented, spilled or sprayed).

#### Addon traits and flags

Addons can add their own traits and flags, named `<namespace>:<name>` (NTM: Space adds `ntmspace:rocket`, for
example). Use them in `traits` and `flags` like HBM's. An unknown name makes the whole file fail to load.

## Changing a fluid with a datapack

Folders differ in how copies combine. For `fluid_property`, only the highest-priority pack's file for a fluid is
read. A datapack file at `data/hbm/fluid_property/oil.json` therefore replaces HBM's whole file for `hbm:oil`: copy
HBM's file first and change what you need. The generated files in the NTM - Continuum jar are the starting point.

To change only a part, or to change a fluid from an addon or a modpack that may sit at any pack position, use a patch
instead.

## Giving another mod's fluid HBM properties

Write a property file at the fluid's own id. For a KubeJS fluid `kubejs:radioactive_sludge`:

```json title="data/kubejs/fluid_property/radioactive_sludge.json"
{
  "type": "liquid",
  "color": "#4F6B2A",
  "temperature": 40,
  "hazard": { "poison": 3, "flammability": 0, "reactivity": 1, "symbol": "radiation" },
  "flags": ["viscous"],
  "traits": {
    "corrosive": { "rating": 30 },
    "ventradiation": { "rad_per_mb": 0.5 }
  }
}
```

The file applies on the next `/reload`. A file naming a fluid that does not exist is skipped with the log line
`[HBM] Skipped N fluid property file(s): [... names no fluid]`.

## Patching a fluid you do not own

A patch changes a fluid without replacing its property file:

```
data/<your ns>/fluid_property_patch/<fluid ns>/<fluid path>.json
```

```json title="data/mypack/fluid_property_patch/hbm/nitric_acid.json"
{
  "remove": ["polluting"],
  "add": {
    "flags": ["leadcontainer"],
    "traits": { "corrosive": { "rating": 60 } }
  },
  "temperature": 30
}
```

| Field | Meaning |
|---|---|
| `remove` | Names of traits, flags or phases to take away (`"polluting"`, `"viscous"`, `"gaseous"`). |
| `add` | The `type`, `flags` and `traits` shapes of a property file. A trait the fluid already has is replaced whole. |
| `color`, `tint`, `temperature`, `hazard` | Optional overrides. Left out, the fluid keeps its own. |

How patches apply:

1. After every load, each patched fluid starts again from its `fluid_property` file (or, for a fluid without one,
   from its state before it was first patched).
2. Patches are then applied sorted by the patching namespace, then by path. Inside one patch: removals, then
   additions, then the overrides.
3. When two packs patch the same fluid, the later namespace wins for any trait both add (`mypack_b` after `mypack_a`).
4. A patch that disappears on `/reload` takes its change with it.
5. A patch for a fluid that is not registered (its mod is not installed) is ignored.

The log reports `[HBM] Applied N fluid property patch(es) to M fluid(s)`.

## Other fluid data

Some per-fluid values live in [data maps](../../data-maps/overview/), not in the property file:

- [Fluid containers](../../data-maps/fuels-and-containers/#fluid_containers): which canisters and gas tanks a fluid comes in.
- [Cell hazards](../../data-maps/hazards/#cell_hazards): the hazards of a fluid cell by the fluid in it.
- [Autosaw fuel](../../data-maps/fuels-and-containers/#autosaw_fuel), [gas turbine consumption](../../data-maps/fuels-and-containers/#gas_turbine_fuel_consumption),
  [ICF fuel](../../data-maps/reactor-fuels/#icf_fuel) and [custom nuke](../../data-maps/weapons-and-satellites/#custom_nuke).
- [Fluid deposits](../../data-maps/world/#fluid_deposit): what the oil drills pump out of a deposit block.
