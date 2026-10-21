---
title: Examples
description: Complete KubeJS scripts for NTM - Continuum, from recipes to radiation zones and custom materials.
sidebar:
  order: 6
---

Complete scripts. Each one names the folder it goes in. They work on every target that has KubeJS (26.1 NeoForge,
1.21.1 NeoForge, 1.20.1 Forge, 1.20.1 Fabric).

:::note
On 1.20.1 Fabric, KubeJS counts fluid amounts in droplets (81 per mB), so `Fluid.of('hbm:oxygen', 500)` there means
500 droplets. To write millibuckets on every target, use HBM's plain object form, `{type: 'hbm:oxygen', amount: 500}`.
See [Troubleshooting](../troubleshooting/#fluid-amounts-mb-and-droplets).
:::

## Add press recipes

```js title="kubejs/server_scripts/press.js"
ServerEvents.recipes(event => {
  // output, input, stamp
  event.recipes.hbm.press('minecraft:diamond', 'minecraft:coal_block', 'flat').id('kubejs:press/diamond')
  // two gold blocks in, one emerald out (HBM's counted ingredient form)
  event.recipes.hbm.press('minecraft:emerald', {ingredient: 'minecraft:gold_block', count: 2}, 'flat')
    .id('kubejs:press/emerald')
  // counted output, tag input
  event.recipes.hbm.press('3x minecraft:paper', '#minecraft:planks', 'flat').id('kubejs:press/paper')
})
```

## Chemical plant recipe with fluids

Generic tables take the row's `name` first, the rest through builder methods.

```js title="kubejs/server_scripts/chemical_plant.js"
ServerEvents.recipes(event => {
  event.recipes.hbm.chemical_plant('kjs.oxygen_from_iron')
    .inputItems(['2x minecraft:iron_ingot'])
    .inputFluids([{type: 'minecraft:water', amount: 1000}])
    .outputFluids([{type: 'hbm:oxygen', amount: 500}])
    .outputItems(['minecraft:raw_iron'])
    .duration(40)   // ticks
    .power(100)     // HE per tick
    .id('kubejs:chem/oxygen_from_iron')
})
```

To show a translated name in the recipe selector instead of the icon item's name, add `.customLocalization(true)`
and a lang entry for the `name` (`"kjs.oxygen_from_iron": "Oxygen from Iron"`).

## Remove and replace

```js title="kubejs/server_scripts/remove.js"
ServerEvents.recipes(event => {
  // one recipe, by id
  event.remove({id: 'hbm:press/ball_resin'})
  // every press recipe that makes compressed biomass
  event.remove({type: 'hbm:press', output: 'hbm:biomass_compressed'})
  // every HBM shredder recipe that takes cobblestone
  event.remove({type: 'hbm:shredder', input: 'minecraft:cobblestone'})
  // press recipes take oak logs instead of jungle logs (counts are kept)
  event.replaceInput({type: 'hbm:press'}, 'minecraft:jungle_log', 'minecraft:oak_log')
})
```

## A radiation zone

Players inside a square area take a radiation dose every tick, unless their hazmat suit protects them. The dose goes
through HBM's normal path, so armour, radiation resistance and immunity apply, and the Geiger counter sees it.

```js title="kubejs/server_scripts/exclusion_zone.js"
const ZONE = {minX: -64, maxX: 64, minZ: -64, maxZ: 64}

function inZone(player) {
  return player.x >= ZONE.minX && player.x <= ZONE.maxX && player.z >= ZONE.minZ && player.z <= ZONE.maxZ
}

PlayerEvents.loggedIn(event => {
  if (inZone(event.player)) event.player.tell('You are inside the exclusion zone.')
})

PlayerEvents.tick(event => {
  // 0.05 RAD per tick is 1 RAD per second before resistance
  if (inZone(event.player)) HBM.contaminate(event.player, 'RADIATION', 'HAZMAT', 0.05)
})
```

HBM protects players for the first 200 ticks (10 seconds) after they join or respawn, so the dose starts after that.
Use `HBM.addRadiation(player, rad)` instead if you want to skip every protection.

## Log every nuke

```js title="kubejs/server_scripts/nuke_log.js"
HBMEvents.nuclearBlast(event => {
  const x = Math.round(event.x)
  const z = Math.round(event.z)
  console.info(`Nuclear blast, radius ${event.radius}, at ${x} ${z}`)
  event.level.server.runCommandSilent(`say Nuclear detonation at ${x}, ${z}`)
})

HBMEvents.missileLaunched(event => {
  console.info(`${event.missileType} launched from ${event.launcher} towards ${event.targetX} ${event.targetZ}`)
})
```

## Irradiate on an event

Leave fallout where any missile lands, and dose whoever sets off a bomb with a detonator.

```js title="kubejs/server_scripts/fallout.js"
HBMEvents.missileImpact(event => {
  // adds to the radiation already there, but not above 1000 RAD
  HBM.addChunkRadiationCapped(event.level, event.hitPos, 300, 1000)
})

HBMEvents.bombDetonated(event => {
  if (event.success && event.detonator) {
    HBM.contaminate(event.detonator, 'RADIATION', 'HAZMAT', 20)
  }
})
```

## Count machine operations

```js title="kubejs/server_scripts/chem_counter.js"
let made = 0

HBMEvents.machineRecipeCompleted(event => {
  if (event.table == 'hbm:chemical_plant' && event.recipe == 'kjs.oxygen_from_iron') {
    made++
    if (made % 100 == 0) console.info(`${made} oxygen batches made so far`)
  }
})
```

The counter resets on `/reload`. Keep the handler short: it runs for every finished operation of every recipe machine.

## Read fluid and material data

```js title="kubejs/server_scripts/hbm_info.js"
ServerEvents.recipes(event => {
  const ids = HBM.fluids()   // a read-only Java list
  let hot = 0
  for (let i = 0; i < ids.size(); i++) {
    if (HBM.fluid(ids.get(i)).hot) hot++
  }
  console.info(`HBM fluids at 100 °C or more: ${hot} of ${ids.size()}`)

  const oil = HBM.fluid('hbm:oil')
  console.info(`${oil.displayName}: ${oil.temperature} °C, traits ${oil.traits}`)

  const steel = HBM.material('steel')
  console.info(`steel melts as ${steel.smelting}, ingot tag ${steel.tags.INGOT}`)
})
```

## A custom material

A startup script adds the material; a server script tags items as it. Here the items come from KubeJS's own item
registration (that part is KubeJS's API, see its documentation for your version).

```js title="kubejs/startup_scripts/zinc.js"
StartupEvents.registry('item', event => {
  event.create('zinc_ingot')
  event.create('zinc_nugget')
})

HBMEvents.registry(event => {
  event.material('zinc')
    .displayName('Zinc')
    .colors(0xA8B3B5, 0x4E5A5C, 0xC6CFD0)   // solid light, solid dark, molten
    .smelting('SMELTABLE')
})
```

```js title="kubejs/server_scripts/zinc_tags.js"
ServerEvents.tags('item', event => {
  event.add('c:ingots/zinc', 'kubejs:zinc_ingot')     // melts into one ingot of zinc
  event.add('c:nuggets/zinc', 'kubejs:zinc_nugget')   // one ninth of that
})
```

A zinc ingot now melts in a crucible into molten zinc. Put the startup script in the client pack too: client and server
must run the same startup scripts. See [Startup registry](../startup-registry/).
