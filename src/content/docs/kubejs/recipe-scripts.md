---
title: Machine recipes in KubeJS
description: Add, remove and change HBM machine recipes from a KubeJS server script with event.recipes.hbm.
sidebar:
  order: 2
---

Every HBM machine table is a KubeJS recipe type. In a server script's `ServerEvents.recipes` you write
`event.recipes.hbm.<table>(...)`, and `event.remove` / `event.replaceInput` / `event.replaceOutput` work on HBM recipes
like on any other.

A script recipe is the same thing as a datapack recipe file: the arguments become the row's JSON, and the table's own
reader checks it. The JSON forms are the ones in the [Machine recipes](../recipes/overview/) section.

```js title="kubejs/server_scripts/hbm_recipes.js"
ServerEvents.recipes(event => {
  // output, input, stamp
  event.recipes.hbm.press('minecraft:diamond', 'minecraft:coal_block', 'flat').id('kubejs:press_diamond')
  // counted output, tag input
  event.recipes.hbm.shredder('2x minecraft:gravel', '#minecraft:logs').id('kubejs:shredder_logs')
})
```

## How the arguments are ordered

Each table states its fields (its JSON keys). Golem Core builds the script function from them:

1. **Required fields first**, in the order the table states them, then **optional fields**, in stated order.
2. Every field is also a **builder method**: `.duration(40)`, `.power(100)`. A field whose name has an underscore
   answers to both spellings: `.input_items(...)` and `.inputItems(...)`, `.solid_fuel_energy(...)` and
   `.solidFuelEnergy(...)`.
3. **Generic tables** (assembler, chemical plant, PUREX and the others listed [below](#generic-tables)) have one
   required field, `name`, so their first argument is the row's name. Everything else is optional and usually set with
   builder methods.

So you can pass optional fields positionally after the required ones, or leave them out and use builder methods. Builder
methods are easier to read and do not depend on the order.

Leaving out an optional field means the table's default applies (the same as leaving the key out of a datapack file).

### Recipe ids

Give each recipe an id with `.id('namespace:path')`. Without one KubeJS makes one up.

## What a value can be

A typed argument is read the KubeJS way and then written in the form the field needs:

| Field holds | You can pass |
|---|---|
| item input | `'minecraft:iron_ingot'`, `'2x minecraft:iron_ingot'`, `'#c:ingots/steel'` |
| item output | `'minecraft:gold_ingot'`, `'3x minecraft:gold_ingot'` |
| fluid | `Fluid.of('hbm:oxygen', 500)`, or a bare id `'hbm:oxygen'` (one bucket, 1000 mB) |
| number, text, true/false | a JS number, string or boolean |
| raw JSON field | a plain object or array, exactly as in a datapack file |

Fluid amounts are millibuckets. On 1.20.1 Fabric KubeJS counts fluids in droplets; the adapter converts them, see
[Troubleshooting](../troubleshooting/#fluid-amounts-mb-and-droplets).

Many fields take a narrower form than "any ingredient". The signature list below names it per field:

| Form | Accepts | Rejects |
|---|---|---|
| ingredient | one item or one tag, with a count | a list of several items (`Ingredient.of([a, b])`) |
| item or tag | one item or one tag | a count other than 1 |
| item | one item | a tag, a count other than 1 |
| item stack in | one item with a count | a tag |
| tag | one tag | an item, a count other than 1 |
| grid slot | an ingredient, or `''` for an empty slot | |
| stack | one item with a count | a chance, item data |
| item id | one item | a count other than 1, a chance, item data |
| output | one item with a count, an optional chance and its item data | |
| fluid stack | a fluid with an amount | |
| fluid id | a fluid; the amount is ignored | |

### Plain objects pass through

A plain JS object (or a JSON element) given for a field is written **unchanged** as that field's JSON. Use this for
HBM's special forms, which have no KubeJS type:

```js
// HBM's counted ingredient form, a tag with a count
event.recipes.hbm.press('minecraft:emerald', {ingredient: 'minecraft:gold_block', count: 2}, 'flat')
// a material-and-shape input (steel ingots)
event.recipes.hbm.arc_welder('hbm:fuel_tank_large',
    [{material: 'steel', shape: 'ingot', count: 8}, {ingredient: '#c:plates/saturnite', count: 12}], 200, 5000)
// a pressurized fluid
event.recipes.hbm.chemical_plant('kjs.pressurized')
    .inputFluids([{type: 'hbm:steam', amount: 1000, pressure: 1}])
    .outputFluids([Fluid.of('minecraft:water', 1000)])
    .duration(100).power(100)
// an output with a chance
event.recipes.hbm.chemical_plant('kjs.lucky')
    .inputItems(['minecraft:gravel'])
    .outputItems([{id: 'minecraft:diamond', chance: 0.05}])
    .duration(20).power(10)
```

On KubeJS 7 and 8 a typed item output has no chance, so a chance always needs the plain object form.

### Item data on outputs

A generic table's output (and its `icon`) keeps whatever data the script's stack carries: data components from
1.20.5, NBT on 1.20.1. Use it for items whose meaning is in their data, such as a vehicle crate:

```js
// 1.21.1 and 26.1: component syntax
event.recipes.hbm.assembly_machine('kjs.lav150')
    .inputItems(['4x hbm:plate_welded_steel', '4x hbm:motor'])
    .outputItems(['superbwarfare:container[block_entity_data={id:"superbwarfare:container",EntityType:"superbwarfare:lav_150"}]'])
    .duration(1200).power(100)
// 1.20.1: the stack's NBT
event.recipes.hbm.assembly_machine('kjs.lav150')
    .inputItems(['4x hbm:plate_welded_steel', '4x hbm:motor'])
    .outputItems([Item.of('superbwarfare:container', '{BlockEntityTag:{EntityType:"superbwarfare:lav_150"}}')])
    .duration(1200).power(100)
```

The row stores it as the target's own spelling, `components` (1.20.5+) or `nbt` (an SNBT string, 1.20.1), next to
`id` and `count`. A field whose form cannot hold data (a record table's single output) rejects such a stack with
`this output takes no item data: ...` instead of dropping it. Copy a stack's exact component string with `/kubejs hand`.

You can also write a whole recipe as JSON with KubeJS's own `event.custom`:

```js
event.custom({
  type: 'hbm:press',
  stamp: 'flat',
  input: {ingredient: 'minecraft:jungle_log'},
  output: 'hbm:ball_resin'
}).id('kubejs:press_resin')
```

Golem Core also accepts a single plain object as the whole row (`event.recipes.hbm.press({...})`) for tables whose
function has no one-argument form. That excludes the generic tables, whose one-argument form is `(name)`; use
`event.custom` there.

## Removing and replacing

```js
ServerEvents.recipes(event => {
  // by recipe id (HBM's ids are hbm:<table>/<name>)
  event.remove({id: 'hbm:press/ball_resin'})
  // by table and output
  event.remove({type: 'hbm:press', output: 'hbm:biomass_compressed'})
  // by input, in every HBM shredder recipe
  event.remove({type: 'hbm:shredder', input: 'minecraft:cobblestone'})
  // swap an input in every press recipe; the row keeps its count
  event.replaceInput({type: 'hbm:press'}, 'minecraft:jungle_log', 'minecraft:oak_log')
})
```

Fields that hold item or fluid inputs take part in `input:` filters and `replaceInput`; item and fluid outputs in
`output:` filters and `replaceOutput`. A generic table's `icon` takes part in neither.

When a replacement names one item and the original had a count (or a chance), the count and chance stay:
replacing `{ingredient: 'minecraft:jungle_log', count: 4}` with `'minecraft:oak_log'` gives 4 oak logs.

A row written in one of HBM's special forms (a material-and-shape input, a weighted SILEX output, a pressurized fluid, an
output with item data) is not matched by item or fluid filters. It is never rewritten either. Remove such a row by id.

A field that holds a fluid id alone (no amount, for example the refinery's `input`) matches a fluid filter as one bucket.

A removal list in `kubejs/data/<ns>/recipe_removals/` removes rows by id too, and also works without scripts. See
[Removing recipes](../recipes/removing-recipes/).

## Errors

A value the field cannot hold is a script error that names the table and the field, never a silently wrong recipe:

```js
event.recipes.hbm.shredder('minecraft:gravel', '2x minecraft:cobblestone')
// hbm:shredder.input: this input takes no count (got 2)
event.recipes.hbm.cyclotron('hbm:powder_neodymium', 'hbm:powder_cerium', '#minecraft:logs', 25)
// hbm:cyclotron.particle: this input takes an item, not the tag #minecraft:logs
```

Other messages: `empty ingredient: ...`, `empty item: ...`, `empty fluid: ...` (an unknown id), `takes one item or one
tag, not ...` (a multi-item ingredient), `this output takes no chance: ...`, `this output takes no count`,
`this output takes no item data: ...`.

Plain objects are not checked by the script function. A row that is wrong inside (a bad stamp name, an unknown
material, a missing key in a plain object) fails when the table reads it, and the error shows up in the log like a broken
datapack file's.

## Signatures

`table(required...)` shows the positional arguments. The optional fields follow in the order shown and are also builder
methods (with camelCase forms for names with underscores). The value form of each field is in brackets where it is
narrower than the defaults above. `order` (a number) is the row's position in the machine's list; rows without one come
last. `requires` names the 1.7 config switches a row depends on; leave it out for a row that is always on.

### Fluid tables

| Table | Positional arguments | Optional |
|---|---|---|
| `coker` | `output` [stack], `input` [fluid id] | `amount`, `solid_fuel_energy`, `byproduct` [fluid stack], `byproduct_type` [fluid id] |
| `compressor` | `output` [fluid stack], `input` [fluid id], `amount`, `duration` | `pressure` |
| `cracking` | `left` [fluid stack], `input` [fluid id] | `right` [fluid stack] |
| `radiolysis` | `left` [fluid stack], `input` [fluid id] | `right` [fluid stack] |
| `electrolyser_fluid` | `input` [fluid id], `amount` | `output1`, `output2` [fluid stack], `duration`, `byproducts` [list of stack] |
| `pseudo_fluid` | `name`, `outputs` [list of stack], `consumed`, `produced` | `from` [fluid id], `next`, `high_speed` |
| `gas_centrifuge` | `outputs` [list of stack], `input` [fluid stack], `centrifuges` | `high_speed` |
| `hydrotreating` | `outputs` [list of fluid stack], `input` [fluid id], `hydrogen` [fluid stack] | |
| `liquefaction` | `output` [fluid stack], `input` [item or tag] | |
| `pyrolysis` | `duration` | `output_item` [stack], `output_fluid` [fluid stack], `input_item` [ingredient], `input_fluid` [fluid stack], `solid_fuel` [fluid id], `solid_fuel_energy` |
| `refinery` | `outputs` [list of fluid stack], `byproduct` [stack], `input` [fluid id] | |
| `vacuum_distill` | `outputs` [list of fluid stack], `input` [fluid id] | |
| `reforming` | `outputs` [list of fluid stack], `input` [fluid id] | |
| `solidification` | `output` [stack], `input` [fluid id] | `amount`, `solid_fuel_energy` |
| `storage_drum` | `output` [stack], `input` [item stack in], `decay` | `divisor`, `liquid`, `gas` |
| `fraction` | `left` [fluid stack], `right` [fluid stack], `input` [fluid id] | |

### Item-processing tables

| Table | Positional arguments | Optional |
|---|---|---|
| `tool_conversion` | `tool`, `from` (id), `to` (id) | `materials` [list of ingredient] |
| `material_distribution` | `materials` (raw JSON list), `input` [item or tag] | |
| `arc_furnace` | `input` [ingredient] | `solid_output` [stack], `molten_outputs` (raw JSON list), `order` |
| `crucible` | `name`, `outputs` (raw JSON list), `inputs` (raw JSON list) | `frequency`, `icon` [stack], `order` |
| `centrifuge` | `outputs` [list of stack], `input` [ingredient] | `requires`, `order` |
| `crystallizer` | `output` [stack], `input` [ingredient], `acid` [fluid stack], `duration` | `productivity`, `requires` (one id), `order` |
| `cyclotron` | `output` [stack], `input` [ingredient], `particle` [item], `antimatter` | `order` |
| `electrolyser_metal` | `molten` (raw JSON list), `input` [item] | `byproducts` [list of stack], `duration`, `order` |
| `rotary_furnace` | `output` (raw JSON), `duration`, `steam` | `inputs` [list of ingredient], `fluid` [fluid stack], `order` |
| `silex` | `outputs` (raw JSON list), `input` [ingredient], `laser_strength`, `fluid_produced`, `fluid_consumed` | `order` |
| `shredder` | `output` [stack], `input` [item or tag] | |

### Item tables

| Table | Positional arguments | Optional |
|---|---|---|
| `ammo_press` | `output` [stack], `grid` [list of grid slot] | `order` |
| `annihilator` | `milestones` (raw JSON list) | `item` [item], `tag` [tag], `fluid` [fluid id], `requires` |
| `arc_welder` | `output` [stack], `ingredients` [list of ingredient], `duration`, `consumption` | `fluid` [fluid stack], `order` |
| `breeder` | `output` [stack], `input` [item], `flux` | `order` |
| `combination` | `input` [ingredient] | `item_output` [stack], `fluid_output` [fluid stack], `order` |
| `lemegeton` | `output` [item id], `input` [item or tag] | `order` |
| `magic` | `result` [item id], `ingredients` [list of item or tag] | `order` |
| `particle_accelerator` | `output1` [stack], `input1` [ingredient], `input2` [ingredient], `momentum` | `output2` [stack], `order` |
| `pedestal` | `output` [item id], `grid` [list of pedestal slot] | `count`, `extra`, `set`, `order` |
| `press` | `output` [stack], `input` [ingredient], `stamp` | `order` |
| `sawmill` | `output` [stack], `input` [ingredient] | `crafting_result` (raw JSON), `sawdust_chance`, `hidden`, `order` |
| `soldering` | `output` [stack], `duration`, `consumption` | `toppings`, `pcb`, `solder` [list of ingredient], `fluid` [fluid stack], `requires`, `order` |
| `anvil_smithing` | `output` [stack], `left` [ingredient], `right` [ingredient], `tier` | `hot`, `shapeless`, `order` |
| `anvil_construction` | `outputs` [list of output, always objects], `inputs` [list of ingredient], `tier` | `tier_upper`, `overlay`, `requires`, `order` |

The press `stamp` is one of `flat`, `plate`, `wire`, `circuit`, `c357`, `c44`, `c50`, `c9`, `printing1` to `printing8`.
A pedestal slot is like a grid slot, but written `"id"` / `"#tag"`, or `{id, count}` with a count.

### Generic tables

These all share one schema: `table(name)`, then any of these optional fields, in this order:

| Field | Value |
|---|---|
| `output_items` / `outputItems` | list of output (item with count, chance and item data) |
| `input_items` / `inputItems` | list of ingredient |
| `output_fluids` / `outputFluids` | list of fluid stack |
| `input_fluids` / `inputFluids` | list of fluid stack |
| `duration` | ticks (default 0) |
| `power` | HE per tick (default 0) |
| `icon` | stack, always written as an object |
| `custom_localization` / `customLocalization` | true: show the translation of `name` instead of the icon's item name |
| `name_wrapper` / `nameWrapper` | translation key wrapped around the shown name |
| `blueprint_pools` / `blueprintPools` | list of pool names; a pooled recipe needs that blueprint, as in 1.7 |
| `auto_switch_group` / `autoSwitchGroup` | group name |
| `order` | position in the machine's list |
| `input_items_expensive` / `inputItemsExpensive` | list of ingredient used in expensive mode |
| `input_fluids_expensive` / `inputFluidsExpensive` | list of fluid stack used in expensive mode |
| `blueprint_pools_528` / `blueprintPools528` | pools used in 528 mode |
| `requires` | list of config switches |

| Table | Extra optional fields |
|---|---|
| `assembly_machine`, `blast_furnace`, `chemical_plant`, `difurnace`, `exposure_chamber`, `fluid_breeder`, `mixer`, `purex`, `precision_assembler`, `space_assembler`, `rock_mill`, `supercomputer` | none |
| `fusion` | `ignition_temp`, `output_temp`, `neutron_flux`, `red`, `green`, `blue` |
| `outgasser` | `fusion_only` |
| `plasma_forge` | `ignition_temp` |

`name` must be unique in the table. Machines save the selected recipe by it, and the recipe selector shows it. Always
set `duration` and `power`: both default to 0.

```js
event.recipes.hbm.chemical_plant('kjs.my_gas')
  .inputItems(['2x minecraft:iron_ingot'])
  .outputFluids([Fluid.of('hbm:oxygen', 500)])
  .duration(40)
  .power(100)
  .id('kubejs:chem_my_gas')
```

### Tables from addon mods

An addon mod's tables get schemas the same way, under its namespace (`event.recipes.<namespace>.<table>`). A table
that states no fields still works: every JSON key becomes an optional raw-JSON field, so
`event.recipes.<namespace>.<table>({...})` or `event.custom({...})` can write it.
