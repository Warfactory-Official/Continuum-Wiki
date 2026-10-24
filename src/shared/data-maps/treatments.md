---
title: Consumable treatments
description: What pills, syringes, RadAway, drinks and foods do when used, and how to give any item a treatment.
sidebar:
  order: 5
---

`data/hbm/value_maps/item/consumable_treatment.json`. Registry: item. HBM ships 92 entries.

A treatment is what happens when an item is eaten, drunk, used or injected: Rad-X's protection, RadAway's radiation
cleanse, a syringe's effects, a can's ring pull. Each entry is an ordered list of actions. HBM's pills, syringes, IV bags,
canteen, drinks, cigarettes and effect foods all take their treatment from this map, and a datapack can change theirs or
give one to any item, including vanilla food and other mods' items. The [overview](../overview/) explains the file
format; to change HBM's own entries from a pack or another mod, use a
[patch](../overview/#patching-another-mods-map).

## Value

| Field | Type | Default | Meaning |
|---|---|---|---|
| `triggers` | list | `["consume"]` | When it runs. `consume`: after the item is eaten or drunk. `use`: on right-click, instead of the item's own use. `hit`: when the item hits an entity in melee; only HBM's syringes can do this, and the hit entity is treated. |
| `block_when_potion_sick` | boolean | `false` | Potion sickness stops the treatment. For eaten items it stops the eating from starting. |
| `actions` | list | required | The actions, run in order on the server. |

An entry replaces the item's whole treatment: to change one action of HBM's, copy the entry and edit it. `remove` takes an
item's treatment away.

Effects, counters, health, damage, fire and motion act on the **target**: the player eating or using the item, or the
entity a syringe hits. Item and experience actions act on the **user**, the player holding the item.

## Actions

Every action has a `type` and these optional fields:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `chance` | number 0 to 1 | `1` | The action runs with this chance. |
| `survival_only` | boolean | `false` | Skipped when the user is in creative mode. |

| `type` | Fields | Does |
|---|---|---|
| `counter` | `counter` (`radiation`, `digamma`, `asbestos`, `black_lung`, `contagion`), `operation` (`add`, `set`, `min`, `max`; default `add`), `amount` (default 0), `limit_divisor` (optional) | Changes one of HBM's counters. `add` adds (negative to remove); radiation stays between 0 and 2500, and asbestos and black lung deal their damage at their maximum. `set` replaces the value; `min` lowers it to at most `amount`; `max` raises it to at least `amount`. With `limit_divisor` (asbestos and black lung), the amount is that disease's maximum divided by it. |
| `effect` | `effect` (id), `duration` (ticks), `amplifier` (default 0), `extend` (default `false`) | Adds a mob effect. `extend` adds the time left on an active one, as RadAway stacks. |
| `remove_effects` | `effects` (list of ids) | Removes those effects. |
| `clear_effects` | none | Removes every effect. |
| `damage` | `sources` (list of damage type ids), `amount`, `repeat` (default 1), `other_sources` (optional) | Deals `repeat` hits of `amount`, each of a type picked at random from `sources`. When a syringe hits someone else and `other_sources` is given, those types are used instead, credited to the user. |
| `heal` | `amount` | Heals. |
| `restore_health` | none | Sets health to the maximum. |
| `drain_health` | `amount` | Takes health past armor; the target dies at 0. |
| `potion_sickness` | `seconds` | Adds potion sickness, by `hbm.cfg` `8.S0_potionSickness`: none by default, these seconds, or twelve times them. |
| `sound` | `sound` (id), `volume` (default 1), `pitch` (default 1) | Plays a sound at the target. |
| `consume_item` | `remainder` (item id, optional) | Uses up one of the item and leaves the remainder (an empty syringe, can or bag) in the hand, the inventory or on the ground. For food that was already eaten, only the remainder is given. |
| `give_item` | `item`, `count` (default 1), `drop_if_full` (default `true`) | Gives the user an item; drops what does not fit, or loses it with `drop_if_full: false`. |
| `ignite` | `seconds` | Sets the target on fire. |
| `motion` | `x`, `y`, `z` (each optional) | Sets the target's velocity on the axes given. |
| `experience` | `amount` | Adds experience points to the user, or takes them away (negative), never below 0. |

## Examples

Make apples cure a little radiation, and a stick a bandage:

```json title="data/mypack/value_maps/patches/hbm/item/consumable_treatment.json"
{
  "values": {
    "minecraft:apple": {
      "block_when_potion_sick": true,
      "actions": [
        { "type": "potion_sickness", "seconds": 5 },
        { "type": "counter", "counter": "radiation", "amount": -10 },
        { "type": "effect", "effect": "minecraft:regeneration", "duration": 100 }
      ]
    },
    "minecraft:stick": {
      "triggers": ["use"],
      "actions": [
        { "type": "heal", "amount": 4 },
        { "type": "sound", "sound": "hbm:item.syringe" },
        { "type": "consume_item", "remainder": "minecraft:bowl" }
      ]
    }
  }
}
```

Halve Rad-X's protection, and make the red pill do nothing:

```json title="data/mypack/value_maps/patches/hbm/item/consumable_treatment.json"
{
  "values": {
    "hbm:radx": {
      "block_when_potion_sick": true,
      "actions": [
        { "type": "potion_sickness", "seconds": 5 },
        { "type": "effect", "effect": "hbm:radx", "duration": 1800 }
      ]
    }
  },
  "remove": ["hbm:pill_red"]
}
```

## HBM's treatments

Effects are written `id duration/amplifier`, in ticks; `sickness 5s` is a `potion_sickness` action.

| Item | Trigger | Blocked when sick | Actions |
|---|---|---|---|
| `radx` | consume | yes | sickness 5s; hbm:radx 3600/0 |
| `siox` | consume | yes | sickness 5s; asbestos set 0; black lung at most max/5 |
| `pill_herbal` | consume | yes | sickness 5s; asbestos set 0; black lung at most max/5; radiation -100; nausea 200/0; weakness 12000/2; mining fatigue 12000/2; poison 100/2; hbm:potionsickness 12000/0 |
| `xanax` | consume | yes | sickness 5s; digamma -0.5 |
| `fmn` | consume | yes | sickness 5s; digamma at most 2; blindness 60/0 |
| `five_htp` | consume | yes | sickness 5s; digamma set 0; hbm:stability 12000/0 |
| `pill_iodine` | consume | yes | sickness 5s; removes 9 effects |
| `plan_c` | consume | yes | sickness 5s; 10 hits of 1000 damage |
| `pill_red` | consume | yes | sickness 5s; hbm:death 72000/0 |
| `chocolate` | consume | yes | sickness 5s; 1 in 25: 1000 overdose damage; haste, speed, jump boost 1200/3 |
| `canteen_vodka` | consume | yes | nausea 200/0; strength 600/2; sickness 5s |
| `syringe_antidote` | use, hit | yes | clears effects; empty syringe back; sickness 5s |
| `syringe_awesome` | use, hit | yes | eleven strong effects for 1000 ticks; empty syringe back; sickness 5s |
| `syringe_poison` | use, hit | | empty syringe back; 30 damage |
| `syringe_metal_stimpak` | use, hit | yes | heal 5; sickness 5s; empty syringe back |
| `syringe_metal_medx` | use, hit | yes | resistance 4800/2; sickness 5s |
| `syringe_metal_psycho` | use, hit | yes | resistance and strength 2400/0; sickness 5s |
| `syringe_metal_super` | use, hit | yes | heal 25; slowness 200/0; sickness 15s |
| `med_bag` | use | yes | full health; removes 9 effects; sickness 15s; used up |
| `syringe_taint` | use, hit | | hbm:taint 1200/0; nausea 100/0; empty syringe and a bottle back |
| `cbt_device` | use | | hbm:bang 30/0; used up |
| `syringe_mkunicorn` | hit | | contagion set 216000; used up |
| `euphemium_stopper` | use | | weakness, slowness, mining fatigue 600/9 |
| `radaway`, `radaway_strong`, `radaway_flush` | use | | hbm:radaway 140, 350 or 500 ticks, stacking; empty IV bag back |
| `iv_empty`, `iv_blood` | use | | draw 5 health into a blood bag; a blood bag heals 5 |
| `iv_xp_empty`, `iv_xp` | use | | draw 100 experience into a bag; the bag gives it back |
| `can_*` (9 drinks) | consume | yes | effects for 600 ticks or more; sickness 5s; empty can and ring pull (survival only) |
| `bottle_*`, `bottle2_*` (7 drinks) | consume | yes | heal, effects, some radiation; sickness 5s; empty bottle and cap (survival only) |
| `coffee`, `coffee_radium`, `chocolate_milk` | consume | yes | heal 10 and speed (coffee); +500 radiation (radium coffee); sickness 5s |
| `apple_lead`, `apple_lead_ingot`, `apple_lead_block` | consume | | lead poisoning, or 500 lead damage for the block |
| `apple_schrabidium*`, `apple_euphemium` | consume | | strong effects; the block and euphemium apples last forever |
| `cotton_candy`, `mucho_mango`, `schnitzel_vegan`, `tem_flakes*` | consume | | effects; the vegan schnitzel also burns and launches you |
| `canned_conserve_*` (27 cans) | consume | | a can key; the fist can 2 damage; the recursion can, 9 in 10, another recursion can |
| `cigarette` | consume | | black lung and asbestos +2000; radiation +100; cough |
| `crackpipe` | consume | | black lung +500; nausea 200/0; heal 10; cough |
| `bdcl` | consume | | a groan |

The full entries are in the NTM - Continuum jar at `data/hbm/value_maps/item/consumable_treatment.json`.

Some behaviour stays in the items' code, beside the treatment: the jetpack fuel tank, the canteen's cooldown, the IV bags'
checks (only a real player; at least 100 experience), the bottle opener the bottles need, and the foods with world
effects (the bomb waffle, the black-hole can's vortex, the chocolate milk's blast, the pancake and the shield flask).
