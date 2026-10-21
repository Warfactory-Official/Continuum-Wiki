---
title: Your first addon mod
description: "A walkthrough from an empty project to a running addon mod with one block, a crafting recipe, an assembly machine recipe and a hook."
sidebar:
  order: 3
---

This page builds the smallest useful addon mod: one block, a crafting recipe and an assembly machine recipe for it, and
a hook that logs when the assembly machine makes it. It runs on all six nodes. Each step links to the page that covers
the topic in full.

It assumes the build from [Project setup](../project-setup/) is in place, with mod id `myaddon`, Java package
`com.example.myaddon`, and the generated-data script left out (this addon has no `src/recipes`).

## The files

```text
my-addon/
  gradle/
    dejson-classes.txt
    dejson-authored.txt
  src/main/java/com/example/myaddon/
    MyAddon.java
    MyAddonEntry.java
    registry/MyBlocks.java
    recipe/MyCraftingRecipes.java
    platform/neoforge/NeoForgeInit.java
    platform/forge/ForgeInit.java
  src/main/resources/
    fabric.mod.json
    pack.mcmeta
    META-INF/neoforge.mods.toml
    META-INF/mods.toml
    assets/myaddon/lang/en_us.json
    assets/myaddon/textures/blocks/example_block.png
    data/myaddon/recipe/assembly_machine/example_block.json
```

The metadata files and `pack.mcmeta` are the ones on [Project setup](../project-setup/#mod-metadata), with the class
names below.

## 1. Constants

```java title="com/example/myaddon/MyAddon.java"
package com.example.myaddon;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class MyAddon {

    public static final String MOD_ID = "myaddon";
    public static final Logger LOG = LoggerFactory.getLogger("My Addon");

    private MyAddon() {}
}
```

## 2. A block

A registration class owns its registers and a `Registrar` over them. One chain registers the block and states its model,
blockstate, loot table and mining tag; a second registers its item and lists it in HBM's Blocks tab.

```java title="com/example/myaddon/registry/MyBlocks.java"
package com.example.myaddon.registry;

import com.example.myaddon.MyAddon;
import com.hbm.creativetabs.HbmTab;
import com.hbm.registration.Presets;
import dev.golem.core.registry.BlockTag;
import dev.golem.core.registry.DeferredRegister;
import dev.golem.core.registry.Loot;
import dev.golem.core.registry.Registrar;
import dev.golem.core.registry.RegistryObject;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;

public final class MyBlocks {

    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(MyAddon.MOD_ID);
    public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(MyAddon.MOD_ID);
    private static final Registrar REG = Registrar.of(BLOCKS, ITEMS);

    public static final RegistryObject<Block> EXAMPLE_BLOCK = REG.simpleBlock("example_block",
                    p -> p.strength(5.0F, 10.0F).sound(SoundType.METAL).requiresCorrectToolForDrops())
            .transform(Presets.cubeAll()).loot(Loot.self()).tag(BlockTag.PICKAXE);
    public static final RegistryObject<BlockItem> EXAMPLE_BLOCK_ITEM = REG.blockItem(EXAMPLE_BLOCK).tab(HbmTab.BLOCKS);

    private MyBlocks() {}

    public static void init() {}
}
```

`Presets.cubeAll()` uses the texture `myaddon:blocks/example_block`, so put a 16x16 PNG at
`assets/myaddon/textures/blocks/example_block.png`. HBM's atlas files already include every namespace's
`textures/blocks/` and `textures/items/` folders. Name the block in the lang file:

```json title="assets/myaddon/lang/en_us.json"
{
  "block.myaddon.example_block": "Example Block"
}
```

The static initialiser above follows the [plain-JVM rule](../registering-content/#the-plain-jvm-rule): `SoundType.METAL`
is read inside the properties lambda, never at class load.

## 3. A crafting recipe

Crafting recipes are Dejson declarations in a class with a static `declare()`. It runs in a plain JVM at build time, so
it names items by string id.

```java title="com/example/myaddon/recipe/MyCraftingRecipes.java"
package com.example.myaddon.recipe;

import static dev.golem.core.dejson.Crafting.rows;
import static dev.golem.core.dejson.Crafting.shaped;

public final class MyCraftingRecipes {

    private static final String NS = "myaddon";

    private MyCraftingRecipes() {}

    public static void declare() {
        shaped(NS, "example_block", "myaddon:example_block", rows("##", "##"), "#", "hbm:plate_steel");
    }
}
```

This writes `data/myaddon/recipe/example_block.json`. List both classes for Dejson:

```text title="gradle/dejson-classes.txt"
com.example.myaddon.registry.MyBlocks
com.example.myaddon.recipe.MyCraftingRecipes
```

## 4. An assembly machine recipe

A few machine recipes can be plain JSON files. The format is the one datapacks use; see
[Assembly machines](../recipes/assembly-machine/) and [common fields](../recipes/common-fields/).

```json title="data/myaddon/recipe/assembly_machine/example_block.json"
{
  "type": "hbm:assembly_machine",
  "name": "ass.example_block",
  "input_items": [
    { "ingredient": "#c:ingots/steel", "count": 4 }
  ],
  "output_items": [
    { "id": "myaddon:example_block", "count": 2 }
  ],
  "duration": 100,
  "power": 100
}
```

`data/<ns>/recipe/` is a folder Dejson owns, so an authored file there fails the `dejsonOwnership` check unless it is
listed:

```text title="gradle/dejson-authored.txt"
data/myaddon/recipe/assembly_machine/
```

For a table's worth of rows, write them in Java instead: see [Recipes and data](../recipes-and-data/#writing-rows-in-java).

## 5. A hook and the entry

`MyAddonEntry` is the mod's start-up. `declare()` loads the registration class and registers a listener on HBM's
`MACHINE_RECIPE_COMPLETED` hook, which fires on the server when a recipe-module machine finishes an operation.

```java title="com/example/myaddon/MyAddonEntry.java"
package com.example.myaddon;

import com.example.myaddon.registry.MyBlocks;
import com.hbm.api.event.HbmEvents;
import dev.golem.core.platform.ModEntry;

public final class MyAddonEntry implements ModEntry {

    @Override
    public void declare() {
        MyBlocks.init();
        HbmEvents.MACHINE_RECIPE_COMPLETED.register(event -> {
            if (event.recipe().equals("ass.example_block")) {
                MyAddon.LOG.info("Example block made at {} by {}", event.pos(), event.machine());
            }
        });
    }
}
```

`MyCraftingRecipes` is not called here: it only runs at build time. See [Hooks](../hooks/) for every hook and how
listeners are ordered.

## 6. Loader glue

NeoForge and Forge start the entry from the `@Mod` constructor. Fabric lists it under the `golemcore:entry`
entrypoint in `fabric.mod.json` (`"golemcore:entry": ["com.example.myaddon.MyAddonEntry"]`) and needs no class.

```java title="com/example/myaddon/platform/neoforge/NeoForgeInit.java"
package com.example.myaddon.platform.neoforge;

//? if neoforge {
import com.example.myaddon.MyAddon;
import com.example.myaddon.MyAddonEntry;
import dev.golem.core.platform.ModEntries;
import net.neoforged.fml.common.Mod;

@Mod(MyAddon.MOD_ID)
public final class NeoForgeInit {

    public NeoForgeInit() {
        ModEntries.start(new MyAddonEntry());
    }
}
//?}
```

```java title="com/example/myaddon/platform/forge/ForgeInit.java"
package com.example.myaddon.platform.forge;

//? if forge {
/*import com.example.myaddon.MyAddon;
import com.example.myaddon.MyAddonEntry;
import dev.golem.core.platform.ModEntries;
import net.minecraftforge.fml.common.Mod;

@Mod(MyAddon.MOD_ID)
public final class ForgeInit {

    public ForgeInit() {
        ModEntries.start(new MyAddonEntry());
    }
}
*///?}
```

The Forge file is written commented out because the active node is 26.1 NeoForge; Stonecutter un-comments it on the
1.20.1 Forge node. Each loader buildscript excludes the other loaders' `platform` packages. See
[Mod entry](../mod-entry/) for what each loader does with the phases.

## 7. Build and run

```bash
./gradlew :26.1-neoforge:dejsonVerify     # every declared texture exists
./gradlew :26.1-neoforge:runClient
./gradlew chiseledBuild                   # all six nodes
```

Check for positive signals, not just a clean start:

- In a creative world, the Example Block is in HBM's Blocks tab, shows its texture and drops itself when mined with a
  pickaxe.
- The crafting recipe and the assembly machine recipe show in the recipe viewer (JEI or REI).
- Run an assembly machine on the recipe; the log shows `Example block made at ...`.

Then try the client of at least one Fabric node and the 1.20.1 Forge node (`:1.21.1-fabric:runClient`,
`:1.20.1-forge:runClient`): models and recipes are converted per node, and only a client shows a missing model. For
automated checks, see [Testing](../testing/).

## Where to go next

- More kinds of content (block entities, menus, entities, sounds): [Registering content](../registering-content/).
- Changing an HBM block: [Substitution](../substitution/).
- Your own machine recipe table, or rows written in Java: [Recipes and data](../recipes-and-data/).
- Fluids, and connecting a machine to ducts and cables: [Fluids and networks](../fluids-and-networks/).
