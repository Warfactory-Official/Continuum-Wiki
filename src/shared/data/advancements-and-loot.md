---
title: Advancements and loot
description: HBM's advancement criterion triggers and their conditions, its mob and structure loot tables, and the loot types it adds.
sidebar:
  order: 8
---

HBM's advancements are ordinary advancement files under `data/hbm/advancement/` (`advancements/` on 1.20.1), and a
datapack can replace or add to them as usual. Many 1.7 achievements fired on events vanilla's triggers cannot see, so
HBM adds its own criterion triggers. A datapack can use them in its own advancements.

## Criterion triggers

| Trigger | Fires when | `kinds` | `item` | `value` |
|---|---|---|---|---|
| `hbm:item_produced` | The player takes an item from a machine's output or makes it on an anvil. | | the item | |
| `hbm:radiation` | The player's radiation passes a threshold. | `poison` (200 RAD), `death` (1000 RAD) | | |
| `hbm:digamma` | The player's digamma changes. | | | the new digamma level |
| `hbm:detonation` | A blast or meltdown happens near the player. | `nuke`, `rbmk`, `zirnox`, `watz`, `refinery`, `fluid_tank`, `digamma_spear`, `nuclear_creeper`, `soyuz_exhaust` | | |
| `hbm:boss_killed` | A boss dies near the player. | `maskman`, `meltdown`, `worm`, `ufo` | | |
| `hbm:orbit` | A payload the player launched reaches orbit. | | the payload | |
| `hbm:satellite_action` | A satellite in orbit carries out the player's command. | | the satellite | |
| `hbm:particle_produced` | A particle accelerator collision makes a particle near the player. | | the particle | |
| `hbm:smoked` | The player finishes smoking an item. | | the item | |
| `hbm:consumed` | The player finishes drinking an HBM drink. | | the item | |
| `hbm:room_opened` | The player opens a red room keyhole. | | | |
| `hbm:bled_out` | The Ghost of Kauai-Moho's bleeding takes the player's last max health. | | | |
| `hbm:bolted` | The player is killed by a boltgun bolt. | | | |
| `hbm:dissolved` | An item dissolves in acid near the player. | | the item | |
| `hbm:crushed` | A falling boxcar crushes an entity near the player. | the crushed entity's type id | | |

Who counts as "near", and how far, follows 1.7 for each event.

### Conditions

Every HBM trigger takes the same optional `conditions`, on every Minecraft version:

| Field | Type | Meaning |
|---|---|---|
| `player` | entity predicate | Vanilla's player predicate. |
| `kinds` | list of strings | The event's kind must be one of these (see the table). |
| `item` | item predicate | The event's item must match. Write it with an `items` list, which every version reads. |
| `value` | number range | The event's number must lie in `{"min", "max"}`. |

```json title="data/mypack/advancement/near_miss.json"
{
  "parent": "hbm:root",
  "display": {
    "icon": { "id": "hbm:nuke_man" },
    "title": "Near Miss",
    "description": "Be near a nuclear blast"
  },
  "criteria": {
    "blast": {
      "trigger": "hbm:detonation",
      "conditions": { "kinds": ["nuke"] }
    }
  }
}
```

A condition on an item:

```json
"conditions": { "item": { "items": ["hbm:sat_foeq"] } }
```

The `display` and `icon` shapes are vanilla's and differ between versions (`{"item": ...}` on 1.20.1); the trigger
conditions do not.

## golemcore:requires

A loot condition that holds while every listed flag holds. It takes the same flags as recipes
([recipe flags](../../recipes/removing-recipes/#golemrequires)); prefix a flag with `!` to negate it. It is read at each
drop, so a config change applies at once.

| Field | Type | Meaning |
|---|---|---|
| `requires` | list of strings | Flags that must all hold. |

HBM uses it for raw ore drops: each ore's loot table has one pool for `raw_ores` and one for `!raw_ores`, so
`hbm.cfg` `1.90_enableRawOres` switches between raw ore items and 1.7's drops.

```json
{
  "condition": "golemcore:requires",
  "requires": ["!raw_ores"]
}
```

## Mob loot

The HBM mobs whose drops scale with Looting drop from ordinary entity loot tables, `data/hbm/loot_table/entities/<mob>.json`
(`loot_tables/` on 1.20.1). A datapack can replace a table at the same path. The defaults follow 1.7's formulas exactly,
except that a 1-in-3 chance is a `random_chance` of 0.33333334.

| Table | Drops |
|---|---|
| `entity_mob_gold_creeper` | Gold crystals: 5 to 10 + 2 × Looting from a player kill, otherwise 3 |
| `entity_mob_nuclear_creeper` | 0 to 2 TNT plus 0 to Looting more, a creeper coin one time in 3 |
| `entity_mob_phosgene_creeper`, `entity_mob_tainted_creeper` | 0 to 2 gunpowder or TNT plus 0 to Looting more |
| `entity_mob_volatile_creeper` | 2 to 4 sulfur, 1 or 2 dynamite sticks |
| `entity_fucc_a_ducc` (duck) | 0 to 2 feathers plus 0 to Looting more, a chicken (cooked when it burns) |
| `entity_pigeon` | 0 to 2 feathers plus 0 to Looting more |
| `entity_radiation_blaze` (radiation beast) | One polonium nugget per Looting level, from a player kill |
| `entity_taint_crab` | 0 to 2 copper coils plus 0 to Looting more; a magnetized tungsten coil from a player kill |
| `entity_tesla_crab` | A copper coil from a player kill |
| `entity_glyphid*` (nine tables) | Half the time, Looting + 2 meat (4 for the brenda and nuclear glyphid, 0 for the scout); grilled when it burns |

Every creeper table also drops a music disc when a skeleton kills the creeper, like vanilla's creeper. The crabs read
Looting only from a player, as 1.7 did, and their rare drop holds with chance (5 + Looting) / 200.

Some drops stay in code because no loot condition can see what decides them: the pigeon's chicken (three from a fat
pigeon, and fatness is not saved), the radiation beast's fuel rods (waste when the beast is wet), the mask man's drops,
and the behemoth's and brenda's glands.

### golemcore:looting

A number provider: `add + factor × Looting`, the Looting level of the entity that dealt the killing blow.

| Field | Type | Meaning |
|---|---|---|
| `factor` | integer, optional | Default 1. |
| `add` | integer, optional | Default 0. |
| `player_only` | boolean, optional | Count Looting only when the killer is a player. Default `false`. |

```json
{
  "function": "minecraft:set_count",
  "count": { "type": "minecraft:uniform", "min": 0, "max": { "type": "golemcore:looting" } },
  "add": true
}
```

## Structure loot

Containers and loot piles in HBM's structures draw from loot tables named after [item pools](../item-pools/):
`POOL_EXPENSIVE` is `hbm:chests/expensive`. HBM's 50 tables are made from its pool rows, one roll each. The structure
rolls the table as many times as 1.7 drew from the pool, and puts each stack into a random slot as 1.7 did, overwriting
what was there; a stack larger than its item's limit goes in as single items. Replace a table to change what a structure
holds. A pool with no table of that name (an addon's own pool) is drawn from directly.

### hbm:fill_fluid

A loot function that fills a fluid container the way an item pool row's `fluid` does: a cell becomes that fluid's cell, a
tank or canister is filled. `fluid` is HBM's upper-case fluid name.

```json
{ "function": "hbm:fill_fluid", "fluid": "DIESEL" }
```

HBM's additions to vanilla chests (dungeons, mineshafts) are added to vanilla's tables when they load, so a datapack that
replaces a vanilla chest loot table still gets HBM's extra items.
