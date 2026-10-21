---
title: Chemical plant and mixer
description: The chemical_plant table (Chemical Plant, Chemical Factory) and the mixer table.
sidebar:
  order: 11
---

The chemical plant and mixer tables. Both use the generic schema, but the mixer reads only part of it.

| Type | Machines | Schema | Picked by | Rows in HBM |
|---|---|---|---|---|
| `hbm:chemical_plant` | Chemical Plant, Chemical Factory | [generic](../common-fields/#generic-schema) | selector, saves `name` | 87 |
| `hbm:mixer` | Mixer | [generic](../common-fields/#generic-schema) | output fluid (identifier), then `order` | 50 |

## chemical_plant

The generic schema with no extra fields. The recipe is picked in the machine's selector (`order` is the selector
order), and the machine saves its `name`.

```json title="data/hbm/recipe/chemical_plant/deshcracked.json (HBM)"
{
  "type": "hbm:chemical_plant",
  "name": "chem.deshcracked",
  "input_items": [{ "ingredient": "hbm:powder_desh_mix" }],
  "input_fluids": [
    { "type": "hbm:lightoil_crack", "amount": 500, "pressure": 1 },
    { "type": "hbm:mercury", "amount": 100 }
  ],
  "output_items": ["hbm:ingot_desh"],
  "duration": 100,
  "power": 100,
  "custom_localization": true,
  "order": 36,
  "requires": ["!lbsm_simple_chemistry"]
}
```

Notes:

- `custom_localization: true` shows the translation of `name` (`chem.deshcracked`) as the title instead of the icon's
  item name. A fluid-only recipe usually also sets an `icon`, for example a full gas tank of the product:
  `"icon": {"id": "hbm:gas_full", "item_data": {"fluid": "hbm:oxygen", "fluid_amount": 1000}}`.
- Fluid `pressure` means the input tank needs the fluid at that pressure level.
- Several rows come in two variants under one `name`: `bakelite.json` with `"!enable_528_pressurized"` and
  `bakelite.enable_528_pressurized.json` with `"enable_528_pressurized"` (pressurised inputs in 528 mode). LBSM's
  simplified chemistry works the same way with `lbsm_simple_chemistry`.

## mixer

```json title="data/hbm/recipe/mixer/alumina.0.json (HBM)"
{
  "type": "hbm:mixer",
  "name": "mixer.alumina.0",
  "input_items": [{ "ingredient": "#c:dusts/fluorite", "count": 3 }],
  "input_fluids": [{ "type": "hbm:sodium_aluminate", "amount": 150 }],
  "output_fluids": [{ "type": "hbm:alumina", "amount": 200 }],
  "duration": 40,
  "order": 46
}
```

The generic schema, but the mixer reads only part of it:

| Field | Used as |
|---|---|
| `input_items` | The first entry is the item input (optional). |
| `input_fluids` | The first two entries are the two fluid inputs (both optional). |
| `output_fluids` | The first entry is the product. Rows without an output fluid are ignored. |
| `duration` | Ticks per operation. |
| `name` | What the mixer saves for the selected recipe. |

`power`, `output_items` and the other generic fields are ignored: the mixer's energy use is its own (50 HE/t,
changed by upgrades).

How the mixer picks a row: the fluid identifier in the machine sets the **output fluid**; the mixer then uses that
fluid's rows, in `order`, and its button cycles through them. HBM names the rows `mixer.<output>.<n>`, so a fluid with
two ways to make it has `mixer.alumina.0` and `mixer.alumina.1`. To add another way to make a fluid, add a row with that
output fluid and a new name; it appears as one more choice for that fluid.
