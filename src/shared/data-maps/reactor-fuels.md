---
title: Reactor fuels
description: Fuel values for the RBMK, PWR, ZIRNOX, Watz, Chicago Pile, RTG, betavoltaic cells, research reactor, radiation generator and ICF.
sidebar:
  order: 6
---

Each reactor reads its fuel values from a data map keyed by the fresh fuel item. A value only takes effect on an item
of the reactor's own fuel class: changing the numbers of HBM's fuels works from a datapack, while a new fuel item needs
an addon mod that registers it. The [overview](../overview/) explains the file format.

Item ids inside values (`pellet`, `hot`, `depleted`, ...) are plain id strings, resolved when the reactor needs them.
Colours are `"#RRGGBB"` strings.

## Reaction curves

PWR and Watz values use a curve object:

```json
{ "type": "sqrt", "level": 25.0, "div": 1.0, "off": 0.0 }
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `type` | string | required | `linear`, `sqrt`, `quadratic`, `log` or `passive`. |
| `level` | double | `0` | The curve's strength. |
| `v_off` | double | `0` | `quadratic` only: vertical offset. |
| `div` | double | `1` | Divides the input. |
| `off` | double | `0` | Offsets the input. |

## rbmk_fuel

`data/hbm/value_maps/item/rbmk_fuel.json`. Registry: item. HBM ships 33 entries.

An RBMK fuel rod, from 1.7's `ItemRBMKRod` setters.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `yield` | double | required | Total flux the rod can take in over its lifetime. |
| `reactivity` | double | required | The end point of the burn function. |
| `self_rate` | double | `0` | Flux the rod gives itself (self-igniting fuels). |
| `function` | string | `LOG_TEN` | Flux-to-reactivity curve: `PASSIVE`, `LOG_TEN`, `PLATEU`, `ARCH`, `SIGMOID`, `SQUARE_ROOT`, `LINEAR`, `QUADRATIC`, `EXPERIMENTAL`, or an addon mod's. |
| `depletion` | string | `GENTLE_SLOPE` | How reactivity changes with depletion: `LINEAR`, `RAISING_SLOPE`, `BOOSTED_SLOPE`, `GENTLE_SLOPE`, `STATIC`, or an addon mod's. |
| `xenon_gen` | double | `0.5` | Multiplier for xenon production. |
| `xenon_burn` | double | `50` | Divider for xenon burn-up. |
| `heat` | double | `1` | Heat produced per unit of outgoing flux. |
| `diffusion` | double | `0.02` | How fast the core heats the hull. |
| `melting_point` | double | `1000` | The highest hull temperature before the rod melts. |
| `heat_coeff_start` | double | `0` | Heat at which the heat coefficient starts acting. |
| `heat_coeff_length` | double | `0` | How far above that the coefficient brings the reaction to 0. |
| `neutron_in` | string | `SLOW` | The neutron type the rod fissions best with: `SLOW`, `FAST`, `ANY`. |
| `neutron_out` | string | `FAST` | The neutron type the rod releases. |
| `tint` | colour | `#304825` | The rod's colour in the fuel channel. |
| `pellet` | item id | none | The pellet the rod is recycled into. |

```json title="data/hbm/value_maps/item/rbmk_fuel.json (part)"
{
  "values": {
    "hbm:rbmk_fuel_ueu": {
      "yield": 100000000.0,
      "reactivity": 15.0,
      "depletion": "RAISING_SLOPE",
      "heat": 0.65,
      "melting_point": 2865.0,
      "tint": "#868D82",
      "pellet": "hbm:rbmk_pellet_ueu"
    }
  }
}
```

## pwr_fuel

`data/hbm/value_maps/item/pwr_fuel.json`. Registry: item. HBM ships 15 entries.

A PWR fuel rod, keyed by the fresh rod.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `heat` | double | required | Heat per unit of flux. |
| `function` | curve | required | The reaction curve. |
| `yield` | double | `1000000000` | Flux one rod yields before it is spent. |
| `hot` | item id | required | The hot depleted rod it becomes. |
| `depleted` | item id | required | The cooled depleted rod. |

```json title="data/hbm/value_maps/item/pwr_fuel.json (part)"
{
  "values": {
    "hbm:pwr_fuel_meu": {
      "heat": 5.0,
      "function": { "type": "log", "level": 600.0, "div": 2500.0, "off": 1.0 },
      "hot": "hbm:pwr_fuel_hot_meu",
      "depleted": "hbm:pwr_fuel_depleted_meu"
    }
  }
}
```

## zirnox_fuel

`data/hbm/value_maps/item/zirnox_fuel.json`. Registry: item. HBM ships 11 entries.

A ZIRNOX rod, keyed by the active rod.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `max_life` | integer | required | Life in operations. |
| `heat` | integer | required | Heat per operation. |
| `breeding` | boolean | `false` | A breeding rod only breeds: it adds no operations to its neighbours. |
| `base_radiation` | float | required | Radiation of the fresh rod. |
| `depleted_radiation` | float | required | Radiation of the spent rod. |
| `depletes_into` | item id | required | The item the rod becomes when used up. |
| `waste` | item id | none | The waste one used-up rod reprocesses into. |

```json title="data/hbm/value_maps/item/zirnox_fuel.json (part)"
{
  "values": {
    "hbm:rod_zirnox_uranium_fuel": {
      "max_life": 200000,
      "heat": 50,
      "base_radiation": 0.5,
      "depleted_radiation": 150.0,
      "depletes_into": "hbm:rod_zirnox_depleted_uranium_fuel",
      "waste": "hbm:waste_uranium"
    },
    "hbm:rod_zirnox_th232_fuel": {
      "max_life": 20000,
      "heat": 0,
      "breeding": true,
      "base_radiation": 0.1,
      "depleted_radiation": 1.75,
      "depletes_into": "hbm:rod_zirnox_thorium_fuel"
    }
  }
}
```

## watz_pellet

`data/hbm/value_maps/item/watz_pellet.json`. Registry: item. HBM ships 12 entries.

A Watz pellet, keyed by the fresh pellet.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `color` | colour | required | Bar colour. |
| `color_dark` | colour | required | The depleted pellet's darker colour. |
| `passive` | double | `0` | Passive flux. |
| `heat` | double | `0` | Heat per unit of flux. |
| `mud` | double | required | Mud per unit of flux. |
| `burn` | curve | none | The reaction curve. |
| `heat_div` | curve | none | The heat divisor curve. |
| `absorb` | curve | none | The absorber curve. |
| `yield` | double | `500000000` | Flux before the pellet is depleted. |
| `depleted` | item id | required | The depleted pellet. |

```json title="data/hbm/value_maps/item/watz_pellet.json (part)"
{
  "values": {
    "hbm:watz_pellet_schrabidium": {
      "color": "#32FFFF",
      "color_dark": "#005C5C",
      "passive": 2000.0,
      "heat": 20.0,
      "mud": 0.005,
      "burn": { "type": "linear", "level": 1.5 },
      "heat_div": { "type": "sqrt", "level": 0.1, "off": 100.0 },
      "depleted": "hbm:watz_pellet_depleted_schrabidium"
    }
  }
}
```

## pile_rod

`data/hbm/value_maps/item/pile_rod.json`. Registry: item. HBM ships 9 entries.

A Chicago Pile rod. Every field is optional.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `reaction` | double | `0` | Fission multiplier. |
| `life` | double | `0` | Lifetime in absorbed neutrons. |
| `heat` | double | `0` | Heat per neutron. |
| `source` | double | `0` | Constant neutron source. |
| `turns_into` | item id | none | The item a spent rod becomes. Source rods have none. |

```json title="data/hbm/value_maps/item/pile_rod.json (part)"
{
  "values": {
    "hbm:pile_rod_mk2_ra226be": { "source": 1.0 },
    "hbm:pile_rod_mk2_nu": { "reaction": 1.0, "life": 25000.0, "heat": 0.25, "turns_into": "hbm:pile_rod_mk2_pu239" }
  }
}
```

## rtg_pellet

`data/hbm/value_maps/item/rtg_pellet.json`. Registry: item. HBM ships 11 entries.

An RTG pellet. Output and radiation fall linearly with the life left, as in 1.7.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `heat` | integer | required | Heat output. |
| `heat_decaying` | integer | none | Heat when RTG decay is on in `hbm.cfg` (`9.01_doRTGsDecay`). Absent: `heat`. |
| `lifespan` | long | required | The pellet's whole life in ticks. |
| `decays_to` | item id | required | The depleted pellet it becomes. |

```json title="data/hbm/value_maps/item/rtg_pellet.json (part)"
{
  "values": {
    "hbm:pellet_rtg_gold": {
      "heat": 100,
      "heat_decaying": 200,
      "lifespan": 194400,
      "decays_to": "hbm:pellet_rtg_depleted_mercury"
    }
  }
}
```

## betavoltaic

`data/hbm/value_maps/item/betavoltaic.json`. Registry: item. HBM ships 10 entries.

Value: a long. A betavoltaic cell's constant output in HE per tick.

```json title="data/hbm/value_maps/item/betavoltaic.json (part)"
{
  "values": {
    "hbm:battery_sc_waste": 150,
    "hbm:battery_sc_ra226": 200,
    "hbm:battery_sc_tc99": 500
  }
}
```

## plate_fuel

`data/hbm/value_maps/item/plate_fuel.json`. Registry: item. HBM ships 7 entries.

A research reactor fuel plate.

| Field | Type | Meaning |
|---|---|---|
| `life_time` | integer | Lifetime in reaction events. |
| `function` | string | The reaction curve: `LOGARITHM`, `SQUARE_ROOT`, `NEGATIVE_QUADRATIC`, `LINEAR`, `PASSIVE`. |
| `reactivity` | integer | Reactivity. |

All three are required.

```json title="data/hbm/value_maps/item/plate_fuel.json (part)"
{
  "values": {
    "hbm:plate_fuel_u233": { "life_time": 2200000, "function": "SQUARE_ROOT", "reactivity": 50 }
  }
}
```

## research_reactor_fuel

`data/hbm/value_maps/item/research_reactor_fuel.json`. Registry: item. HBM ships 7 entries.

What a spent research reactor plate becomes.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `output` | item id | required | The waste plate. |
| `hot` | boolean | `false` | Whether it comes out hot. |

```json title="data/hbm/value_maps/item/research_reactor_fuel.json (part)"
{
  "values": {
    "hbm:plate_fuel_u233": { "output": "hbm:waste_plate_u233", "hot": true }
  }
}
```

## radgen_fuel

`data/hbm/value_maps/item/radgen_fuel.json`. Registry: item. HBM ships 2 entries.

A fuel for the radiation-powered generator.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `production` | integer | required | HE per tick. |
| `duration` | integer | required | Ticks it lasts. |
| `output` | item id | none | What is left over. Absent: nothing. |
| `count` | integer | `1` | How many of `output`. |

The nuclear waste drums are handled by a rule in the machine (each waste becomes its depleted counterpart), not by this map.

```json title="data/hbm/value_maps/item/radgen_fuel.json"
{
  "values": {
    "hbm:scrap_nuclear": { "production": 50, "duration": 6000 },
    "hbm:gem_rad": { "production": 25000, "duration": 36000, "output": "minecraft:diamond" }
  }
}
```

## icf_fuel

Two maps give the ICF pellet press its fuels. The value is an ICF fuel name: `hydrogen`, `deuterium`, `tritium`,
`helium3`, `helium4`, `lithium`, `beryllium`, `boron`, `carbon`, `oxygen`, `sodium`, `chlorine`, `calcium`, or an
addon mod's.

### By fluid

`data/hbm/value_maps/fluid/icf_fuel.json`. Registry: fluid. HBM ships 7 entries. The fuel a fluid presses into (1,000 mB per pellet half).

```json title="data/hbm/value_maps/fluid/icf_fuel.json (part)"
{
  "values": {
    "hbm:deuterium": "deuterium",
    "hbm:tritium": "tritium",
    "hbm:helium3": "helium3"
  }
}
```

### By material

`data/hbm/value_maps/material/icf_fuel.json`. HBM ships 6 entries. Keyed by HBM material name, not by a registry entry, so tags do not
apply. An item made of exactly one ingot of the material presses into the fuel.

```json title="data/hbm/value_maps/material/icf_fuel.json"
{
  "values": {
    "beryllium": "beryllium",
    "boron": "boron",
    "calcium": "calcium",
    "graphite": "carbon",
    "lithium": "lithium",
    "sodium": "sodium"
  }
}
```
