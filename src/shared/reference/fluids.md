---
title: Fluid list
description: Every fluid HBM ships with its id, display name, temperature, phase and traits.
sidebar:
  order: 2
---

Every fluid NTM - Continuum ships, from its generated `fluid_property` files: 154 of HBM's own plus water, lava and
"none", which are vanilla's fluids with HBM's properties. Use the id in recipes, data maps and property files.

The traits column is a summary: `heatable` and `coolable` show the first fluid they turn into, `corrosive` its rating,
`combustible` its fuel grade. The [Fluids](../../data/fluids/) page explains every trait, and the full values are in
the NTM - Continuum jar under `data/hbm/fluid_property/`.

| Id | Name | Temp (°C) | Phase | Traits and flags |
|---|---|---|---|---|
| `minecraft:empty` | None | 20 |  |  |
| `minecraft:lava` | Lava | 1200 | liquid | viscous |
| `minecraft:water` | Water | 20 | liquid | unsiphonable, heatable to `hbm:steam` |
| `hbm:air` | Compressed Air | 20 | gaseous | heatable to `hbm:airblast` |
| `hbm:airblast` | Hot Air Blast | 1200 | gaseous |  |
| `hbm:alumina` | Alumina | 20 | liquid |  |
| `hbm:amat` | Antimatter | 20 | gaseous | amat |
| `hbm:aromatics` | Aromatic Hydrocarbons | 20 | liquid | viscous, flammable, polluting |
| `hbm:aschrab` | Antischrabidium | 20 | gaseous | amat |
| `hbm:balefire` | BF Rocket Fuel | 1500 | liquid | viscous, corrosive 50, flammable, combustible HIGH, polluting |
| `hbm:bauxite_solution` | Bauxite Solution | 20 | liquid | viscous, corrosive 40 |
| `hbm:biofuel` | Biofuel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:biogas` | Biogas | 20 | gaseous | flammable, combustible GAS, polluting |
| `hbm:bitumen` | Bitumen | 20 | liquid | viscous, polluting |
| `hbm:blood` | Blood | 20 | liquid | viscous, delicious, heatable to `hbm:blood_hot` |
| `hbm:blood_hot` | Hot Blood | 666 | liquid | viscous, coolable to `hbm:blood` |
| `hbm:calcium_chloride` | Calciumchloride Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:calcium_solution` | Calcium Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:carbondioxide` | Carbon Dioxide | 20 | gaseous | polluting |
| `hbm:chlorine` | Chlorine Gas | 20 | gaseous | corrosive 25, toxin |
| `hbm:chlorocalcite_cleaned` | Cleaned Chlorocalcite Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:chlorocalcite_mix` | Mixed Chlorocalcite Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:chlorocalcite_solution` | Chlorocalcite Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:cholesterol` | Cholesterol Solution | 20 | liquid |  |
| `hbm:coalcreosote` | Coal Tar Creosote | 20 | liquid | viscous, flammable, polluting |
| `hbm:coalgas` | Coal Gasoline | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:coalgas_leaded` | Leaded Coal Gasoline | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:coaloil` | Coal Oil | 20 | liquid | viscous, flammable, polluting |
| `hbm:colloid` | Colloid | 20 | liquid | viscous |
| `hbm:concrete` | Liquid Concrete | 20 | liquid |  |
| `hbm:coolant` | Coolant | 20 | liquid | heatable to `hbm:coolant_hot` |
| `hbm:coolant_hot` | Hot Coolant | 600 | liquid | coolable to `hbm:coolant` |
| `hbm:crackoil` | Cracked Oil | 20 | liquid | viscous, flammable, heatable to `hbm:hotcrackoil`, polluting |
| `hbm:crackoil_ds` | Desulfurized Cracked Oil | 20 | liquid | viscous, flammable, heatable to `hbm:hotcrackoil_ds`, polluting |
| `hbm:cryogel` | Cryogel | -170 | liquid | viscous |
| `hbm:death` | Osmiridic Solution | 300 | liquid | viscous, leadcontainer, corrosive 80, poison |
| `hbm:deuterium` | Deuterium | 20 | gaseous | flammable, combustible HIGH |
| `hbm:dhc` | Deuterated Hydrocarbon | 20 | gaseous |  |
| `hbm:diesel` | Diesel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:diesel_crack` | Cracked Diesel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:diesel_crack_reform` | High-Cetane Cracked Diesel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:diesel_reform` | High-Cetane Diesel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:egg` | Dissolved Egg | 20 | liquid |  |
| `hbm:enderjuice` | Ender Juice | 20 | liquid |  |
| `hbm:estradiol` | Estradiol Solution | 20 | liquid | toxin |
| `hbm:ethanol` | Ethanol | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:fishoil` | Fish Oil | 20 | liquid | flammable, polluting |
| `hbm:flue` | Flue Gas | 20 | gaseous | flammable, polluting |
| `hbm:fracksol` | Fracking Solution | 20 | liquid | viscous, corrosive 15, poison |
| `hbm:fullerene` | Fullerene Solution | 20 | liquid | corrosive 65, polluting |
| `hbm:gas` | Natural Gas | 20 | gaseous | flammable, combustible GAS, polluting |
| `hbm:gas_coker` | Coker Gas | 20 | gaseous | flammable, combustible GAS, polluting |
| `hbm:gasoline` | Gasoline | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:gasoline_leaded` | Leaded Gasoline | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:heatingoil` | Heating Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:heatingoil_vacuum` | Heavy Heating Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:heavyoil` | Heavy Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:heavyoil_vacuum` | Vacuum Heavy Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:heavywater` | Heavy Water | 20 | liquid | pwrmoderator 1.25, heatable to `hbm:heavywater_hot` |
| `hbm:heavywater_hot` | Hot Heavy Water | 600 | liquid | viscous, coolable to `hbm:heavywater` |
| `hbm:helium3` | Helium-3 | 20 | gaseous |  |
| `hbm:helium4` | Helium-4 | 20 | gaseous |  |
| `hbm:hotcrackoil` | Hot Cracked Oil | 350 | liquid | viscous, coolable to `hbm:crackoil`, polluting |
| `hbm:hotcrackoil_ds` | Desulfurized Hot Cracked Oil | 350 | liquid | viscous, coolable to `hbm:crackoil_ds`, polluting |
| `hbm:hotoil` | Hot Crude Oil | 350 | liquid | viscous, coolable to `hbm:oil`, polluting |
| `hbm:hotoil_ds` | Desulfurized Hot Crude Oil | 350 | liquid | viscous, coolable to `hbm:oil_ds`, polluting |
| `hbm:hotsteam` | Dense Steam | 300 | gaseous | unsiphonable, coolable to `hbm:steam` |
| `hbm:hydrogen` | Liquid Hydrogen | -260 | liquid | gaseous_art, flammable, combustible HIGH |
| `hbm:iongel` | Ionic Gel | 20 | liquid | viscous |
| `hbm:kerosene` | Kerosene | 20 | liquid | flammable, combustible AERO, polluting |
| `hbm:kerosene_reform` | Jet Fuel | 20 | liquid | flammable, combustible AERO, polluting |
| `hbm:lead` | Liquid Lead | 350 | liquid | viscous, pwrmoderator 0.75, heatable to `hbm:lead_hot` |
| `hbm:lead_hot` | Hot Liquid Lead | 1500 | liquid | viscous, coolable to `hbm:lead` |
| `hbm:lightoil` | Light Oil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:lightoil_crack` | Cracked Light Oil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:lightoil_ds` | Desulfurized Light Oil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:lightoil_vacuum` | Vacuum Light Oil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:lpg` | LPG | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:lubricant` | Engine Lubricant | 20 | liquid | polluting |
| `hbm:lye` | Lye | 20 | liquid | corrosive 40 |
| `hbm:mercury` | Mercury | 20 | liquid | poison |
| `hbm:mug` | Mug Root Beer | 20 | liquid | delicious, pwrmoderator 1.15, heatable to `hbm:mug_hot` |
| `hbm:mug_hot` | Hot Mug Root Beer | 500 | liquid | delicious, coolable to `hbm:mug` |
| `hbm:mustardgas` | Mustard Gas | 20 | gaseous | toxin, polluting |
| `hbm:naphtha` | Naphtha | 20 | liquid | viscous, flammable, combustible MEDIUM, polluting |
| `hbm:naphtha_coker` | Coker Naphtha | 20 | liquid | viscous, flammable, combustible MEDIUM, polluting |
| `hbm:naphtha_crack` | Cracked Naphtha | 20 | liquid | viscous, flammable, combustible MEDIUM, polluting |
| `hbm:naphtha_ds` | Desulfurized Naphtha | 20 | liquid | viscous, flammable, combustible MEDIUM, polluting |
| `hbm:nitan` | NITAN© 100 Octane Super Fuel | 20 | liquid | flammable, combustible HIGH, polluting |
| `hbm:nitric_acid` | Nitric Acid | 20 | liquid | corrosive 60, polluting |
| `hbm:nitroglycerin` | Nitroglycerin | 20 | liquid |  |
| `hbm:oil` | Crude Oil | 20 | liquid | viscous, flammable, heatable to `hbm:hotoil`, polluting |
| `hbm:oil_coker` | Coker Oil | 20 | liquid | viscous, flammable, polluting |
| `hbm:oil_ds` | Desulfurized Crude Oil | 20 | liquid | viscous, flammable, heatable to `hbm:hotoil_ds`, polluting |
| `hbm:oxygen` | Liquid Oxygen | -100 | liquid | gaseous_art |
| `hbm:oxyhydrogen` | Oxyhydrogen | 20 | gaseous | flammable, combustible GAS |
| `hbm:pain` | Pandemonium(III)tantalite Solution | 300 | liquid | viscous, corrosive 30, poison |
| `hbm:perfluoromethyl` | Perfluoromethyl | 15 | liquid | heatable to `hbm:perfluoromethyl_hot` |
| `hbm:perfluoromethyl_cold` | Cold Perfluoromethyl | -150 | liquid | heatable to `hbm:perfluoromethyl` |
| `hbm:perfluoromethyl_hot` | Hot Perfluoromethyl | 250 | liquid | coolable to `hbm:perfluoromethyl` |
| `hbm:peroxide` | Hydrogen Peroxide | 20 | liquid | corrosive 40 |
| `hbm:petroil` | Petroil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:petroil_leaded` | Leaded Petroil | 20 | liquid | flammable, combustible MEDIUM, polluting |
| `hbm:petroleum` | Petroleum Gas | 20 | gaseous | flammable, combustible GAS, polluting |
| `hbm:pheromone` | Booster Pheromone | 20 | liquid | pheromone 1 |
| `hbm:pheromone_m` | Modified Booster Pheromone | 20 | liquid | pheromone 2 |
| `hbm:phosgene` | Phosgene | 20 | gaseous | toxin, polluting |
| `hbm:plasma_bf` | Balefire Plasma | 8500 | plasma | noid, nocontainer |
| `hbm:plasma_dh3` | Deuterium-Helium-3 Plasma | 3480 | plasma | noid, nocontainer |
| `hbm:plasma_dt` | Deuterium-Tritium Plasma | 3250 | plasma | noid, nocontainer |
| `hbm:plasma_hd` | Hydrogen-Deuterium Plasma | 2500 | plasma | noid, nocontainer |
| `hbm:plasma_ht` | Hydrogen-Tritium Plasma | 3000 | plasma | noid, nocontainer |
| `hbm:plasma_xm` | Helium-4-Oxygen Plasma | 4250 | plasma | noid, nocontainer |
| `hbm:potassium_chloride` | Potassiumchloride Solution | 20 | liquid | nocontainer, corrosive 60 |
| `hbm:puf6` | Plutonium Hexafluoride | 20 | gaseous | corrosive 15, ventradiation 0.1 |
| `hbm:radiosolvent` | High-Performance Solvent | 20 | liquid | corrosive 50, flammable |
| `hbm:reclaimed` | Reclaimed Industrial Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:redmud` | Red Mud | 20 | liquid | viscous, leadcontainer, corrosive 60, flammable, toxin, polluting |
| `hbm:reformate` | Reformate | 20 | liquid | viscous, flammable, combustible HIGH, polluting |
| `hbm:reformgas` | Reformate Gas | 20 | gaseous | flammable, combustible GAS, polluting |
| `hbm:salient` | Salient Green | 20 | liquid | viscous, delicious |
| `hbm:sas3` | Schrabidium Trisulfide | 20 | liquid | corrosive 30, ventradiation 1.0 |
| `hbm:schrabidic` | Schrabidic Acid | 20 | liquid | corrosive 75, poison, ventradiation 1.0 |
| `hbm:seedslurry` | Seeding Slurry | 20 | liquid | viscous |
| `hbm:slop` | Ore Slop | 20 | liquid | viscous |
| `hbm:smear` | Industrial Oil | 20 | liquid | viscous, flammable, combustible LOW, polluting |
| `hbm:smoke` | Smoke | 20 | gaseous | noid, nocontainer |
| `hbm:smoke_leaded` | Leaded Smoke | 20 | gaseous | noid, nocontainer |
| `hbm:smoke_poison` | Poison Smoke | 20 | gaseous | noid, nocontainer |
| `hbm:sodium` | Liquid Sodium | 400 | liquid | viscous, heatable to `hbm:sodium_hot` |
| `hbm:sodium_aluminate` | Sodium Aluminate | 20 | liquid | corrosive 30 |
| `hbm:sodium_hot` | Hot Liquid Sodium | 1200 | liquid | viscous, coolable to `hbm:sodium` |
| `hbm:solvent` | Solvent | 20 | liquid | corrosive 30, flammable |
| `hbm:sourgas` | Sour Gas | 20 | gaseous | corrosive 10, flammable, poison, polluting |
| `hbm:spentsteam` | Low-Pressure Steam | 20 | gaseous | nocontainer |
| `hbm:steam` | Steam | 100 | gaseous | unsiphonable, coolable to `hbm:spentsteam` |
| `hbm:stellar_flux` | Stellar Flux | 20 | gaseous | amat |
| `hbm:sulfuric_acid` | Sulfuric Acid | 20 | liquid | corrosive 50 |
| `hbm:sunfloweroil` | Sunflower Seed Oil | 20 | liquid | flammable, polluting |
| `hbm:superhotsteam` | Super Dense Steam | 450 | gaseous | unsiphonable, coolable to `hbm:hotsteam` |
| `hbm:syngas` | Syngas | 20 | gaseous | flammable, combustible GAS |
| `hbm:thorium_salt` | Liquid Thorium Salt | 800 | liquid | viscous, corrosive 65, pwrmoderator 2.5, heatable to `hbm:thorium_salt_hot` |
| `hbm:thorium_salt_depleted` | Depleted Liquid Thorium Salt | 800 | liquid | viscous, corrosive 65 |
| `hbm:thorium_salt_hot` | Hot Liquid Thorium Salt | 1600 | liquid | viscous, corrosive 65, coolable to `hbm:thorium_salt_depleted` |
| `hbm:titanium_tetrachloride` | Titanium Tetratchloride | 20 | liquid |  |
| `hbm:tritium` | Tritium | 20 | gaseous | flammable, combustible HIGH, ventradiation 0.001 |
| `hbm:uf6` | Uranium Hexafluoride | 20 | gaseous | corrosive 15, ventradiation 0.2 |
| `hbm:ultrahotsteam` | Ultra Dense Steam | 600 | gaseous | unsiphonable, coolable to `hbm:superhotsteam` |
| `hbm:unsaturateds` | Unsaturated Hydrocarbons | 20 | gaseous | flammable, polluting |
| `hbm:vitriol` | Vitriol | 20 | liquid | viscous |
| `hbm:wastefluid` | Liquid Nuclear Waste | 20 | liquid | viscous, nocontainer, ventradiation 0.5 |
| `hbm:wastegas` | Gaseous Nuclear Waste | 20 | gaseous | nocontainer, ventradiation 0.5 |
| `hbm:watz` | Poisonous Mud | 20 | liquid | viscous, corrosive 60, ventradiation 0.1, polluting |
| `hbm:woodoil` | Wood Oil | 20 | liquid | viscous, flammable, polluting |
| `hbm:xenon` | Xenon Gas | 20 | gaseous |  |
| `hbm:xpjuice` | Experience Juice | 20 | liquid | viscous |
| `hbm:xylene` | BTX | 20 | liquid | viscous, flammable, combustible HIGH, polluting |
