---
title: Weapons and satellites
description: Custom nuke ingredients, by item and by fluid cell, and which items launch which satellite.
sidebar:
  order: 10
---

The [overview](../overview/) explains the file format.

## custom_nuke

The ingredients of the custom nuke (1.7's `TileEntityNukeCustom.registerBombItems`). Each ingredient adds to, or
multiplies, the strength of one stage of the bomb.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `type` | string | required | The stage: `tnt`, `nuke`, `hydro` (hydrogen), `amat` (antimatter), `dirty` (salted), `schrab` (schrabidium), `euph` (anti mass). |
| `value` | float | required | The amount added, or the factor. |
| `op` | string | `add` | `add` or `mult`. |

### By item

`data/hbm/value_maps/item/custom_nuke.json`. Registry: item. HBM ships 50 entries.

```json title="data/hbm/value_maps/item/custom_nuke.json (part)"
{
  "values": {
    "hbm:block_schrabidium": { "type": "schrab", "value": 50.0 },
    "hbm:block_waste": { "type": "dirty", "value": 1.25, "op": "mult" },
    "hbm:custom_amat": { "type": "amat", "value": 15.0 }
  }
}
```

### By fluid cell

`data/hbm/value_maps/fluid/custom_nuke.json`. Registry: fluid. Full fluid cells as ingredients, keyed by the fluid in
the cell. HBM ships 5 entries.

```json title="data/hbm/value_maps/fluid/custom_nuke.json (part)"
{
  "values": {
    "hbm:amat": { "type": "amat", "value": 5.0 },
    "hbm:aschrab": { "type": "schrab", "value": 15.0 }
  }
}
```

## satellite

`data/hbm/value_maps/item/satellite.json`. Registry: item. HBM ships 12 entries.

Value: a string, the satellite type the item puts into orbit. HBM's types are `mapper`, `scanner`, `radar`, `miner`,
`lunar_miner`, `precision_laser`, `laser`, `resonator`, `relay`, `detector`, `ray_scan`, `horizons` and `science`
(no HBM item launches `science`). Addons name
theirs `<namespace>:<name>`.

```json title="data/hbm/value_maps/item/satellite.json (part)"
{
  "values": {
    "hbm:satellite_spy": "mapper",
    "hbm:satellite_radar": "radar",
    "hbm:satellite_miner_astro": "miner",
    "hbm:sat_gerald": "horizons"
  }
}
```

The older `sat_*` chips (`hbm:sat_mapper` and others) have no entry and launch nothing, as in 1.7. The miners' cargo
comes from the [item pools](../../data/item-pools/) `POOL_SAT_MINER` and `POOL_SAT_LUNAR`.
