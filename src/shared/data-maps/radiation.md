---
title: Radiation in the world
description: Ambient radiation by biome and dimension, mobs that change when irradiated, radiation-immune mobs and radiation-proof blocks.
sidebar:
  order: 3
---

These maps and tags control where radiation comes from besides items and blocks, what it does to mobs, and what stops it.
The [overview](../overview/) explains the data map file format. How fast radiation spreads and decays is fixed.

## ambient_radiation (biomes)

`data/hbm/value_maps/worldgen/biome/ambient_radiation.json`. Registry: biome; keys are biome ids or `#biome tags`.
HBM ships no entries.

Radiation an entity takes every second while it stands in the biome. Creative players and radiation-immune mobs are
spared.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `radiation` | number | required | RAD per second. |
| `wet_multiplier` | number | `1` | Multiplies the radiation while the entity is in water or rain. |

```json title="data/hbm/value_maps/worldgen/biome/ambient_radiation.json"
{
  "values": {
    "minecraft:deep_dark": { "radiation": 0.5 },
    "#c:is_wasteland": { "radiation": 2, "wet_multiplier": 5 }
  }
}
```

HBM's three crater biomes, left behind by large nuclear blasts, take their values from `hbm.cfg` instead:
`17.R02_craterBiomeOuterRad` (outer crater, 0.5), `17.R00_craterBiomeRad` (crater, 5), `17.R01_craterBiomeInnerRad`
(inner crater, 25), times `17.R03_craterBiomeWaterMult` (5) when wet. An entry here for `hbm:crater`,
`hbm:crater_inner` or `hbm:crater_outer` replaces the config values for that biome.

## ambient_radiation (dimensions)

`data/hbm/value_maps/dimension/ambient_radiation.json`. Keys are dimension ids (`minecraft:the_end`); tags are not read.
HBM ships no entries.

Value: a number, RAD per second. It is a floor: an entity in the dimension takes at least this much, or the chunk's own
radiation if that is higher. The nether's floor is `hbm.cfg` `AMBIENT_00_nether` (0.1) and still applies; where both
apply, the higher one counts.

```json title="data/hbm/value_maps/dimension/ambient_radiation.json"
{
  "values": { "minecraft:the_end": 0.25 }
}
```

## radiation_transformation

`data/hbm/value_maps/entity_type/radiation_transformation.json`. Registry: entity type. HBM ships 4 entries.

A mob that has taken enough radiation turns into another mob.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `threshold` | number | required | The mob's radiation (RAD) at which it transforms. |
| `chance` | integer | `1` | It transforms with a chance of 1 in `chance`, rolled each tick at or above the threshold. |
| `result` | entity type id | required | What it becomes. Must be a mob. |
| `fallback_damage` | number | `0` | Radiation damage dealt when the roll fails. |

At or above the threshold the mob either transforms or takes the fallback damage, and skips radiation sickness that
tick. The new mob appears where the old one stood, facing the same way; name, equipment and other data are not carried
over.

```json title="data/hbm/value_maps/entity_type/radiation_transformation.json (HBM's)"
{
  "values": {
    "minecraft:creeper": { "threshold": 200, "chance": 3, "result": "hbm:entity_mob_nuclear_creeper", "fallback_damage": 100 },
    "minecraft:cow": { "threshold": 50, "result": "minecraft:mooshroom" },
    "minecraft:villager": { "threshold": 500, "result": "minecraft:zombie" },
    "hbm:entity_fucc_a_ducc": { "threshold": 200, "result": "hbm:entity_elder_one" }
  }
}
```

The entry matches the exact type, so another mod's cow does not turn into a mooshroom unless it has an entry of its own.

## Radiation-immune mobs

The entity-type tag `hbm:radiation_immune` (`data/hbm/tags/entity_type/radiation_immune.json`, `tags/entity_types/` on
1.20.1) lists mobs radiation does not affect. HBM's members: zombie, husk, drowned, zombie villager, zombified piglin,
skeleton, stray, wither skeleton, bogged and parched (where the version has them), mooshroom, ocelot, cat, zombie horse,
skeleton horse, armor stand, nuclear creeper and Quackos.

HBM's bosses and a few other HBM mobs are immune by their code and are not in the tag. A mob under the mutation effect is
always immune.

```json title="data/hbm/tags/entity_type/radiation_immune.json"
{
  "replace": false,
  "values": ["minecraft:wither", { "id": "othermod:ghoul", "required": false }]
}
```

To make one of HBM's members vulnerable, replace the tag (`"replace": true`) with the list you want.

## Radiation-proof blocks

The block tag `hbm:radiation_resistant` (`data/hbm/tags/block/radiation_resistant.json`) makes blocks seal radiation like
HBM's concrete and lead walls: radiation does not pass through them. HBM ships it empty; its own shielding blocks seal by
their code, and doors and hatches seal only while closed. A tagged block always seals. Tagged blocks show
`[Radiation shielding]` in their tooltip.

```json title="data/hbm/tags/block/radiation_resistant.json"
{
  "replace": false,
  "values": ["minecraft:obsidian", "#c:storage_blocks/lead"]
}
```

Placing or removing a tagged block updates the sealing at once. Changing the tag on `/reload` updates every loaded area.
