---
title: Recipe tables
description: Every HBM machine recipe type, the machine that uses it, its page and the number of rows HBM ships.
sidebar:
  label: Recipe tables
---

Every machine recipe table is a vanilla recipe type, `hbm:<table>`, with rows in `data/<namespace>/recipe/<table>/`
(`recipes/` on 1.20.1). "Generic" tables share the [generic schema](../../recipes/common-fields/#generic-schema);
"own" tables have a record of their own, described on their page. How tables load, sort and are replaced:
[machine recipes](../../recipes/overview/).

The row counts are the files HBM generates for each table, including rows that only load under a config switch
(`requires`). They change between releases of the mod.

| Type | Machine | Schema | Page | HBM rows |
|---|---|---|---|---|
| `hbm:ammo_press` | Ammo Press | own | [welding-and-ammo](../../recipes/welding-and-ammo/#ammo_press) | 90 |
| `hbm:annihilator` | Annihilator | own | [accelerator-and-computers](../../recipes/accelerator-and-computers/#annihilator) | 16 |
| `hbm:anvil_construction` | Anvils (construction list) | own | [anvil](../../recipes/anvil/#anvil_construction) | 258 |
| `hbm:anvil_smithing` | Anvils (smithing slots) | own | [anvil](../../recipes/anvil/#anvil_smithing) | 29 |
| `hbm:arc_furnace` | Electric Arc Furnace | own | [furnaces](../../recipes/furnaces/#arc_furnace) | 79 |
| `hbm:arc_welder` | Arc Welder | own | [welding-and-ammo](../../recipes/welding-and-ammo/#arc_welder) | 42 |
| `hbm:assembly_machine` | Assembly Machine, Assembly Factory | generic | [assembly-machine](../../recipes/assembly-machine/#assembly_machine) | 355 |
| `hbm:blast_furnace` | Blast Furnace | generic | [furnaces](../../recipes/furnaces/#blast_furnace) | 18 |
| `hbm:breeder` | Breeding Reactor (LEGACY) | own | [nuclear](../../recipes/nuclear/#breeder) | 31 |
| `hbm:centrifuge` | Centrifuge | own | [press-and-grinding](../../recipes/press-and-grinding/#centrifuge) | 180 |
| `hbm:chemical_plant` | Chemical Plant, Chemical Factory | generic | [chemical-plant](../../recipes/chemical-plant/#chemical_plant) | 90 |
| `hbm:coker` | Coker Unit | own | [refinery-oil](../../recipes/refinery-oil/#coker) | 33 |
| `hbm:combination` | Combination Furnace | own | [furnaces](../../recipes/furnaces/#combination) | 53 |
| `hbm:compressor` | Compressor, Compact Compressor | own | [fluid-machines](../../recipes/fluid-machines/#compressor) | 5 |
| `hbm:cracking` | Catalytic Cracking Tower | own | [refinery-oil](../../recipes/refinery-oil/#cracking) | 12 |
| `hbm:crucible` | Crucible | own | [crucible](../../recipes/crucible/#crucible) | 13 |
| `hbm:crystallizer` | Ore Acidizer | own | [press-and-grinding](../../recipes/press-and-grinding/#crystallizer) | 347 |
| `hbm:cyclotron` | Cyclotron | own | [nuclear](../../recipes/nuclear/#cyclotron) | 42 |
| `hbm:difurnace` | Blast Furnace (LEGACY) | generic | [furnaces](../../recipes/furnaces/#difurnace) | 14 |
| `hbm:electrolyser_fluid` | Electrolyser (fluid) | own | [fluid-machines](../../recipes/fluid-machines/#electrolyser_fluid) | 8 |
| `hbm:electrolyser_metal` | Electrolyser (metal) | own | [fluid-machines](../../recipes/fluid-machines/#electrolyser_metal) | 36 |
| `hbm:exposure_chamber` | Exposure Chamber | generic | [nuclear](../../recipes/nuclear/#exposure_chamber) | 4 |
| `hbm:fluid_breeder` | Fusion Reactor Breeder (fluid) | generic | [fusion](../../recipes/fusion/#fluid_breeder) | 3 |
| `hbm:fraction` | Fractioning Tower | own | [refinery-oil](../../recipes/refinery-oil/#fraction) | 19 |
| `hbm:fusion` | Fusion Reactor Vessel | generic | [fusion](../../recipes/fusion/#fusion) | 10 |
| `hbm:gas_centrifuge` | Gas Centrifuge (recipe viewers) | own | [gas-centrifuge](../../recipes/gas-centrifuge/#gas_centrifuge) | 4 |
| `hbm:hydrotreating` | Hydrotreater | own | [refinery-oil](../../recipes/refinery-oil/#hydrotreating) | 6 |
| `hbm:lemegeton` | Lemegeton | own | [rituals-and-tools](../../recipes/rituals-and-tools/#lemegeton) | 37 |
| `hbm:liquefaction` | Industrial Liquefaction Machine | own | [fluid-machines](../../recipes/fluid-machines/#liquefaction) | 34 |
| `hbm:magic` | The Book of Boxcars | own | [rituals-and-tools](../../recipes/rituals-and-tools/#magic) | 7 |
| `hbm:material_distribution` | Crucible, foundry, arc furnace (melting values) | own | [crucible](../../recipes/crucible/#material_distribution) | 54 |
| `hbm:mixer` | Mixer | generic | [chemical-plant](../../recipes/chemical-plant/#mixer) | 50 |
| `hbm:outgasser` | RBMK Irradiation Channel, Fusion Reactor Breeder (item) | generic | [fusion](../../recipes/fusion/#outgasser) | 19 |
| `hbm:particle_accelerator` | Particle accelerator | own | [accelerator-and-computers](../../recipes/accelerator-and-computers/#particle_accelerator) | 11 |
| `hbm:pedestal` | Pedestal | own | [rituals-and-tools](../../recipes/rituals-and-tools/#pedestal) | 17 |
| `hbm:plasma_forge` | Plasma Forge | generic | [fusion](../../recipes/fusion/#plasma_forge) | 45 |
| `hbm:precision_assembler` | Precision Assembly Machine | generic | [assembly-machine](../../recipes/assembly-machine/#precision_assembler) | 60 |
| `hbm:press` | Burner Press, Electric Press, Conveyor Press | own | [press-and-grinding](../../recipes/press-and-grinding/#press) | 48 |
| `hbm:pseudo_fluid` | Gas Centrifuge (cascade) | own | [gas-centrifuge](../../recipes/gas-centrifuge/#pseudo_fluid) | 7 |
| `hbm:purex` | PUREX | generic | [nuclear](../../recipes/nuclear/#purex) | 59 |
| `hbm:pyrolysis` | Pyrolysis Oven | own | [refinery-oil](../../recipes/refinery-oil/#pyrolysis) | 41 |
| `hbm:radiolysis` | Radiolysis Chamber | own | [refinery-oil](../../recipes/refinery-oil/#radiolysis) | 1 |
| `hbm:refinery` | Oil Refinery | own | [refinery-oil](../../recipes/refinery-oil/#refinery) | 4 |
| `hbm:reforming` | Catalytic Reformer | own | [refinery-oil](../../recipes/refinery-oil/#reforming) | 9 |
| `hbm:rock_mill` | Rock Mill | generic | [press-and-grinding](../../recipes/press-and-grinding/#rock_mill) | 11 |
| `hbm:rotary_furnace` | Rotary Furnace | own | [furnaces](../../recipes/furnaces/#rotary_furnace) | 13 |
| `hbm:sawmill` | Sawmill | own | [press-and-grinding](../../recipes/press-and-grinding/#sawmill) | 5 |
| `hbm:shredder` | Shredder | own | [press-and-grinding](../../recipes/press-and-grinding/#shredder) | 333 |
| `hbm:silex` | SILEX | own | [silex](../../recipes/silex/) | 301 |
| `hbm:soldering` | Soldering Station | own | [welding-and-ammo](../../recipes/welding-and-ammo/#soldering) | 43 |
| `hbm:solidification` | Industrial Solidification Machine | own | [fluid-machines](../../recipes/fluid-machines/#solidification) | 47 |
| `hbm:space_assembler` | Space Laboratory (0G assemblers) | generic | [accelerator-and-computers](../../recipes/accelerator-and-computers/#space_assembler) | 1 |
| `hbm:storage_drum` | Nuclear Waste Disposal Drum | own | [nuclear](../../recipes/nuclear/#storage_drum) | 32 |
| `hbm:supercomputer` | Supercomputer | generic | [accelerator-and-computers](../../recipes/accelerator-and-computers/#supercomputer) | 18 |
| `hbm:tool_conversion` | Blowtorch, Pneumatic Rivet Gun | own | [rituals-and-tools](../../recipes/rituals-and-tools/#tool_conversion) | 4 |
| `hbm:vacuum_distill` | Vacuum Refinery | own | [refinery-oil](../../recipes/refinery-oil/#vacuum_distill) | 2 |

Not in this list: crafting, smelting and other vanilla recipe types, which HBM also ships as ordinary recipes, and the
special crafting recipes HBM registers in code. All of them can be removed with a
[removal list](../../recipes/removing-recipes/).
