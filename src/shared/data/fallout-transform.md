---
title: Fallout transform
description: The rules that decide what nuclear fallout turns each block into, and how to add or replace them.
sidebar:
  order: 3
---

After a nuclear blast, fallout rain sweeps outward from ground zero and converts blocks: logs become dead logs, leaves
fall, ores near the centre turn into sellafite ores, and so on. The conversion rules are 1.7's `hbmFallout.json`,
read from a datapack folder:

```
data/<ns>/fallout_transform/<name>.json
```

HBM's defaults are `data/hbm/fallout_transform/default.json` (148 rules, priority 0).

## File format

```json title="data/hbm/fallout_transform/default.json (two rules)"
{
  "priority": 0,
  "entries": [
    {
      "tag": "minecraft:logs",
      "primary": [{ "state": "hbm:waste_log[axis=y]" }],
      "max": 65.0
    },
    {
      "block": "minecraft:coal_ore",
      "primary": [
        { "state": "hbm:ore_sellafield_diamond[shade=9]", "weight": 3 },
        { "state": "hbm:ore_sellafield_emerald[shade=9]", "weight": 2 }
      ],
      "primary_chance": 0.5,
      "max": 5.0,
      "solid": true
    }
  ]
}
```

`priority` (integer, default 0) orders the files. `entries` is the list of rules.

### Rule fields

A rule matches a block, and then picks the block it becomes.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `state` | block state string | none | Matches this exact state, e.g. `"minecraft:oak_log[axis=y]"`. |
| `block` | block id | none | Matches any state of this block. |
| `tag` | block tag id, without `#` | none | Matches blocks in this tag. |
| `preset` | string | none | Matches a named predicate (see below). |
| `opaque` | boolean | `false` | Also requires the block to be a full opaque block. |
| `primary` | list of outcomes | empty | Weighted outcomes, used with probability `primary_chance`. |
| `secondary` | list of outcomes | empty | Weighted outcomes, used otherwise. |
| `primary_chance` | double | `1.0` | Chance (0 to 1) to pick from `primary` instead of `secondary`. |
| `min` | double | `0.0` | The rule applies from this distance on, in percent of the fallout radius. |
| `max` | double | `100.0` | The rule applies up to this distance, in percent of the fallout radius. |
| `falloff_start` | double | `0.9` | Past `max × falloff_start` the rule is skipped more and more often, so the edge is ragged. |
| `solid` | boolean | `false` | A conversion by this rule counts toward the column's depth limit. |
| `preserve_axis` | boolean | `false` | Keeps the `axis` of the original block (for logs and pillars). |

Every matcher a rule gives must match. A rule with no matcher matches every block in its distance range.

An outcome is `{"state": "<block state>", "weight": <int>}`; `weight` defaults to 1. `"state": "minecraft:air"`
removes the block. A block removed while it was waterlogged (seagrass, for example) leaves its water instead of air.
If the chosen list (`primary` or `secondary`) is empty, the rule does nothing for that block and the next rule is
tried.

### Presets

| Preset | Matches |
|---|---|
| `hbm:ignited_by_lava` | Blocks lava can set on fire (1.7's wood material). |
| `hbm:vegetation` | Plants, vines and sugar cane. |
| `hbm:solid_terrain` | Opaque blocks mined with a pickaxe or shovel, except ice, snow, the redstone lamp, grass blocks and mycelium (1.7's rock, iron, sand and ground materials). |
| `hbm:grass_like` | Grass blocks and mycelium. |

Addons can register more presets.

## How rules are evaluated

The sweep walks each column of blocks from the surface down. For each block it tries the rules in order, and the
first rule that returns a block wins. A column stops after three conversions by `solid` rules.

The order is: files sorted by `priority`, highest first, then by file id; inside a file, the order of `entries`.

Some limits are fixed in code, as in 1.7:

- Sellafite ores and slaked sellafite only ever convert to a higher `shade`, never back.
- Sellafite bedrock never converts into anything else.
- The lowest block of the world only converts to sellafite bedrock.

## Adding rules

Put your rules in your own namespace with a priority above 0, so they are tried before HBM's:

```json title="data/mypack/fallout_transform/glass.json"
{
  "priority": 10,
  "entries": [
    {
      "tag": "minecraft:impermeable",
      "primary": [{ "state": "minecraft:air" }],
      "max": 40.0
    }
  ]
}
```

Only the highest-priority pack's copy of a given file id is read. A file at `data/hbm/fallout_transform/default.json`
replaces HBM's whole table, so only do that when you mean to rewrite every rule.

Fallout rules are reloaded with `/reload`. A file that fails to parse is skipped with
`Fallout transform file <id> is broken, skipping it` in the log.
