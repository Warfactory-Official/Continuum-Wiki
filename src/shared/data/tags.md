---
title: Tags
description: "The block, item and biome tags HBM reads, and how its c: convention tags work on each loader."
sidebar:
  order: 5
---

Tags are vanilla tags: add members with a normal tag file, and every pack's copy merges. These are the tags whose
contents change how HBM behaves. Folder names below are the 26.1 and 1.21.1 spelling; on 1.20.1 use `tags/blocks/`,
`tags/items/` and `tags/entity_types/`.

## Block tags

| Tag | What HBM does with it | HBM's members |
|---|---|---|
| `hbm:pump_ground` | Ground a groundwater pump (steam or electric) draws from. The pump checks the 3×3 area below it, four blocks deep; it works when at least half of those blocks are in this tag. | grass block, dirt, sand, mycelium, dead dirt, oily dirt, dirty sand, dirty red sand, waste earth |
| `hbm:fleija_immune` | Blocks the F.L.E.I.J.A. blast does not remove. | none |
| `hbm:meteorite_replaceable` | Non-replaceable blocks a meteorite in safe mode may still overwrite. | meteorite blocks and meteor ores |
| `hbm:fbi_breakable` | Blocks the FBI agents break through during a raid. | wooden doors and trapdoors, iron door, chests, and several HBM machines and crates |
| `hbm:shatters_when_shot` | Blocks a bullet destroys instead of ricocheting off, if their blast resistance is low enough. | `#minecraft:impermeable` (glass) and every glass pane |
| `hbm:radiation_resistant` | Blocks that seal radiation, like HBM's shielding blocks. See [Radiation in the world](../../data-maps/radiation/#radiation-proof-blocks). | none |
| `hbm:legacy_stone` | Where HBM's ore veins, ore layers, strata and ore caves may place their blocks (the default `host` of those [feature types](../worldgen/)). | stone, granite, diorite, andesite, deepslate, tuff |
| `hbm:tar_sand_hosts` | What oil sand bubbles replace. | sand, red sand |
| `hbm:metal_fence_connects` | Extra blocks HBM's metal fences connect to, on top of other metal fences, fence gates and full solid blocks. | none |

Example, letting pumps work on gravel:

```json title="data/hbm/tags/block/pump_ground.json"
{
  "replace": false,
  "values": ["minecraft:gravel"]
}
```

Adding members to one of HBM's tags is the one case where a file under `data/hbm/` is right: tag files merge, so
nothing of HBM's is lost as long as `replace` is `false`.

## Entity type tags

| Tag | What HBM does with it | HBM's members |
|---|---|---|
| `hbm:radiation_immune` | Mobs radiation does not affect. See [Radiation in the world](../../data-maps/radiation/#radiation-immune-mobs). | zombies, skeletons and their variants, mooshroom, ocelot, cat, zombie and skeleton horses, armor stand, nuclear creeper, Quackos |

## Item tags

| Tag | Use |
|---|---|
| `hbm:crowbar` | Items that pry open HBM's loot crates (crates, supply crates, ammo crates and can crates). HBM's member: `hbm:crowbar`. |
| `hbm:repairs/<name>` | The repair material of an HBM armor set or tool (anvil repair). For example `hbm:repairs/steel`, `hbm:repairs/desh`, `hbm:repairs/hazmat_cloth`. |
| `hbm:raw_fishes` | Raw fish for the mixer's and liquefactor's fish oil recipes (cod, salmon, tropical fish, pufferfish). |
| `hbm:steel_scaffolds` | Any steel scaffold colour, in crafting recipes. |
| `hbm:stone_slabs` | The eight 1.7 stone slab kinds, in crafting recipes. |
| `hbm:sandstones` | Sandstone, chiseled and cut sandstone, in crafting recipes. |
| `hbm:scrap_plastic` | Every plastic scrap item, smelted into polymer. |
| `hbm:red_flowers` | Red flowers for an armor mod recipe. |
| `hbm:music_discs` | Music discs for a crafting recipe. |
| `hbm:melee_kit_swords` | HBM's melee kit swords; nested into `minecraft:swords`. |

HBM also ships `hbm:zirnox_rods`, `hbm:zirnox_depleted_rods` (items), `hbm:uranium_ores` (blocks) and `hbm:bosses`
(entity types) for other mods to use. HBM's own code does not read them.

## Convention (`c:`) tags

HBM's recipes and data maps name materials by the common `c:` tags, the modern spelling of 1.7's ore dictionary:
`#c:ingots/uranium`, `#c:plates/steel`, `#c:dusts/coal`. HBM ships about 800 of them, covering `ingots`, `nuggets`,
`dusts`, `dusts_tiny`, `plates`, `plates_cast`, `plates_welded`, `billets`, `gems`, `crystals`, `fragments`, `ores`,
`raw_materials`, `storage_blocks`, `wires`, `wires_dense`, `bolts`, `pipes` and more, plus single tags such as
`c:cokes`, `c:tars`, `c:rods/wooden` and `c:glyphid_meats`.

Adding an item to one of these tags makes it count everywhere HBM accepts the tag. That includes hazards: the
[hazards data map](../../data-maps/hazards/#hazards) gives radiation to `#c:ingots/uranium`, so another mod's uranium
ingot in that tag becomes radioactive.

```json title="data/c/tags/item/ingots/uranium.json"
{
  "replace": false,
  "values": ["othermod:uranium_ingot"]
}
```

### `c:` tags on 1.20.1 Forge

On Forge 1.20.1 the convention namespace is `forge:`. HBM ships its `c:` tags there too and copies each one to
`forge:` with the same members, so HBM's items appear in `#forge:ingots/uranium` for other Forge mods. HBM's crafting
recipes are pointed at the `forge:` copies. Machine recipes and data maps keep naming `c:` tags.

So, on 1.20.1 Forge, an item you want HBM to accept everywhere belongs in both tags: `forge:` for HBM's crafting
recipes, `c:` for machine recipes and data maps. The `forge:` copy does not include the `c:` tag, and the `c:` tag does
not include the `forge:` one.

On every other node (both 26.1 nodes, both 1.21.1 nodes and 1.20.1 Fabric) only `c:` is used.

## Biome tags

| Tag | Use |
|---|---|
| `hbm:has_structure/<structure>` | The biomes a structure may generate in (`hbm:has_structure/bunker`, `hbm:has_structure/oil_rig`, ...). Each also holds `#hbm:biome_dictionary/...` tags, so modded biomes of the right 1.7 type are candidates too. |
| `hbm:biome_dictionary/<type>` | Which 1.7 Forge biome type a biome is: `overworld`, `ocean`, `beach`, `plains`, `river`, `sandy`, `sparse`, `swamp`. Each is built from the matching `c:` and `minecraft:` biome tags. |
| `hbm:has_feature/foxglove`, `hbm:has_feature/nightshade` | Where the foxglove and nightshade flowers generate. |

The biome dictionary tags let HBM treat modded biomes the way 1.7 did. Ocean and plains biomes also get HBM's
plastic bag and pigeon spawns. A modded biome that already sits in the right `c:` biome tags is picked up without any
change; for one that is not, add it to the `hbm:biome_dictionary/<type>` tag.

Being in a `has_structure` tag is necessary but not enough: when a structure is placed, HBM also runs 1.7's biome rule
for it (temperature, rain, and the height of the ground). Which structure spawns in a region is drawn from the weights in
`hbm.cfg`.

HBM's structure tags `hbm:ntm_structures` and `hbm:legacy_dungeons` (`tags/worldgen/structure/`) group its structures
for `/locate`.
