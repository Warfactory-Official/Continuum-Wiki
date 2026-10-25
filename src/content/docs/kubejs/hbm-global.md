---
title: The HBM global
description: Every method of the HBM script global, with parameters, return values, units and side effects.
sidebar:
  order: 3
---

`HBM` is a script global, bound in startup, server and client scripts. It is a thin layer over HBM's own code: every
setter makes the same call HBM makes itself, and every lookup returns plain values (numbers, strings, booleans,
read-only lists and maps). It never hands out a live HBM object.

```js
PlayerEvents.tick(event => {
  if (HBM.getRadiation(event.player) > 800) event.player.tell('Get out!')
})
```

General rules:

- **Setters act on the logical server only.** On a client they do nothing (and `contaminate` returns `false`).
- **Ids are strings.** Fluids by registry name (`'hbm:oil'`, `'minecraft:water'`; a bare `'oil'` means `hbm:oil`),
  materials by name (`'iron'`), hazard types by id (`'hbm:radiation'`).
- Unknown ids never throw: they give `null`, `0`, `false` or an empty list, as listed per method.

## Entity radiation and exposure

All of these take a living entity (a player or a mob).

| Method | Returns | Notes |
|---|---|---|
| `getRadiation(entity)` | number | Accumulated radiation in RAD, 0 to 2500. Always 0 when the `RADIATION_00_enableContamination` config is off. |
| `setRadiation(entity, rad)` | | Sets it as given (not clamped). No effect when contamination is off. |
| `addRadiation(entity, rad)` | | Adds `rad` directly, ignoring armour and immunity, then clamps to 0..2500. A negative `rad` removes radiation. No effect when contamination is off. |
| `getNeutron(entity)` | number | The neutron activation the entity carries. |
| `setNeutron(entity, rad)` | | |
| `getDigamma(entity)` | number | Digamma, 0 to 10. Each point halves maximum health; 10 kills. |
| `setDigamma(entity, digamma)` | | Applies the maximum-health change at once. At 10 or more the entity dies. Not clamped. |
| `addDigamma(entity, digamma)` | | Adds, clamps to 0..10, then applies as `setDigamma`. |
| `getAsbestos(entity)` | integer | Asbestos exposure in ticks. 0 when the `HAZ_00_disableAsbestos` config is on. |
| `setAsbestos(entity, ticks)` | | At `getMaxAsbestos()` or more, the entity takes 1000 asbestos damage and the counter resets to 0. |
| `addAsbestos(entity, ticks)` | | Adds, then applies as `setAsbestos`. A player also sees 1.7's "My lungs are burning." warning for three seconds. |
| `getMaxAsbestos()` | integer | 72000 (one hour). |
| `getBlackLung(entity)` | integer | Coal dust exposure in ticks. 0 when the `HAZ_01_disableCoaldust` config is on. |
| `setBlackLung(entity, ticks)` | | At `getMaxBlackLung()` or more, the entity takes 1000 black lung damage and the counter resets to 0. |
| `addBlackLung(entity, ticks)` | | Adds, then applies as `setBlackLung`. A player also sees 1.7's "It's hard to breathe here." warning for three seconds. |
| `getMaxBlackLung()` | integer | 144000 (two hours). |

### Contamination: the protected path

`addRadiation` ignores protection. To give a dose the way an HBM radiation source does, use `contaminate`:

```js
HBM.contaminate(entity, hazardType, contaminationType, amount)  // returns true if it got through
```

`hazardType` is one of:

| Hazard | Effect |
|---|---|
| `RADIATION` | adds `amount × getRadiationMultiplier(entity)` RAD |
| `NEUTRON` | as `RADIATION`, and sets the neutron value to `amount` |
| `DIGAMMA` | adds `amount` digamma (protection decides only whether it gets through) |
| `MONOXIDE` | deals `amount` carbon monoxide damage |

`contaminationType` says what protects against it:

Armour only protects players; for mobs only immunity and resistance apply.

| Type | Blocked by |
|---|---|
| `FARADAY` | a full set of Faraday (metal) armour |
| `HAZMAT` | any full hazmat set (basic or heavy), or the Mutation effect |
| `HAZMAT2` | a full heavy hazmat set (PAA, liquidator, euphemium, RPA, FAU, DNS and similar) |
| `DIGAMMA` | the FAU or DNT nano suit, or the Stability effect, or what blocks `DIGAMMA2` |
| `DIGAMMA2` | the full robes with the Stability effect, plus 1.7's further conditions (iron cladding, low health) |
| `CREATIVE` | creative mode only; radiation resistance still applies |
| `RAD_BYPASS` | creative mode only; radiation resistance does not apply (the full `amount` is given) |
| `NONE` | nothing |

Names are case-insensitive. The call returns `false` (and does nothing) for an unknown name, on a client, for a
spectator, for a player blocked by armour, for a creative player (except with `NONE` and `DIGAMMA2`), for a player in
the first 200 ticks after joining or respawning, and for radiation or neutron doses on a radiation-immune entity.
A dose that gets through fires the [`entityIrradiated`](../events/#entityirradiated) event.

| Method | Returns | Notes |
|---|---|---|
| `isRadImmune(entity)` | boolean | Takes any entity. HBM's immune mobs, and other mods' answers. |
| `getRadiationResistance(entity)` | number | Total resistance from armour, cladding and Rad-X, as the Geiger counter shows it. |
| `getRadiationMultiplier(entity)` | number | The share of a dose that reaches the entity: `10^(-resistance)`. 1 is all of it, 0 under the Mutation effect. |
| `getRadiationResistance(stack)` | number | One armour piece's resistance, cladding included. |

## Chunk radiation

The radiation in the world, from HBM's radiation system. Each method takes a level and either a block position or
`x, y, z` numbers (rounded down to a block).

| Method | Returns | Notes |
|---|---|---|
| `getChunkRadiation(level, pos)` / `(level, x, y, z)` | number | RAD at that position. 0 on a client level. |
| `setChunkRadiation(level, pos, rad)` / `(level, x, y, z, rad)` | | Sets it; values below 0 become 0. |
| `addChunkRadiation(level, pos, rad)` / `(level, x, y, z, rad)` | | Adds `rad`. |
| `addChunkRadiationCapped(level, pos, rad, max)` | | Adds `rad` but not above `max`, as HBM's own radiation sources do. Position form only. |
| `removeChunkRadiation(level, pos, rad)` / `(level, x, y, z, rad)` | | Subtracts `rad`. |

The setters do nothing on a client level.

These calls are safe from any thread. The radiation system answers only on the server thread, so a write made from
another thread is queued onto it, and a read made from another thread waits for it. Some KubeJS 6 events (chat among
them) arrive off the server thread; see [Troubleshooting](../troubleshooting/#threads-on-kubejs-6). Never call a
read from a thread the server itself is waiting on.

## Fluids

| Method | Returns | Notes |
|---|---|---|
| `fluids()` | list of strings | Every HBM fluid id in HBM's display order, without `hbm:none`. |
| `hasFluid(id)` | boolean | Whether `id` is a fluid HBM knows. Any registered fluid counts: another mod's fluid becomes an HBM fluid when HBM meets it. |
| `fluid(id)` | object or `null` | Everything below in one object. `null` for an unknown id. |
| `fluidTraits(id)` | list of strings | Phase, flags and trait names as the `fluid_property` file spells them (`liquid`, `gaseous`, `viscous`, `flammable`, ...). Empty for an unknown id. |
| `fluidHasTrait(id, trait)` | boolean | Whether `fluidTraits(id)` contains `trait`. |
| `fluidHazard(id)` | object or `null` | The 1.7 hazard diamond: `poison`, `flammability`, `reactivity` (numbers), `symbol` (string). |
| `fluidTemperature(id)` | integer | Degrees Celsius; room temperature is 20. 0 for an unknown id. |
| `fluidColor(id)` | integer | Colour as `0xRRGGBB`. 0 for an unknown id. |

The object from `fluid(id)`:

| Key | Type | Meaning |
|---|---|---|
| `id` | string | Registry id, `hbm:oil` |
| `name` | string | The 1.7 internal name, `OIL` |
| `displayName` | string | The translated name, as players see it |
| `color` | integer | Fluid colour, `0xRRGGBB` |
| `tint` | integer | Colour used for GUI tinting |
| `temperature` | integer | Degrees Celsius |
| `hot` | boolean | Temperature 100 or above |
| `foreign` | boolean | Another mod's fluid that HBM picked up at run time |
| `traits` | list of strings | As `fluidTraits(id)` |
| `hazard` | object | As `fluidHazard(id)` |
| `properties` | string | The fluid's full [`fluid_property`](../data/fluids/) JSON, as text. Use `JSON.parse(f.properties)`. |

`symbol` is one of `none`, `radiation`, `nowater`, `acid`, `asphyxiant`, `cryogenic`, `antimatter`, `oxidizer`.

```js
const oil = HBM.fluid('hbm:oil')
console.info(`${oil.displayName}: ${oil.temperature} °C, flammable ${HBM.fluidHasTrait('hbm:oil', 'flammable')}`)
const props = JSON.parse(oil.properties)
```

## Materials

Crucible and foundry materials.

| Method | Returns | Notes |
|---|---|---|
| `materials()` | list of strings | Every material name, in registration order. |
| `material(name)` | object or `null` | `null` for an unknown name. |

The object from `material(name)`:

| Key | Type | Meaning |
|---|---|---|
| `name` | string | `iron` |
| `displayName` | string | The shown name |
| `solidColorLight`, `solidColorDark` | integer | Solid colours, `0xRRGGBB` |
| `moltenColor` | integer | Molten colour, `0xRRGGBB` |
| `smelting` | string | `NOT_SMELTABLE`, `VAPORIZES`, `BREAKS`, `SMELTABLE` or `ADDITIVE` |
| `smeltsInto` | string | The material it melts into (its own name when it melts into itself) |
| `convIn`, `convOut` | integer | `convIn` of this material melt into `convOut` of `smeltsInto` |
| `autogen` | list of strings | The shapes HBM generates items for (`INGOT`, `PLATE`, ...) |
| `tags` | map | Shape name to the `c:` item tag that makes an item count as that shape (`INGOT` to `c:ingots/iron`) |

```js
const iron = HBM.material('iron')
console.info(iron.tags.INGOT)  // c:ingots/iron
```

## Item hazards

| Method | Returns | Notes |
|---|---|---|
| `itemHazards(stack)` | list of objects | One `{type, level}` per hazard on the stack. `type` is the hazard id (`hbm:radiation`), `level` the value after modifiers, as the tooltip shows it. Empty for a harmless or empty stack. |
| `itemHazardLevel(stack, type)` | number | The stack's total level of one hazard type. `type` is `'hbm:radiation'` or a bare `'radiation'`. 0 for an unknown type. |
| `itemRadiation(stack)` | number | The stack's radiation in RAD/s, what the tooltip and the Geiger counter use. |
| `hazardTypes()` | list of strings | Every hazard type id (`hbm:radiation`, `hbm:asbestos`, ..., other mods' too). |

To change item hazards, use the hazard [data maps](../data-maps/overview/), not scripts.
