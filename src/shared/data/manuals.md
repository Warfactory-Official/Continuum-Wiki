---
title: In-game manuals
description: QMAW manual pages, the F1 help screens, and how a resource pack adds or replaces them.
sidebar:
  order: 7
---

Hovering an item that has a manual page shows `[ Press F1 for help ]` in its tooltip; F1 opens the page. These are 1.7's
QMAW pages (Quick Manual And Wiki). HBM ships about 260.

Manual pages are **client resources**, not datapack files. They live in a resource pack (or a mod's `assets/`) at:

```text
assets/<namespace>/manual/<any path>.json
```

Each player sees the pages their own resource packs provide; a server cannot send them. Pages are read again on every
resource reload (F3+T). The log line `[QMAW] Loaded N/M manual pages and indexed T trigger(s)` confirms the count.

## Page format

```json title="assets/mypack/manual/workshop_notes.json"
{
  "name": "Workshop Notes",
  "icon": ["minecraft:paper", 1, 0],
  "trigger": [
    ["minecraft:paper"],
    ["hbm:fluid_identifier_multi", 1, 32767]
  ],
  "title": {
    "en_us": "Workshop Notes"
  },
  "content": {
    "en_us": "Read the [[Fluid Identification|fluid identifier page]] first.<br><br>{{Fluid Identification}}"
  }
}
```

| Field | Type | Meaning |
|---|---|---|
| `name` | string | The page's name: what links and inserts refer to. Required. |
| `icon` | item stack | Optional. The item drawn beside the title. |
| `trigger` | list of item stacks | The items whose tooltip opens this page. |
| `title` | object | Title per language code (`en_us`, `ru_ru`, ...). |
| `content` | object | Text per language code. Required; a page without content is skipped. English is used when the player's language is missing. |

## Item stacks

Stacks are 1.7's lists: `[item id, count, metadata]`, with count and metadata optional.

- A metadata of `32767` is a wildcard: every stack of that item triggers the page. Where a 1.7 item with variants is
  several items here, the wildcard covers all of them.
- For fluid items (fluid identifiers, fluid icons) the third entry can be a fluid id instead: `["hbm:fluid_identifier_multi", 1, "minecraft:water"]`.
- Without a wildcard, a trigger matches only the exact item with the same data, so name the plain item for most pages.

When several pages claim one item, an exact trigger wins over a wildcard. A trigger that names an unknown item is
skipped with a warning (`[QMAW] Skipping unresolved trigger`).

## Text markup

| Markup | Effect |
|---|---|
| `<br>` | A line break. `<br><br>` starts a new paragraph. |
| `[[Page]]` | A link to the page with that `name`. |
| `[[Page\|text]]` | A link to `Page` shown as `text`. HBM's own pages write it the other way round (`[[text\|Page]]`); both work. |
| `{{Page}}` | Inserts that page's content in place. |

## Changing HBM's pages

Put your version at the **same path** as HBM's file (`assets/hbm/manual/concepts/fluidid.json`, say) in a resource pack:
the higher pack wins and the page is replaced as a whole. A page in another file with the same `name` also replaces it,
but only if its file comes later in id order (namespace, then path), so the same-path way is the reliable one. HBM's
pages are in the mod jar under `assets/hbm/manual/` (open it as a zip) and are the best examples. To add a translation, copy the page
and add your language to `title` and `content`.
