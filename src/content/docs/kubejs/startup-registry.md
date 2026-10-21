---
title: Startup registry
description: Add crucible materials from a KubeJS startup script with HBMEvents.registry, and make fluids HBM understands.
sidebar:
  order: 5
---

`HBMEvents.registry` is the one startup event. It lets a startup script add content that is data only: today, crucible
and foundry **materials**. New **fluids** come from KubeJS's own fluid registration plus a datapack file, see
[Fluids](#fluids) below.

```js title="kubejs/startup_scripts/hbm_materials.js"
HBMEvents.registry(event => {
  event.material('zinc').displayName('Zinc').colors(0xA8B3B5, 0x4E5A5C, 0xC6CFD0).smelting('SMELTABLE')
  event.material('brass_scrap').smelting('SMELTABLE').smeltsInto('copper', 2, 1)
})
```

## When it runs

HBM posts the event once, right after KubeJS has loaded the startup scripts. Each call only records a request. HBM adds
the materials later, once every mod's registries are filled and before any datapack loads, on the client and on the
server. The log then says:

```
[HBM] Added 2 material(s) from startup scripts
```

A request that cannot be applied is logged and skipped, never thrown into the game. For example:

```
[HBM] Script material 'zinc' skipped: the name is taken
[HBM] Script material 'brass_scrap' skipped: smeltsInto names no material: brass
```

Mistakes the builder can see at once (a bad name, an unknown smelting behaviour, a non-positive amount) are thrown as
script errors on the line that made them.

## event.material(name)

Starts a new material and returns its builder.

- `name`: lower-case letters, digits and `_` only. Anything else throws
  `A material name is lower case letters, digits and _: <name>`.
- The name must not be taken by any material, HBM's or another mod's. Check with `HBM.materials()` in a server script.
- Only callable while the event runs. Calling it later throws `HBMEvents.registry is over; ...`.

### Builder methods

All return the builder, so they chain. Each is optional.

| Method | Default | Meaning |
|---|---|---|
| `displayName(text)` | the name in title case (`brass_scrap` becomes "Brass Scrap") | The name players see. |
| `colors(solidLight, solidDark, molten)` | `0xFF4A00`, `0x802000`, `0xFF4A00` | Colours as `0xRRGGBB`: the light and dark solid shades (items, slag) and the molten colour (crucible, foundry, casting). |
| `smelting(behavior)` | `NOT_SMELTABLE` | How the material behaves in a crucible, see below. Case-insensitive. An unknown value throws. |
| `smeltsInto(material, in, out)` | itself, 1, 1 | Melts into another material: `in` units of this make `out` units of that, as coal melts into carbon. `in` and `out` must be above 0. `material` must already exist when HBM applies the request (HBM's, another mod's, or a script material requested earlier). |

The builder also has `name` (read-only) with the requested name.

`smelting` values:

| Value | Meaning |
|---|---|
| `NOT_SMELTABLE` | Cannot be smelted, and does not belong in a smelter (like diamond) |
| `VAPORIZES` | Cannot be smelted: the material would vaporize |
| `BREAKS` | Cannot be smelted: the material does not survive the heat |
| `SMELTABLE` | Melts normally (most metals) |
| `ADDITIVE` | Not smeltable on its own, but can go into a crucible (like coal) |

## How items become the material

HBM does not create items for script materials (no ingots, plates or other auto-generated shapes: those need models
built into the mod). Instead, any item counts as the material through the common `c:` item tags:

| Tag | Shape | Amount per item |
|---|---|---|
| `c:nuggets/<name>` | nugget | 8 |
| `c:billets/<name>` | billet | 48 |
| `c:ingots/<name>` | ingot | 72 |
| `c:gems/<name>` | gem | 72 |
| `c:crystals/<name>` | crystal | 72 |
| `c:dusts/<name>` | powder | 72 |
| `c:dusts_tiny/<name>` | tiny pile | 8 |
| `c:plates/<name>` | plate | 72 |
| `c:wires/<name>` | wire | 9 |
| `c:storage_blocks/<name>` | block | 648 |

Amounts are in HBM's material units: 72 is one ingot, shown in game as 144 mB (two millibuckets per unit). HBM knows more
shapes (dense wires, cast and welded plates, pipes, gun parts, ...); `HBM.material('<name>').tags` lists every shape's
tag. Ore tags (`c:ores/<name>`) do not melt.

An item melts in a crucible only when the material it melts into (`smeltsInto`, itself by default) is `SMELTABLE` or
`ADDITIVE`. A material left at `NOT_SMELTABLE` is known to HBM but its items do not melt.

A `material_distribution` row for one of the item's tags (see the datapack section) wins over this tag lookup.

Tag your items in a server script with KubeJS's tag event, or in a datapack:

```js title="kubejs/server_scripts/zinc_tags.js"
ServerEvents.tags('item', event => {
  event.add('c:ingots/zinc', 'kubejs:zinc_ingot')
  event.add('c:nuggets/zinc', 'kubejs:zinc_nugget')
})
```

`kubejs:zinc_ingot` here is any item: one from another mod, or one made with KubeJS's own startup item registration.

## Client and server must match

Materials are saved by name, but the game sends them over the network as numbers. A script material's number is worked
out from its name alone, so the same startup scripts give the same numbers on every side, whatever else is installed.
That only holds if the client and the server run the **same startup scripts**. Ship your startup scripts with the
client pack as well as the server.

## Fluids

There is no fluid builder in `HBMEvents.registry`, and none is needed:

1. **Register the fluid with KubeJS's own startup fluid registration** (see the KubeJS documentation for your version;
   the id is `kubejs:<name>` unless you give a namespace). Any registered fluid is an HBM fluid as soon as HBM meets it:
   it can go in HBM tanks, ducts and recipes, and `HBM.fluid('kubejs:<name>')` describes it.
2. **Give it HBM properties with a data file** `kubejs/data/<fluid namespace>/fluid_property/<fluid name>.json`
   (`data/...` in a plain datapack). Without
   one, the fluid has no traits and no hazard, and HBM shows it white at room temperature. See
   [Fluids](../data/fluids/) for the format.

```json title="kubejs/data/kubejs/fluid_property/liquid_ozone.json"
{
  "type": "liquid",
  "color": "#98BDF9",
  "temperature": -100,
  "hazard": {
    "poison": 3,
    "flammability": 0,
    "reactivity": 0,
    "symbol": "cryogenic"
  },
  "flags": [
    "gaseous_art"
  ]
}
```

That example is HBM's own `hbm:oxygen` file, with the path changed. New trait **types** (a trait name HBM does not have)
need Java: an addon mod's `FluidProperties.registerTrait`.

Then use the fluid in recipes like any other:

```js
event.recipes.hbm.chemical_plant('kjs.liquid_ozone')
  .inputFluids([Fluid.of('hbm:oxygen', 1000)])
  .outputFluids([Fluid.of('kubejs:liquid_ozone', 500)])
  .duration(100).power(1000)
```
