---
title: World generation
description: "HBM's configurable world-generation feature types, its config-driven placement steps, and its structure types."
sidebar:
  order: 9
---

HBM's ores, deposits, caves, strata, oil bubbles, craters, plants and scattered dungeon blocks are vanilla configured
and placed features, so a datapack can change them like any vanilla feature: replace HBM's file under
`data/hbm/worldgen/configured_feature/` or `placed_feature/`, or add a feature of your own that uses one of HBM's feature
types. Worldgen files are read when the world loads, so leave and reopen the world after a change; only chunks generated
afterwards are affected.

Every HBM feature type takes a `config` in which **every field is optional**: a missing field keeps HBM's own value (1.7's).
HBM's shipped files mostly say `"config": {}`. So to change one value, copy HBM's file and set just that field.

Counts and chances that are drawn at random (`attempts`, `y_range`, `tries`, the spreads, `octaves`, the `*_chance`
fields and the like) must be 1 or more, and `max_size` must be greater than `min_size`. A file that breaks this fails to
load, with an error naming the field.

```json title="data/hbm/worldgen/configured_feature/schist_stratum.json (a datapack's copy)"
{
  "type": "hbm:schist_stratum",
  "config": { "state": { "Name": "minecraft:calcite" }, "y_level": 60 }
}
```

How many times a feature tries per chunk, and whether it runs at all, is usually decided by its placed feature, through
the [`hbm:config`](#placement-reading-hbmcfg) step that reads `hbm.cfg`. Where to place features on NeoForge and Forge is
set by biome modifiers; Fabric has no biome modifier files, so there HBM adds each feature in code to the biomes and biome
tags its modifier names (`#minecraft:is_overworld`, `#hbm:has_feature/foxglove`, ...), and a datapack changes the
placement through those tags (see [What a datapack can
change](../../../datapacks/overview/#vanilla-and-loader-data-hbm-ships)).

## Value types

| Type | JSON | Notes |
|---|---|---|
| block state | `{"Name": "hbm:stone_gneiss", "Properties": {...}}` | vanilla's block state form |
| block | `"hbm:stone_depth"` | a block id |
| item | `"hbm:record_glass"` | an item id |
| rule test | `{"predicate_type": "minecraft:tag_match", "tag": "hbm:legacy_stone"}` | any vanilla rule test: `block_match`, `blockstate_match`, `tag_match`, `random_block_match`, `always_true`, ... |
| config value | `200` or `"2.21_oilSpawnRate"` | a number, or an `hbm.cfg` key read when the chunk generates (a true/false key reads 1 or 0) |
| item pool | `"POOL_VAULT_RUSTY"` | an [item pool](../item-pools/) name; the feature rolls its `hbm:chests/<pool>` loot table |

Two block tags hold the default hosts, and a datapack can add to them: `hbm:legacy_stone` (stone, granite, diorite,
andesite, deepslate, tuff), where ore veins, layers, strata and caves may replace blocks; and `hbm:tar_sand_hosts` (sand,
red sand), what oil sand bubbles replace.

## Feature types


### Ores and deposits

**`hbm:legacy_ore`**: vanilla `ore` configuration (`targets` [{`target` rule test, `state`}], `size`;
`discard_chance_on_air_exposure` is ignored). One 1.7 `WorldGenMinable` vein (1.7's ellipsoid with its `+8`); the first
matching target wins.

**`hbm:depth_deposit`** (all fields **required**): `ore` (block state), `filler` (block state), `host`
(block state; stone also takes deepslate), `size` (int, radius), `fill` (float, core radius fraction). A sphere of ore in
a depth-rock shell that also eats bedrock, clamped to `minY + 1 .. minY + 126`.

**`hbm:coltan_deposit`**: around a centre drawn from `new Random(seed + seed_offset)` (gaussian x and z, sigma
`spread`), `attempts` times per chunk and for each band `r = 1..rings`, a random position gets a vein if it lies within
`base_range / r` of the centre.

| field | type | default | meaning |
|---|---|---|---|
| `ore` | block state | `hbm:ore_coltan` | vein block |
| `host` | rule test | tag `hbm:legacy_stone` | what a vein replaces |
| `size` | int | 4 | vein size |
| `attempts` | int | 2 | outer attempts per chunk |
| `rings` | int | 5 | bands per attempt |
| `base_range` | int | 750 | reach of band 1 (band r: `base_range / r`) |
| `spread` | double | 1500 | sigma of the centre's gaussian |
| `seed_offset` | long | 5 | added to the world seed for the centre |
| `min_y` | int | 15 | lowest vein y |
| `y_range` | int | 25 | `y = min_y + rand(y_range)` |
| `enabled` | config int | `"X528_enableColtanDeposit"` | 0 = off |

```json
{"type": "hbm:coltan_deposit", "config": {"ore": {"Name": "minecraft:diamond_ore"}, "rings": 3, "enabled": 1}}
```

**`hbm:australium`**: `rand.nextInt(attempts)` tries a chunk, each a random
position that gets a vein only inside the box `min_x..max_x`, `min_z..max_z`.

| field | type | default | meaning |
|---|---|---|---|
| `ore` | block state | `hbm:ore_australium` | vein block |
| `host` | rule test | tag `hbm:legacy_stone` | what a vein replaces |
| `size` | int | 50 | vein size |
| `attempts` | int | 4 | roll bound for tries |
| `min_y`, `y_range` | int | 15, 15 | `y = min_y + rand(y_range)` |
| `min_x`, `max_x`, `min_z`, `max_z` | int | -450, -350, -450, -350 | the fixed world box |

```json
{"type": "hbm:australium", "config": {"min_x": 1000, "max_x": 1200, "min_z": 1000, "max_z": 1200}}
```

**`hbm:bedrock_ore`**: one 3 x 3 bedrock-ore patch at `chunk + 8 + rand(2)` on the world floor (resource, tier and acid
from the world's ore field) and a cap: `depth_rock` replaces `host` and bedrock 1..2 above the floor and bedrock 3..6
above it, within 3 blocks.

| field | type | default | meaning |
|---|---|---|---|
| `depth_rock` | block | `hbm:stone_depth` | cap block |
| `host` | rule test | tag `minecraft:base_stone_overworld` | what the cap replaces besides bedrock |
| `color` | int | `14125590` (0xD78A16) | deposit tint |

```json
{"type": "hbm:bedrock_ore", "config": {"depth_rock": "minecraft:basalt"}}
```

**`hbm:bedrock_ore_nether`**: the same patch with one weighted entry per chunk (picked from the seed and the chunk; the
last entry takes what the others leave, as 1.7's quartz did).

| field | type | default | meaning |
|---|---|---|---|
| `depth_rock` | block | `hbm:stone_depth_nether` | cap block |
| `host` | rule test | tag `minecraft:base_stone_overworld` | what the cap replaces besides bedrock |
| `entries` | list | glowstone dust x4 `0xF9FF4D` weight `"2.BN00_bedrockGlowstoneWeight"`; `hbm:powder_fire` x4 `0xD7341F` weight `"2.BN01_bedrockPhosphorusWeight"`; quartz x4 `0xF0EFDD` weight `"2.BN01_bedrockQuartzWeight"` | the choices |
| `entries[].item` | item | **required** | resource |
| `entries[].count` | int | 1 | resource count |
| `entries[].color` | int | 16777215 | tint |
| `entries[].tier` | int | 1 | extraction tier |
| `entries[].weight` | config int | **required** | weight (negative reads 0) |

```json
{"type": "hbm:bedrock_ore_nether", "config": {"entries": [
  {"item": "minecraft:quartz", "count": 4, "color": 15790045, "weight": 3},
  {"item": "minecraft:netherite_scrap", "count": 1, "color": 6637376, "tier": 3, "weight": 1}]}}
```

**`hbm:crust_column`**: every `host` block in `d - depth .. d` with air directly above becomes `state` (the column and
`d` are placement).

| field | type | default | meaning |
|---|---|---|---|
| `state` | block state | **required** | placed block |
| `host` | rule test | block `minecraft:netherrack` | what is replaced |
| `depth` | int | 5 | how far below `d` it scans |

```json
{"type": "hbm:crust_column", "config": {"state": {"Name": "minecraft:magma_block"}, "depth": 8}}
```

### Noise strata

**`hbm:schist_stratum`**: per column, `n = noise(x * scale, z * scale)`; above `threshold`,
`range = (int) ((n - threshold) * range_mult)`, folded to `2 * max_range - range` past `max_range`; every solid `host`
block in `y_level ± range` becomes `state`. Noise: `NoiseGeneratorPerlin(new Random(seed + seed_offset), octaves)`.

| field | type | default | meaning |
|---|---|---|---|
| `state` | block state | `hbm:stone_gneiss` | band block |
| `host` | rule test | tag `hbm:legacy_stone` | what the band replaces (solid cubes only) |
| `scale` | double | 0.01 | noise scale |
| `threshold` | double | 5.0 | noise needed for a column |
| `range_mult` | int | 3 | noise to half-thickness |
| `max_range` | int | 4 | fold point |
| `y_level` | int | 30 | band centre |
| `octaves` | int | 4 | noise octaves |
| `seed_offset` | long | 0 | added to the world seed |

```json
{"type": "hbm:schist_stratum", "config": {"state": {"Name": "minecraft:calcite"}, "y_level": 60, "seed_offset": 7}}
```

**`hbm:ore_caves`**: `caves`, run in order (default: sulfur, then asbestos). Per cave: half-thickness from the noise as
above; every solid host block in `y_level ± range` that touches air (or a spike) becomes `ore`; an open cell in the band
gets a spike one time in five (stalactite if it can hang, else stalagmite); with a `fluid`, half the eligible enclosed
cells become the fluid, lined with the ore.

| field (per cave) | type | default | meaning |
|---|---|---|---|
| `ore` | block state | **required** | wall block |
| `stalactite`, `stalagmite` | block state | absent (no spike) | spikes |
| `fluid` | block state | absent (no pools) | pool block |
| `host` | rule test | tag `hbm:legacy_stone` | what the wall replaces |
| `threshold` | double | 1.5 | noise needed |
| `range_mult` | int | 20 | noise to half-thickness |
| `max_range` | int | 20 | fold point |
| `y_level` | int | 30 | band centre |
| `scale` | double | 0.01 | noise scale |
| `octaves` | int | 2 | noise octaves |
| `seed_offset` | long | 0 | added to the world seed |
| `enabled` | config int | 1 | 0 = off |

Default `caves`: sulfur (`stone_resource_sulfur`, `stalactite_sulfur`, `stalagmite_sulfur`, fluid
`sulfuric_acid_block`, threshold 1.5, y 30, `seed_offset` 2975, `enabled` `"2.C00_enableSulfurCave"`), asbestos
(`stone_resource_asbestos`, its spikes, no fluid, threshold 1.75, y 25, `seed_offset` 82206, `enabled`
`"2.C01_enableAsbestosCave"`). Replacing `caves` replaces both.

```json
{"type": "hbm:ore_caves", "config": {"caves": [{"ore": {"Name": "minecraft:amethyst_block"},
  "stalactite": {"Name": "minecraft:pointed_dripstone"}, "threshold": 1.2, "y_level": 0, "seed_offset": 99}]}}
```

**`hbm:ore_layers`**: `layers`, in order (default hematite, bauxite, malachite). A cell between `min_y` and `max_y`
becomes the layer's `state` when `nX * nY * nZ > threshold` and it is a solid `host` block.

| field | type | default | meaning |
|---|---|---|---|
| `layers` | list | the three 1.7 layers | |
| `layers[].state` | block state | **required** | layer block |
| `layers[].scale_h`, `scale_v` | double | **required** | horizontal and vertical noise scale |
| `layers[].threshold` | double | **required** | product needed |
| `layers[].seed_offset` | long | 0 | noise fields `seed + 101 + offset`, `seed + 102 + offset` |
| `layers[].enabled` | config int | 1 | 0 = off |
| `host` | rule test | tag `hbm:legacy_stone` | what the layers replace (solid cubes only) |
| `min_y`, `max_y` | int | 6, 64 | height band |

Default layers: hematite 0.04 / 0.25 / 230, offset 0, `"2.L00_enableHematite"`; bauxite 0.03 / 0.15 / 300, offset 1,
`"2.L02_enableBauxite"`; malachite 0.10 / 0.15 / 275, offset 2, `"2.L01_enableMalachite"`.

```json
{"type": "hbm:ore_layers", "config": {"min_y": -50, "max_y": 0, "layers": [
  {"state": {"Name": "hbm:stone_resource_hematite"}, "scale_h": 0.04, "scale_v": 0.25, "threshold": 200}]}}
```

### Terrain

**`hbm:oil_bubble`** and **`hbm:oil_sand_bubble`** (same fields, different defaults): one origin chunk in `frequency`
(roll `rand(f) == f - 1`, a third of `f` where it is hot and dry) gets an oblate sphere of `ore` replacing `host`, radius
`min_size .. max_size - 1`, plus `spot_count` gaussian blight spots (sigma `spot_width`) and the vent hole.

| field | type | default oil / oil sand | meaning |
|---|---|---|---|
| `frequency` | config int | `"2.21_oilSpawnRate"` / 200 | one origin in this many; 0 = off |
| `min_size`, `max_size` | int | 8, 16 / 16, 48 | radius range (the reach is `max_size / 8 + 1` chunks) |
| `min_y`, `y_range` | int | 15, 25 / 56, 16 | centre height `min_y + rand(y_range)` |
| `fuzzy` | bool | false / true | jittered edge |
| `host` | rule test | block `minecraft:stone` / tag `hbm:tar_sand_hosts` | what the bubble replaces |
| `ore` | block state | `hbm:ore_oil` / `hbm:ore_oil_sand` | fill |
| `min_temperature` | float | absent / 1.5 | the origin biome's 1.7 temperature must be at least this |
| `no_lightning` | bool | false / true | only where it never storms |
| `spot_count`, `spot_width` | int | 150, 7 | blight spots |

```json
{"type": "hbm:oil_bubble", "config": {"frequency": 40, "ore": {"Name": "hbm:ore_gneiss_gas"}}}
```

**`hbm:bedrock_oil`**: one origin in `frequency` (roll `rand(f) == f - 2`) turns bedrock and `host` in the floor's five
lowest layers within an L1 diamond into `ore`, then blights `spot_count` gaussian surface spots.

| field | type | default | meaning |
|---|---|---|---|
| `frequency` | config int | `"2.22_bedrockOilSpawnRate"` | one origin in this many; 1 or less = off |
| `ore` | block state | `hbm:ore_bedrock_oil` | deposit block |
| `host` | rule test | tag `minecraft:base_stone_overworld` | replaced besides bedrock |
| `spot_count`, `spot_width` | int | 50, 5 | blight spots |

```json
{"type": "hbm:bedrock_oil", "config": {"frequency": 50, "spot_count": 0}}
```

**`hbm:sellafield_crater`**: one origin in `frequency` whose corner lies in one of `biomes` (empty: any biome) becomes a
crater of radius `min_size .. max_size - 1`, `depth_factor x radius` deep, relined with `regolith` (inner third) and
`rock`.

| field | type | default | meaning |
|---|---|---|---|
| `frequency` | config int | `"4.15_radHotspotSpawn"` | one origin in this many |
| `biomes` | list of biome ids | `["minecraft:desert"]` | allowed origin biomes |
| `min_size`, `max_size` | int | 8, 64 | radius range |
| `depth_factor` | double | 0.35 | depth per radius |
| `regolith`, `rock` | block state | `hbm:sellafield_slaked` both | lining |

```json
{"type": "hbm:sellafield_crater", "config": {"biomes": ["minecraft:badlands"], "regolith": {"Name": "hbm:waste_earth"}}}
```

### Surface

**`hbm:legacy_flowers`**: `tries` tries around the origin (`x + rand(xz_spread) - rand(xz_spread)`, likewise y and z);
a try places `state` on air where it can stay. Skipped after a Tom impact.

| field | type | default |
|---|---|---|
| `state` | block state | **required** |
| `tries` | int | 64 |
| `xz_spread` | int | 8 |
| `y_spread` | int | 4 |

```json
{"type": "hbm:legacy_flowers", "config": {"state": {"Name": "hbm:plant_flower_foxglove"}, "tries": 16}}
```

**`hbm:geyser_chlorine`**: 1.7's 5 x 6 x 5 plug under the origin, only where the block below the origin matches
`surface`.

| field | type | default |
|---|---|---|
| `surface` | rule test | block `minecraft:grass_block` |
| `wall` | block state | `minecraft:stone` |
| `fluid` | block state | `minecraft:water` |
| `ore` | block state | `hbm:block_yellowcake` |
| `cap`, `cap_alt` | block state | `minecraft:grass_block`, `minecraft:gravel` |
| `vent` | block state | `hbm:geysir_chlorine` |

```json
{"type": "hbm:geyser_chlorine", "config": {"surface": {"predicate_type": "minecraft:block_match", "block": "minecraft:sand"},
  "cap": {"Name": "minecraft:sand"}}}
```

**`hbm:fallen_meteorite`**: sunk `rand(max_sink)` (10) below the surface and built unless the block two below is air or
liquid; `safe`, `specials`, `damage` (false, false, false) are the meteorite's safe-mode, special-blocks and damage flags.

```json
{"type": "hbm:fallen_meteorite", "config": {"specials": true}}
```

**`hbm:glyphid_hive`**: from `scan_up` above to `scan_down` below the surface, the first full cube gets a small hive,
infested one time in `infested_chance`; a core cell is a spawner one time in `spawner_chance`; loot piles draw from the
item pools `loot_pool` and `bones_pool` (3 + rand(3) draws each).

| field | type | default |
|---|---|---|
| `infested_chance` | int | 10 |
| `spawner_chance` | int | 3 |
| `scan_up`, `scan_down` | int | 3, 1 |
| `loot_pool` | item pool | `"POOL_PILE_HIVE"` |
| `bones_pool` | item pool | `"POOL_PILE_BONES"` |

```json
{"type": "hbm:glyphid_hive", "config": {"infested_chance": 2, "loot_pool": "POOL_PILE_SUPPLIES"}}
```

**`hbm:pink_tree`**: every block of the origin column that matches `target` (rule test, default `blockstate_match`
`minecraft:oak_log[axis=y]`) becomes `state` (block state, `hbm:pink_log`).

```json
{"type": "hbm:pink_tree", "config": {"target": {"predicate_type": "minecraft:block_match", "block": "minecraft:birch_log"}}}
```

**`hbm:impact_aftermath`**: after Tom's impact. `impact_dirt` (block state, `hbm:impact_dirt`) replaces grass;
`recovery_chance` (int, 9): once dust and fire are gone, trees, huge mushrooms and cacti each come back one chunk in this
many; `wipe_dust` (float, 0.25): dust above this wipes every plant.

```json
{"type": "hbm:impact_aftermath", "config": {"recovery_chance": 3}}
```

### Scattered blocks

These only generate while `hbm.cfg` `1.03_enableDungeonSpawn` allows dungeons.

**`hbm:locked_safe`**: a locked safe on a torch-safe block, filled from one weighted tier, pins 1..999, cave spiders
`spider_chance` in `spider_bound`.

| field | type | default |
|---|---|---|
| `tiers` | list | rusty (4, mod 1.0, `POOL_VAULT_RUSTY`, 3..6), standard (3, 0.1, `POOL_VAULT_STANDARD`, 2..4), reinforced (2, 0.02, `POOL_VAULT_REINFORCED`, 1..3), unbreakable (1, 0.0, `POOL_VAULT_UNBREAKABLE`, 1..2) |
| `tiers[].weight` | int >= 1 | **required** |
| `tiers[].mod` | double | **required**: lock-pick difficulty |
| `tiers[].pool` | item pool | **required** |
| `tiers[].min`, `max` | int | **required**: number of draws |
| `spider_chance`, `spider_bound` | int | 3, 10 |

```json
{"type": "hbm:locked_safe", "config": {"tiers": [{"weight": 1, "mod": 0.5, "pool": "POOL_VAULT_LAB", "min": 4, "max": 8}],
  "spider_chance": 0}}
```

**`hbm:landmine_ap`** / **`hbm:landmine_he`**: an armed `mine` (block state) on the first torch-safe block from
`scan_up` (int) above the surface down to it. Defaults `hbm:mine_ap` / 2 and `hbm:mine_he` / 0.

```json
{"type": "hbm:landmine_ap", "config": {"mine": {"Name": "hbm:mine_he"}}}
```

**`hbm:broken_lantern`**: a broken behemoth lantern; one in `loot_chance` (int, 2) gets a lore booklet two blocks north.

**`hbm:landed_capsule`**: a Soyuz capsule `depth` (int, 4) blocks down, `rusted` (bool, true), with `item` (item,
`hbm:record_glass`) in a random slot.

```json
{"type": "hbm:landed_capsule", "config": {"item": "minecraft:music_disc_13", "rusted": false}}
```

**`hbm:corrupted_broadcaster`**: `state` (block state, `hbm:broadcaster_pc`), facing a random side when it has a
horizontal facing.

**`hbm:blueprint_chest`**: one `container` (block state, `minecraft:chest`) in a `shell` (block state,
`minecraft:obsidian`) cube per `grid` (int >= 1, 5000) cell, never within `min_distance` (int, 100) of 0,0 on both axes,
skipped when `rand(roll) < skip` (int, 20 and 10), filled with `rolls` (int, 50) draws from `pool` (item pool,
`POOL_BLUEPRINTS`).

```json
{"type": "hbm:blueprint_chest", "config": {"grid": 1000, "rolls": 20}}
```


## Placement reading hbm.cfg

HBM's placed features include the placement step `hbm:config`, which reads an `hbm.cfg` value when a chunk generates. That
is how the [`hbm.cfg` ore and structure keys](../../reference/config/) take effect without changing any datapack file.

| Field | Type | Meaning |
|---|---|---|
| `key` | string | An `hbm.cfg` key, such as `2.00_uraniumSpawnrate`. An unknown key places nothing and logs once. |
| `mode` | string | `count`: repeat the position value × `multiplier` times. `chance`: keep it with a chance of 1 in value. `switch`: keep it while the value is not 0. With `count` and `chance`, a value of 0 or less places nothing. |
| `multiplier` | integer | With `count`, multiplies the value. Optional, default 1. |

```json title="data/hbm/worldgen/placed_feature/ore_uranium.json (part)"
"placement": [
  { "type": "hbm:config", "key": "2.D00_overworldOres", "mode": "switch" },
  { "type": "hbm:config", "key": "2.00_uraniumSpawnrate", "mode": "count" }
]
```

To make a feature ignore the config, replace these steps with vanilla ones (`minecraft:count`, `minecraft:rarity_filter`).

## Structures

HBM's structures are vanilla structures and structure sets under `data/hbm/worldgen/`, so `/locate` finds them. Their
building is HBM's code; a datapack decides where and how often.

- **`hbm:config_spread`** is a structure set placement: vanilla's `random_spread`, with spacing taken from `hbm.cfg` when a
  chunk is asked. Its `key` is `ntm` (HBM's NBT structures: spacing `5.02_structureMaxChunks`, separation
  `5.01_structureMinChunks`) or `dungeon:<id>` (a 1.7 dungeon's `4.xx_*Spawn` chance; 0 or less turns it off). It also
  takes vanilla's `salt`. Spacing written in a datapack is not read for these sets; to fix a spacing, give the set a
  vanilla `minecraft:random_spread` placement instead.
- **`hbm:nbt`** is a structure type with one field, `spawn`: the name of a structure registered in code (how it is built,
  its height and terrain rules). Which one spawns in a region is drawn from the weights in `hbm.cfg`.
- **`hbm:legacy_dungeon`** is a structure type with one field, `dungeon`: one of 1.7's hand-built dungeons.

The biome tags `hbm:has_structure/<structure>` choose the biomes each structure may use (see [Tags](../tags/#biome-tags)).
The NBT templates themselves are read from the mod jar, so a datapack cannot replace their contents. Structure chests are
filled from the loot table of the [item pool](../item-pools/) they name (see
[Structure loot](../advancements-and-loot/#structure-loot)).
