---
title: Machine parts
description: Particle accelerator coils, drill bits, pistons, machine upgrades, plasma forge boosters and battery packs.
sidebar:
  order: 7
---

Per-item values of the parts machines take. Most of these values only matter on an item of the part's kind: change
HBM's coils, drill bits, pistons and battery packs from a datapack, and add new part items with an addon mod.
`machine_upgrade` and `plasma_forge_booster` work on any item. The [overview](../overview/) explains the file format.

## pa_coil

`data/hbm/value_maps/item/pa_coil.json`. Registry: item. HBM ships 4 entries.

A particle accelerator coil's operating ranges. All fields are required integers.

| Field | Meaning |
|---|---|
| `quadrupole_min`, `quadrupole_max` | The particle momentum range of a quadrupole with this coil. |
| `dipole_min`, `dipole_max` | The particle momentum range of a dipole with this coil. |
| `dipole_min_distance` | The dipole's minimum side length: the distance a particle must travel before it. |

Below a minimum the part draws ten times the power; above a maximum the particle crashes.

```json title="data/hbm/value_maps/item/pa_coil.json (part)"
{
  "values": {
    "hbm:pa_coil_gold": {
      "quadrupole_min": 0,
      "quadrupole_max": 2200,
      "dipole_min": 0,
      "dipole_max": 2200,
      "dipole_min_distance": 15
    }
  }
}
```

## drill_bit

`data/hbm/value_maps/item/drill_bit.json`. Registry: item. HBM ships 10 entries.

An excavator drill bit.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `speed` | double | required | Speed multiplier. |
| `tier` | integer | required | The ore tier it can mine. |
| `fortune` | integer | `0` | Fortune level. |
| `vein_miner` | boolean | `false` | Mines whole ore veins. |
| `silk_touch` | boolean | `false` | Mines with silk touch. |

```json title="data/hbm/value_maps/item/drill_bit.json (part)"
{
  "values": {
    "hbm:drillbit_steel": { "speed": 1.0, "tier": 1 },
    "hbm:drillbit_steel_diamond": { "speed": 1.0, "tier": 1, "fortune": 2, "silk_touch": true },
    "hbm:drillbit_hss": { "speed": 1.2, "tier": 2, "vein_miner": true }
  }
}
```

## piston

`data/hbm/value_maps/item/piston.json`. Registry: item. HBM ships 4 entries.

A combustion engine piston set's efficiency for each fuel grade. Value: an object from grade name to a double. Grades
are `LOW`, `MEDIUM`, `HIGH`, `AERO` and `GAS` (the `grade` of a fluid's
[combustible](../../data/fluids/#combustible) trait). A grade the value leaves out burns at 0.

```json title="data/hbm/value_maps/item/piston.json (part)"
{
  "values": {
    "hbm:piston_set_steel": { "LOW": 1.0, "MEDIUM": 0.75, "HIGH": 0.25, "AERO": 0.0, "GAS": 0.0 },
    "hbm:piston_set_dura": { "LOW": 0.5, "MEDIUM": 1.0, "HIGH": 0.9, "AERO": 0.5, "GAS": 0.0 }
  }
}
```

## machine_upgrade

`data/hbm/value_maps/item/machine_upgrade.json`. Registry: item. HBM ships 34 entries.

Which upgrade an item is and its level. HBM reads an item's upgrade type and tier from this map first, and from the
upgrade item itself otherwise. Any item with an entry counts as that upgrade in a machine's upgrade slots, so a
datapack can turn another item into an upgrade.

| Field | Type | Meaning |
|---|---|---|
| `type` | string | `SPEED`, `EFFECT`, `POWER`, `FORTUNE`, `AFTERBURN`, `OVERDRIVE` or `SPECIAL`, in capitals. |
| `tier` | integer | How many levels it adds. |

```json title="data/hbm/value_maps/item/machine_upgrade.json (part)"
{
  "values": {
    "hbm:upgrade_speed_1": { "type": "SPEED", "tier": 1 },
    "hbm:upgrade_speed_2": { "type": "SPEED", "tier": 2 },
    "hbm:upgrade_ejector_1": { "type": "SPECIAL", "tier": 1 }
  }
}
```

## plasma_forge_booster

`data/hbm/value_maps/item/plasma_forge_booster.json`. Registry: item. HBM ships 20 entries, all tags.

Value: an integer. How many ticks one item runs the plasma forge at four times speed. Any item with an entry fits the
forge's booster slot.

```json title="data/hbm/value_maps/item/plasma_forge_booster.json (part)"
{
  "values": {
    "#c:nuggets/co60": 20,
    "#c:billets/co60": 120,
    "#c:ingots/co60": 200
  }
}
```

## battery_pack

`data/hbm/value_maps/item/battery_pack.json`. Registry: item. HBM ships 12 entries.

A battery or capacitor pack for the battery socket.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `capacity` | long | required | Capacity in HE. |
| `charge_rate` | long | required | Charge rate in HE per tick. |
| `discharge_rate` | long | required | Discharge rate in HE per tick. |
| `capacitor` | boolean | `false` | The socket draws it as a capacitor. |
| `texture` | string | required | The texture the socket model uses for it. |

```json title="data/hbm/value_maps/item/battery_pack.json (part)"
{
  "values": {
    "hbm:battery_redstone": {
      "capacity": 1800000,
      "charge_rate": 1000,
      "discharge_rate": 100,
      "texture": "hbm:textures/models/machines/battery_redstone.png"
    }
  }
}
```
