---
title: Item pools
description: HBM's weighted item pools for structure loot, supply drops, vending machines and mining satellites.
sidebar:
  order: 4
---

An item pool is a weighted list of items that HBM draws loot from. These are 1.7's `ItemPool` tables, drawn from by name.
Structures draw through a loot table made from each pool instead (see [Structure loot](../advancements-and-loot/#structure-loot)),
so an edit to a pool file reaches supply drops, vending machines, satellites and keyholes, while structure loot is changed
in its `hbm:chests/<pool>` loot table. (HBM's additions to vanilla chests, such as dungeon and mineshaft chests, are a
separate system and are not pools.)

## Where pools are used

| Pools | Used by |
|---|---|
| `POOL_SUPPLIES`, `POOL_WEAPONS`, `POOL_AMMO` | Supply drops from the C-130 |
| `POOL_SNACKS`, `POOL_SODA` | Vending machines |
| `POOL_SAT_MINER`, `POOL_SAT_LUNAR` | Mining satellite cargo (the asteroid and lunar miners) |
| `POOL_METEORITE_TREASURE` | Meteorite treasure blocks |
| `POOL_RED_PEDESTAL`, `POOL_BLACK_PART`, `POOL_BLACK_SLAB` | The red room keyhole pedestals |
| `POOL_VAULT_*`, `POOL_BLUEPRINTS` | Safes and dungeon chests in HBM's world generation (through their loot tables) |
| `POOL_FILING_CABINET`, `POOL_OFFICE_TRASH`, `POOL_MACHINE_PARTS`, `POOL_NUKE_*`, `POOL_SILO`, `POOL_VERTIBIRD`, `POOL_SPACESHIP`, `POOL_ANTENNA`, `POOL_SOLID_FUEL`, `POOL_EXPENSIVE`, `POOL_GENERIC` | Containers in HBM's structures (bunker, silo, offices, desert atom sites and others), through their loot tables |
| `POOL_PILE_*` | Loose loot piles placed in structures, through their loot tables |
| `POOL_LAUNCH_KEY`, `POOL_REPAIR_MATERIALS`, `POOL_RTG`, `POOL_OIL_RIG`, `POOL_METEOR_SAFE` | Loot blocks inside HBM's NBT structures, which name their pool; through its loot table |

HBM ships 50 pools. Their files, with every row, are in the NTM - Continuum jar under `data/hbm/item_pool/`.

## File format

```
data/<ns>/item_pool/<pool>.json
```

The pool's name is the file name in upper case: `pool_sat_miner.json` is `POOL_SAT_MINER`. The namespace does not
matter for the name, so a file in your own namespace adds to HBM's pool of the same name.

```json title="data/hbm/item_pool/pool_expensive.json (three rows)"
{
  "entries": [
    { "item": "hbm:canister_full", "min": 1, "max": 2, "weight": 2, "fluid": "DIESEL" },
    { "item": "hbm:gas_mask_m65", "min": 1, "max": 1, "weight": 5, "components": { "minecraft:damage": 60 } },
    { "item": "hbm:canister_full", "min": 1, "max": 2, "weight": 3, "fluid": "BIOFUEL" }
  ]
}
```

| Field | Type | Meaning |
|---|---|---|
| `replace` | boolean, optional | `true` drops every row that came before this file (see merging). Default `false`. |
| `entries` | list | The rows. |

Each row:

| Field | Type | Meaning |
|---|---|---|
| `item` | item id, optional | The item. Without it, the row is an empty draw: it keeps its weight but gives nothing. |
| `min`, `max` | integers, required | The count is rolled between them, both included. |
| `weight` | integer, required | The row's chance relative to the pool's total weight. |
| `fluid` | string, optional | Fills a fluid container item (`hbm:canister_full`, `hbm:cell` and the portable fluid tanks) with this fluid. It is HBM's upper-case fluid name (`DIESEL`, `BIOFUEL`), not the `hbm:diesel` id. |
| `components` | object, optional | Item components, as in a vanilla item stack. On 1.20.1, which has no components, a row whose components do not decode falls back to the bare item. |

A row naming an item that does not exist is skipped. A row naming a fluid the item cannot hold is skipped with a
warning.

## Merging

Every pack's copy of a pool file is read. Rows are merged in this order:

1. Files in the `hbm` namespace first, then every other namespace in id order.
2. For one file id, every pack's copy, lowest priority first.

A file with `"replace": true` removes every row merged before it, then adds its own. A file name no pool uses
creates a new pool, which only matters if something draws from it by name.

To add gas masks (one or two per draw) to the supply drop pool:

```json title="data/mypack/item_pool/pool_supplies.json"
{
  "entries": [
    { "item": "hbm:gas_mask_m65", "min": 1, "max": 2, "weight": 5 }
  ]
}
```

To replace a pool, use `"replace": true` in your own namespace's file. Because other namespaces merge after `hbm`, it
drops HBM's rows:

```json title="data/mypack/item_pool/pool_soda.json"
{
  "replace": true,
  "entries": [
    { "item": "minecraft:honey_bottle", "min": 1, "max": 1, "weight": 1 }
  ]
}
```

Pools reload with `/reload` and are sent to clients (JEI's satellite page shows the miner pools).
