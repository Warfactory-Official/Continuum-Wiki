---
title: Press, shredder, centrifuge, acidizer, sawmill, rock mill
description: The press, shredder, centrifuge, crystallizer, sawmill and rock_mill tables.
sidebar:
  order: 14
---

Tables for machines that press, grind, separate or saw one item at a time.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:press` | Burner Press, Electric Press, Conveyor Press | own | first match in `order` | 48 |
| `hbm:shredder` | Shredder, Large Mining Drill, Mining Laser (shredder upgrade), shredder tool ability | own | input item; first recipe id wins | 330 |
| `hbm:centrifuge` | Centrifuge, Mining Laser (centrifuge upgrade), centrifuge tool ability | own | first match in `order` | 160 |
| `hbm:crystallizer` | Ore Acidizer, Mining Laser (crystallizer upgrade), crane partitioner, crystallizer tool ability | own | tank fluid, then item rows before tag rows | 332 |
| `hbm:sawmill` | Sawmill | own | first match in `order` | 5 |
| `hbm:rock_mill` | Rock Mill | [generic](../common-fields/#generic-schema) | selector, saves `name` | 11 |

## press

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `stamp` | stamp type | yes | | Which stamp the press needs. |
| `input` | [ingredient](../common-fields/#ingredients) | yes | | The pressed item. One item per operation; `count` is not used. |
| `output` | [item stack](../common-fields/#item-stacks) | yes | | The result, `item_data` allowed. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

Stamp types: `flat`, `plate`, `wire`, `circuit`, `c357`, `c44`, `c50`, `c9`, `printing1` to `printing8`. Any stamp
item of that type works; stamps of different materials with the same shape share a type.

```json title="data/hbm/recipe/press/casing_large.json (HBM)"
{
  "type": "hbm:press",
  "stamp": "c50",
  "input": { "ingredient": "#c:plates/gunmetal" },
  "output": { "id": "hbm:casing_large", "count": 2 },
  "order": 25
}
```

## shredder

| Field | Type | Required | Meaning |
|---|---|---|---|
| `input` | item id or `#tag` (string) | yes | What is shredded. A tag stands for each of its items. |
| `output` | item output (`"id"` or `{"id", "count"}`) | yes | What one item shreds into. |

```json title="data/hbm/recipe/shredder/bedrock_ore_base_actinide.json (HBM)"
{
  "type": "hbm:shredder",
  "input": "hbm:bedrock_ore_base_actinide",
  "output": "minecraft:gravel"
}
```

The shredder accepts **any** item. It builds its lookup as 1.7 did, and every entry is first-come, first-served:

1. the data rows, in recipe-id order (a tag row adds each of its items);
2. rules in code: logs to 4 sawdust, planks to 1 sawdust, saplings to a stick, wool to 4 string, terracotta to 4 clay
   balls, `c:dusts/lapis` to tiny cobalt powder;
3. the tag sweep, also code: for every material with a `c:dusts/<material>` item, its `c:ingots`, `c:plates` and
   `c:gems` items give 1 dust, `c:ores` and `c:raw_materials` 2, and `c:storage_blocks` 9 (4 if the material has no
   ingot or gem); other `c:dusts` give generic dust and `c:dusts_tiny` generic tiny dust;
4. anything else becomes `hbm:scrap`.

Because the data rows come first, a row of yours for an item that a rule would cover (another mod's ingot, say)
replaces the rule. For an item that HBM already has a row for, the row whose recipe id sorts first wins; remove HBM's
row to replace it. Bobbleheads are handled by code before any row.

## centrifuge

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [ingredient](../common-fields/#ingredients) | yes | | One item is processed at a time; `count` is ignored. |
| `outputs` | list of outputs (see below), up to 4 | yes | | The products of one item. |
| `requires` | list of strings | no | none | [Config conditions](../common-fields/#requires). |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

An output is one of:

- an item output, `"id"` or `{"id", "count"}`;
- `{"tag": "c:gems/certus_quartz", "count": 2}`: the first item of the tag (written without `#`);
- `{"scraps": {"material": "copper", "amount": 72}}`: a scrap item holding that much molten material.

A row whose tag output has no item is left out.

```json title="data/hbm/recipe/centrifuge/tag_ores_certus_quartz.json (HBM, shortened)"
{
  "type": "hbm:centrifuge",
  "input": { "ingredient": "#c:ores/certus_quartz" },
  "outputs": [
    { "tag": "c:gems/certus_quartz", "count": 2 },
    { "tag": "c:gems/certus_quartz", "count": 2 }
  ],
  "requires": ["#c:gems/certus_quartz"],
  "order": 132
}
```

LBSM's richer yields are second rows: `tag_ores_copper.lbsm_simple_centrifuge.json` with
`"requires": ["lbsm_simple_centrifuge"]` beside `tag_ores_copper.json` with `"!lbsm_simple_centrifuge"`.

## crystallizer

The Ore Acidizer. The fluid in the machine's tank chooses among rows with the same input.

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [ingredient](../common-fields/#ingredients) | yes | | `count` is the number of items one operation uses. |
| `acid` | [fluid stack](../common-fields/#fluid-stacks) | yes | | The fluid and mB per operation. |
| `output` | output (see below) | yes | | The product. |
| `duration` | int | yes | | Ticks per operation. |
| `productivity` | float | no | `0` | Carried for compatibility, not used by the machine. |
| `requires` | item tag id, **one string, no `#`** | no | none | The row counts only while this tag has an item. |
| `order` | int | no | after HBM's | See lookup below. |

`output` is an item output (`"id"` or `{"id", "count"}`), `{"tag", "count"}` (first item of the tag) or
`{"scraps": {"material", "amount"}}`, as for the centrifuge.

```json title="data/hbm/recipe/crystallizer/tag_ores_certus_quartz_peroxide.json (HBM)"
{
  "type": "hbm:crystallizer",
  "input": { "ingredient": "#c:ores/certus_quartz" },
  "acid": { "type": "hbm:peroxide", "amount": 500 },
  "output": { "tag": "c:gems/certus_quartz", "count": 12 },
  "duration": 600,
  "requires": "c:gems/certus_quartz",
  "order": 328
}
```

```json title="data/hbm/recipe/crystallizer/tag_ingots_malachite_sulfuric_acid.json (HBM)"
{
  "type": "hbm:crystallizer",
  "input": { "ingredient": "#c:ingots/malachite" },
  "acid": { "type": "hbm:sulfuric_acid", "amount": 250 },
  "output": { "scraps": { "material": "copper", "amount": 72 } },
  "duration": 300,
  "productivity": 0.1,
  "order": 22
}
```

**Lookup.** Among the rows for the tank's fluid that match the item, a row with a plain item input wins over any tag
row: the first such row in `order`. If only tag rows match, the **last** matching one in `order` is used (1.7 kept a
map). So a tag row of yours without `order` overrides HBM's tag rows for the same acid; an item row does not override
HBM's item row unless it has a lower `order`.

## sawmill

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `input` | [ingredient](../common-fields/#ingredients) | yes | | What is sawn. |
| `output` | [item stack](../common-fields/#item-stacks) | yes | | The result. With `crafting_result`, only what recipe viewers show. |
| `crafting_result` | object | no | none | Use the input's crafting-table result instead (below). |
| `sawdust_chance` | float | no | `0` | Chance of one sawdust in the side slot. |
| `hidden` | boolean | no | `false` | Leave the row out of recipe viewers. |
| `order` | int | no | after HBM's | The first matching row in `order` wins. |

`crafting_result` has `require` (an item tag, with `#`), `multiply` (default 1) and `divide` (default 1). The output is
whatever the input crafts into on a crafting table, if that result is in `require`, scaled by `multiply / divide`.
This is how 1.7 sawed a log into its own planks, six for every four, so modded logs make their own planks:

```json title="data/hbm/recipe/sawmill/logs.json (HBM)"
{
  "type": "hbm:sawmill",
  "input": { "ingredient": "#minecraft:logs" },
  "output": { "id": "minecraft:oak_planks", "count": 6 },
  "crafting_result": { "require": "#minecraft:planks", "multiply": 6, "divide": 4 },
  "sawdust_chance": 0.5,
  "order": 2
}
```

HBM's five rows are 1.7's sawmill logic: sticks and wooden rods to sawdust, logs to planks, planks to six sticks,
saplings to one stick.

## rock_mill

The generic schema with no extra fields. The player picks a row in the machine's selector (`order` is the
selector order), and the mill saves its `name`; `power` × 100 sizes its energy buffer. The machine has three item inputs, three item outputs, one input tank and one
output tank. HBM's rows crush cobblestone, gravel, sand, netherrack, soul sand and several HBM stones into weighted
mixes of gravel, sand and powders, with two plain rows for clay and colloid.

There are no generated files for this table in the build this page was written from. The row below is HBM's
`rock.cobble`, written out by hand from its Java source in the generic schema:

```json title="data/hbm/recipe/rock_mill/cobble.json (HBM, written out from source)"
{
  "type": "hbm:rock_mill",
  "name": "rock.cobble",
  "input_items": [{ "ingredient": "#c:cobblestones" }],
  "input_fluids": [{ "type": "minecraft:water", "amount": 250 }],
  "output_items": [
    [
      { "data": "minecraft:gravel", "weight": 95 },
      { "data": "hbm:powder_quartz", "weight": 5 }
    ]
  ],
  "output_fluids": [{ "type": "hbm:colloid", "amount": 250 }],
  "duration": 100,
  "power": 25,
  "icon": { "id": "minecraft:cobblestone" },
  "name_wrapper": "rock.crushing",
  "auto_switch_group": "autoswitch.crushing",
  "order": 0
}
```

The rows share the auto-switch group `autoswitch.crushing`, so a mill set to one of them switches to the row for
whatever you load.
