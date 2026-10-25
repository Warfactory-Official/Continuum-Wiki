---
title: Fusion, plasma forge, breeders, outgasser
description: The fusion, plasma_forge, fluid_breeder and outgasser tables, all on the generic schema, some with extra fields.
sidebar:
  order: 22
---

Tables for the fusion reactor and the machines it feeds.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:fusion` | Fusion Reactor Vessel | generic + `ignition_temp`, `output_temp`, `neutron_flux`, `red`, `green`, `blue` | selector, saves `name` | 10 |
| `hbm:plasma_forge` | Plasma Forge | generic + `ignition_temp` | selector, saves `name` | 45 |
| `hbm:fluid_breeder` | Fusion Reactor Breeder (fluid mode) | [generic](../common-fields/#generic-schema) | first match in `order` | 3 |
| `hbm:outgasser` | RBMK Irradiation Channel, Fusion Reactor Breeder (item mode) | generic + `fusion_only` | first match in `order` | 19 |

All four use the [generic schema](../common-fields/#generic-schema). Three add fields of their own, which sit in the
same JSON object as the generic fields.

## fusion

Each row is a fuel cycle of the torus. The player picks it in the torus's selector, and the torus saves its `name`.

| Extra field | Type | Default | Meaning |
|---|---|---|---|
| `ignition_temp` | long | `0` | Klystron energy the torus must be fed before the plasma lights. |
| `output_temp` | long | `0` | Plasma energy the cycle puts out at full blast. |
| `neutron_flux` | double | `0` | Neutron output at full blast, taken by breeders. |
| `red`, `green`, `blue` | float, 0 to 1 | `1`, `0.2`, `0.6` | Plasma colour, passed on to the machines that receive it. |

```json title="data/hbm/recipe/fusion/dd.json (HBM)"
{
  "type": "hbm:fusion",
  "name": "fus.dd",
  "input_fluids": [{ "type": "hbm:deuterium", "amount": 20 }],
  "output_fluids": [{ "type": "hbm:helium4", "amount": 1000 }],
  "duration": 100,
  "power": 25000,
  "icon": { "id": "hbm:gas_full", "item_data": { "fluid": "hbm:deuterium", "fluid_amount": 1000 } },
  "custom_localization": true,
  "order": 0,
  "ignition_temp": 750000,
  "output_temp": 1000000,
  "neutron_flux": 50.0,
  "blue": 0.2
}
```

Notes:

- The torus has three fuel tanks; up to three `input_fluids` are used. Its output scales with how full the fuel tanks
  and the energy buffer are.
- The cycles form a progression: each cycle's output pays for a later cycle's ignition. HBM's stellar flux cycle sits
  at the top with 10 MHE ignition.
- The creative klystron outputs the highest `ignition_temp` of any row, so it can light every cycle, yours included.
- HBM writes the breeder flux as a fraction of the breeder's 10,000 buffer.

## plasma_forge

| Extra field | Type | Default | Meaning |
|---|---|---|---|
| `ignition_temp` | long | `0` | Plasma energy (TU/t) the forge must receive to run. |

```json title="data/hbm/recipe/plasma_forge/dfccore.json (HBM)"
{
  "type": "hbm:plasma_forge",
  "name": "plsm.dfccore",
  "input_items": [
    { "material": "osmiridium", "shape": "weldedplate", "count": 16 },
    { "material": "dineutronium", "shape": "densewire", "count": 16 },
    { "ingredient": "hbm:circuit_controller_quantum", "count": 12 },
    { "ingredient": "hbm:singularity_spark" },
    { "ingredient": "hbm:powder_chlorophyte", "count": 64 }
  ],
  "input_fluids": [{ "type": "hbm:stellar_flux", "amount": 12000 }],
  "output_items": ["hbm:dfc_core"],
  "duration": 12000,
  "power": 100000000,
  "order": 40,
  "ignition_temp": 50000000
}
```

The player picks the recipe in the forge's selector, and the forge saves its `name`. The forge sizes its energy
buffer from the selected recipe (`power` × 100). Expensive-mode inputs and 528 pools work
as in the assembly machine (`input_items_expensive`, `blueprint_pools_528`).

## fluid_breeder

The fusion breeder turns one fluid into another with the torus's neutrons. The breeder uses rows with **one** input
fluid and reads the first output fluid; the first row in `order` for the tank's fluid wins.

```json title="data/hbm/recipe/fluid_breeder/gas.json (HBM)"
{
  "type": "hbm:fluid_breeder",
  "name": "fluid_breeder.gas",
  "input_fluids": [{ "type": "hbm:gas", "amount": 1000 }],
  "output_fluids": [{ "type": "hbm:syngas", "amount": 1000 }],
  "order": 0
}
```

## outgasser

Neutron irradiation of items, in the RBMK Irradiation Channel and in the fusion breeder's item mode. The machines use
rows with **one** item input and read the first item output and the first fluid output (both optional). The first
matching row in `order` wins; the input count is checked.

| Extra field | Type | Default | Meaning |
|---|---|---|---|
| `fusion_only` | boolean | `false` | Only the fusion breeder runs this row, not the RBMK channel. HBM's rows do not use it. |

```json title="data/hbm/recipe/outgasser/coal_block.json (HBM)"
{
  "type": "hbm:outgasser",
  "name": "outgasser.coal_block",
  "input_items": [{ "ingredient": "#c:storage_blocks/coal" }],
  "output_items": [{ "id": "hbm:oil_tar_coal", "count": 9 }],
  "output_fluids": [{ "type": "hbm:syngas", "amount": 500 }],
  "duration": 10000,
  "order": 15
}
```

HBM's rows state `"duration": 10000`, 1.7's fixed irradiation time. The RBMK channel uses that fixed time whatever the
row says.
