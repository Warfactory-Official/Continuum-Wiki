---
title: Data map list
description: Every data map HBM declares, with its file path, registry, value type and documentation page.
sidebar:
  order: 3
---

Every data map NTM - Continuum declares. Paths are relative to a datapack's `data/` folder. The [data maps
overview](../../data-maps/overview/) explains the file format, merging and patches.

| Map | Path | Registry | Value | Page |
|---|---|---|---|---|
| `hbm:hazards` | `hbm/value_maps/item/hazards.json` | item | hazard spec object | [Hazards](../../data-maps/hazards/#hazards) |
| `hbm:hazard_multiplier` | `hbm/value_maps/item/hazard_multiplier.json` | item | double | [Hazards](../../data-maps/hazards/#hazard_multiplier) |
| `hbm:cell_hazards` | `hbm/value_maps/fluid/cell_hazards.json` | fluid | hazard spec object | [Hazards](../../data-maps/hazards/#cell_hazards) |
| `hbm:radiation_emission` | `hbm/value_maps/block/radiation_emission.json` | block | object (`radiation`, `area`) | [Hazards](../../data-maps/hazards/#radiation_emission) |
| `hbm:radiation_resistance` | `hbm/value_maps/item/radiation_resistance.json` | item | double | [Armor](../../data-maps/armor/#radiation_resistance) |
| `hbm:radiation_cladding` | `hbm/value_maps/item/radiation_cladding.json` | item | double | [Armor](../../data-maps/armor/#radiation_cladding) |
| `hbm:gas_mask_blacklist` | `hbm/value_maps/item/gas_mask_blacklist.json` | item | list of class names | [Armor](../../data-maps/armor/#gas_mask_blacklist) |
| `hbm:ambient_radiation` | `hbm/value_maps/worldgen/biome/ambient_radiation.json` | biome | object (`radiation`, `wet_multiplier`) | [Radiation in the world](../../data-maps/radiation/#ambient_radiation-biomes) |
| `hbm:ambient_radiation` | `hbm/value_maps/dimension/ambient_radiation.json` | dimension | double (RAD/s) | [Radiation in the world](../../data-maps/radiation/#ambient_radiation-dimensions) |
| `hbm:radiation_transformation` | `hbm/value_maps/entity_type/radiation_transformation.json` | entity type | object | [Radiation in the world](../../data-maps/radiation/#radiation_transformation) |
| `hbm:protection_classes` | `hbm/value_maps/item/protection_classes.json` | item | list of class names | [Armor](../../data-maps/armor/#protection_classes) |
| `hbm:faraday_armor` | `hbm/value_maps/item/faraday_armor.json` | item | boolean | [Armor](../../data-maps/armor/#faraday_armor) |
| `hbm:armor_sets` | `hbm/value_maps/item/armor_sets.json` | item | object (set pieces, checks, resistance) | [Armor](../../data-maps/armor/#armor_sets) |
| `hbm:damage_resistance` | `hbm/value_maps/item/damage_resistance.json` | item | resistance stats | [Armor](../../data-maps/armor/#damage_resistance-items) |
| `hbm:damage_resistance` | `hbm/value_maps/entity_type/damage_resistance.json` | entity type | resistance stats | [Armor](../../data-maps/armor/#damage_resistance-entity-types) |
| `hbm:lockpick_jacket` | `hbm/value_maps/item/lockpick_jacket.json` | item | boolean | [Armor](../../data-maps/armor/#lockpick_jacket) |
| `hbm:consumable_treatment` | `hbm/value_maps/item/consumable_treatment.json` | item | object (`triggers`, `block_when_potion_sick`, `actions`) | [Consumable treatments](../../data-maps/treatments/) |
| `hbm:rbmk_fuel` | `hbm/value_maps/item/rbmk_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#rbmk_fuel) |
| `hbm:pwr_fuel` | `hbm/value_maps/item/pwr_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#pwr_fuel) |
| `hbm:zirnox_fuel` | `hbm/value_maps/item/zirnox_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#zirnox_fuel) |
| `hbm:watz_pellet` | `hbm/value_maps/item/watz_pellet.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#watz_pellet) |
| `hbm:pile_rod` | `hbm/value_maps/item/pile_rod.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#pile_rod) |
| `hbm:rtg_pellet` | `hbm/value_maps/item/rtg_pellet.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#rtg_pellet) |
| `hbm:betavoltaic` | `hbm/value_maps/item/betavoltaic.json` | item | long (HE/t) | [Reactor fuels](../../data-maps/reactor-fuels/#betavoltaic) |
| `hbm:plate_fuel` | `hbm/value_maps/item/plate_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#plate_fuel) |
| `hbm:research_reactor_fuel` | `hbm/value_maps/item/research_reactor_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#research_reactor_fuel) |
| `hbm:radgen_fuel` | `hbm/value_maps/item/radgen_fuel.json` | item | object | [Reactor fuels](../../data-maps/reactor-fuels/#radgen_fuel) |
| `hbm:icf_fuel` | `hbm/value_maps/fluid/icf_fuel.json` | fluid | ICF fuel name | [Reactor fuels](../../data-maps/reactor-fuels/#by-fluid) |
| `hbm:icf_fuel` | `hbm/value_maps/material/icf_fuel.json` | material name (no tags) | ICF fuel name | [Reactor fuels](../../data-maps/reactor-fuels/#by-material) |
| `hbm:pa_coil` | `hbm/value_maps/item/pa_coil.json` | item | object | [Machine parts](../../data-maps/machine-parts/#pa_coil) |
| `hbm:drill_bit` | `hbm/value_maps/item/drill_bit.json` | item | object | [Machine parts](../../data-maps/machine-parts/#drill_bit) |
| `hbm:piston` | `hbm/value_maps/item/piston.json` | item | object (grade to double) | [Machine parts](../../data-maps/machine-parts/#piston) |
| `hbm:machine_upgrade` | `hbm/value_maps/item/machine_upgrade.json` | item | object (`type`, `tier`) | [Machine parts](../../data-maps/machine-parts/#machine_upgrade) |
| `hbm:plasma_forge_booster` | `hbm/value_maps/item/plasma_forge_booster.json` | item | integer (ticks) | [Machine parts](../../data-maps/machine-parts/#plasma_forge_booster) |
| `hbm:battery_pack` | `hbm/value_maps/item/battery_pack.json` | item | object | [Machine parts](../../data-maps/machine-parts/#battery_pack) |
| `hbm:fuel_category` | `hbm/value_maps/item/fuel_category.json` | item | string | [Fuels and containers](../../data-maps/fuels-and-containers/#fuel_category) |
| `hbm:difurnace_fuel` | `hbm/value_maps/item/difurnace_fuel.json` | item | integer | [Fuels and containers](../../data-maps/fuels-and-containers/#difurnace_fuel) |
| `hbm:brick_furnace_speed` | `hbm/value_maps/item/brick_furnace_speed.json` | item | integer | [Fuels and containers](../../data-maps/fuels-and-containers/#brick_furnace_speed) |
| `hbm:autosaw_fuel` | `hbm/value_maps/fluid/autosaw_fuel.json` | fluid | boolean | [Fuels and containers](../../data-maps/fuels-and-containers/#autosaw_fuel) |
| `hbm:gas_turbine_fuel_consumption` | `hbm/value_maps/fluid/gas_turbine_fuel_consumption.json` | fluid | double (mB/t) | [Fuels and containers](../../data-maps/fuels-and-containers/#gas_turbine_fuel_consumption) |
| `hbm:fluid_container` | `hbm/value_maps/item/fluid_container.json` | item | object (`fluid`, `amount`, `empty`) | [Fuels and containers](../../data-maps/fuels-and-containers/#fluid_container) |
| `hbm:fluid_containers` | `hbm/value_maps/fluid/fluid_containers.json` | fluid | object (colours) | [Fuels and containers](../../data-maps/fuels-and-containers/#fluid_containers) |
| `hbm:erosion` | `hbm/value_maps/block/erosion.json` | block | block id | [World](../../data-maps/world/#erosion) |
| `hbm:radiation_decay` | `hbm/value_maps/block/radiation_decay.json` | block | object (`to`, `chance`) | [World](../../data-maps/world/#radiation_decay) |
| `hbm:fluid_deposit` | `hbm/value_maps/block/fluid_deposit.json` | block | object | [World](../../data-maps/world/#fluid_deposit) |
| `hbm:fluid_deposit_states` | `hbm/value_maps/block/fluid_deposit_states.json` | block | object (`property`, `values`) | [World](../../data-maps/world/#fluid_deposit_states) |
| `hbm:custom_nuke` | `hbm/value_maps/item/custom_nuke.json` | item | object (`type`, `value`, `op`) | [Weapons and satellites](../../data-maps/weapons-and-satellites/#by-item) |
| `hbm:custom_nuke` | `hbm/value_maps/fluid/custom_nuke.json` | fluid | object (`type`, `value`, `op`) | [Weapons and satellites](../../data-maps/weapons-and-satellites/#by-fluid-cell) |
| `hbm:satellite` | `hbm/value_maps/item/satellite.json` | item | string (satellite type) | [Weapons and satellites](../../data-maps/weapons-and-satellites/#satellite) |

HBM ships a file for every map except `hbm:hazard_multiplier`, `hbm:faraday_armor`, `hbm:radiation_decay`,
`hbm:fluid_deposit_states` and both `hbm:ambient_radiation` maps. Those are empty until a datapack or addon fills them;
the behaviour they change falls back to HBM's code rules and `hbm.cfg`.

A patch of any of these goes in `data/<your ns>/value_maps/patches/hbm/<registry>/<map>.json`.
