---
title: Recipes and data
description: "Declaring your own machine recipe tables, writing recipe rows and other data in Java, and generating them into datapack files at build time."
sidebar:
  order: 6
---

Every HBM machine table is a vanilla recipe type whose rows are datapack files under `data/<ns>/recipe/<table>/`. The
JSON schema is documented under [Machine recipes](../recipes/overview/). This page covers the Java side: declaring a
table of your own, and writing rows (yours, or for HBM's tables) in Java so the build generates the files.

## Declaring a recipe table

Golem Core's `dev.golem.core.world.RecipeTables` registers the recipe type and serializer for you:

```java
public static <T> RecipeTables.Table<T> table(String namespace, String name, Supplier<MapCodec<T>> codec)
```

Call it once, at mod construction (from `declare()`). The table's id is `<namespace>:<name>`, which is also the recipe
JSON's `"type"`. Rows go in `data/<any ns>/recipe/<any subfolder>/`.

| `Table<T>` member | Does |
|---|---|
| `id()` | `<namespace>:<name>` |
| `entries()` | the current rows as `RecipeTables.Entry<T>(id, value)`, sorted by recipe id |
| `changed` | a `Hook<Runnable>` fired after the rows changed (server reload, client sync), on that side's thread |
| `fields(RecipeFields)` | states the row's fields for scripts; returns the table |
| `fields()` | the stated fields, plus a raw JSON field for every other codec key |
| `toJson(value, registries)` / `fromJson(json, registries)` | encode or decode one row with the table's codec |

Golem Core keeps one snapshot of the rows per table: on the server rebuilt after every reload, on a client from its own
sync packet. Machines read `entries()` and rebuild their lookup indexes when `changed` fires. Every table is also a
KubeJS recipe type with no extra code.

### GenericRecipe tables

If your rows have HBM's generic shape (item and fluid inputs and outputs, duration, power), extend HBM's
`com.hbm.inventory.recipes.loader.DataGenericRecipes<T>`. It declares the table, sets the script fields to the generic
schema (`GenericRecipeCodec.FIELDS`), keeps the inherited `GenericRecipes` lists in display order (`order`, then id), and
applies `requires`, expensive mode and 528 mode on every rebuild.

```java title="com/ntmspace/recipe/CryoRecipes.java (shortened)"
public final class CryoRecipes extends DataGenericRecipes<GenericRecipe> {

    public static final CryoRecipes INSTANCE = new CryoRecipes();

    private volatile Map<FluidType, Output> byInput = Map.of();

    private CryoRecipes() {
        super(NtmSpace.MOD_ID, "cryo_distill");
    }

    /** Declares the table at mod construction. */
    public static void declare() {}

    @Override
    protected void rebuilt() {
        Map<FluidType, Output> map = new HashMap<>();
        for (GenericRecipe recipe : recipeOrderedList) {
            map.putIfAbsent(recipe.inputFluid[0].type, new Output(recipe.inputFluid[0].fill, recipe.power, recipe.outputFluid));
        }
        byInput = map;
    }

    public @Nullable Output getOutput(FluidType type) {
        registerRecipes();
        return byInput.get(type);
    }
}
```

`CryoRecipes.declare()` is called from a registration class's `init()`, so the table exists before any registry is
filled. Constructors:

| Constructor | Codec |
|---|---|
| `DataGenericRecipes(namespace, name)` | `GenericRecipeCodec.codec()` |
| `DataGenericRecipes(namespace, name, () -> codec)` | your codec |
| `DataGenericRecipes(namespace, name, () -> codec, RecipeFields extras)` | your codec, with your extra keys stated for scripts |

Override points: `arrange(List<GenericRecipe> rows)` adds rule rows or replaces rows before they become the table;
`rebuilt()` derives indexes after each rebuild. `typedRows()` returns the rows in display order;
`registerRecipes()` loads them if nothing has yet.

A subclass with fields of its own uses `GenericRecipeCodec.codec(factory, extras, extract, apply)`: `extras` is a
`MapCodec<E>` for the extra keys in the same JSON object. `GenericRecipeCodec.codec(factory)` is the plain codec for a
subclass with no extra fields.

### Record-shaped tables

For a table whose rows are not generic recipes, HBM's `DataRecipeTable<R>` wraps a table of records:

```java
public DataRecipeTable(String namespace, String name, Supplier<MapCodec<R>> codec)
public DataRecipeTable<R> fields(RecipeFields fields)
public List<R> rows()                              // recipe-id order
public List<RecipeTables.Entry<R>> entries()
public final Hook<Runnable> changed
```

### Script fields

`RecipeFields` describes a table's JSON keys for scripts; the codec stays the only parser. The order of the fields is the
order of the script function's arguments, optional fields last.

```java
table.fields(RecipeFields.of()
    .add(RecipeFields.field("output", Kind.ITEM_OUT))
    .add(RecipeFields.field("input", Kind.ITEM_IN).list())
    .add(RecipeFields.field("duration", Kind.INT).optional(new JsonPrimitive(100))));
```

`Field` has `.list()`, `.optional()`, `.optional(fallback)`, `.shape(Shape)`, `.role(Role)` and `.alias(names...)`.
A table that states nothing still works from scripts: every codec key becomes a raw JSON field.

### Recipe flags

`RecipeTables.flag(name, () -> boolean)` declares a flag. Any recipe file (of any type) that lists
`"golem:requires": ["name"]` (or `"!name"`) is removed after each datapack load while the literal fails. Values are read
at each load, so a config change applies at the next `/reload`. HBM's generic rows use their own `requires` field, read
on every rebuild.

## Writing rows in Java

A JSON file per row is fine for a few rows. `data/<ns>/recipe/` is a folder Dejson owns, so list hand-written row files
(or their folder) in `gradle/dejson-authored.txt` ([example](../first-addon/#4-an-assembly-machine-recipe)). For a
table's worth, write the rows as Java in a source set you do not ship, and let the build generate the files. NTM: Space keeps them in `src/recipes/java`.

### RecipeSource

Golem Core's `dev.golem.core.world.RecipeSource<R>` is the source of one table. Rows are the table's runtime type and are
written with the table's own codec, so the files are exactly what a datapack would hold.

| Member | Does |
|---|---|
| `RecipeSource(RecipeTables.Table<R> table)` | the table; files go to `recipe/<table name>/` |
| `registerDefaults()` | abstract: add every row |
| `register(id, row)` | adds `<id>.json` |
| `nextOrder()` | the position the next row takes |
| `remove(recipeId)` | removes another mod's row (`hbm:press/plate_titanium`); written to your `recipe_removals/<table>.json` |
| `loaded(recipeId)` | a row as the generating server loaded it, before any removal; fails if it does not exist |

```java title="com/ntmspace/recipes/tables/PressTable.java (shortened)"
public final class PressTable extends RecipeSource<Row> {

    public PressTable() {
        super(PressRecipes.TABLE.table);
    }

    @Override
    protected void registerDefaults() {
        makeRecipe(StampType.PLATE, tag("c:ingots/nickel"), item("ntmspace:plate_nickel"), 1,
                after("hbm:press/plate_titanium"));
    }

    private void makeRecipe(StampType type, AStack in, Item out, int count, int order) {
        register(BuiltInRegistries.ITEM.getKey(out).getPath(), new Row(type, in, new ItemSpec(out, count, ItemData.NONE), order));
    }

    /** The order of the HBM row this one follows: the stable sort places it right after. */
    private int after(String recipeId) {
        return loaded(recipeId).order();
    }
}
```

### GenericTableSource

For a `DataGenericRecipes` table, extend HBM's `GenericTableSource<T>`. Rows read like 1.7's
`register(new GenericRecipe("ass.x")...)` lines:

| Member | Does |
|---|---|
| `GenericTableSource(DataGenericRecipes<T> recipes)` | the table |
| `register(recipe)` | adds the row; its id is the name after the first dot, lower case (`chem.hcl` is `hcl.json`) |
| `register(id, recipe)` | adds the row under its own id |
| `orderOf(recipeId)` | the `order` of a loaded row |
| `ordered()` | override to return false for a table looked up by input, where position means nothing |
| `id(recipe)` | override to change the file id |

Each registered row gets `order = nextOrder()` while `ordered()` is true.

```java title="com/ntmspace/recipes/tables/CryoDistillTable.java (shortened)"
public final class CryoDistillTable extends GenericTableSource<GenericRecipe> {

    public CryoDistillTable() {
        super(CryoRecipes.INSTANCE);
    }

    @Override
    protected void registerDefaults() {
        put(SpaceFluids.EARTHAIR,
            new FluidStack(SpaceFluids.NITROGEN, 60), new FluidStack(Fluids.OXYGEN, 25),
            new FluidStack(SpaceFluids.KRYPTON, 10), new FluidStack(Fluids.CARBONDIOXIDE, 5));
    }

    private void put(FluidType input, FluidStack a, FluidStack b, FluidStack c, FluidStack d) {
        register(new GenericRecipe("cryo." + input.getName().toLowerCase(Locale.ROOT)).setup(1, 20_000)
                .inputFluids(new FluidStack(input, 100))
                .outputFluids(a, b, c, d));
    }
}
```

A row's item output is HBM's `ItemSpec(item, count, data)`. A fourth argument, a Golem Core `ItemPatch`
(`ItemPatch.of(stack)`), carries any other components (NBT below 1.20.5) under the key `ItemPatch.KEY`: a row never
builds an `ItemStack` while it is read, because 26.1 decodes recipes before item components exist.

### Placing rows among HBM's

A row placed among HBM's should take the position of the HBM row it follows or replaces, so it stays put when HBM
reorders. Rows of equal `order` sort by recipe id.

```java title="com/ntmspace/recipes/tables/ChemicalPlantTable.java (shortened)"
@Override
protected void registerDefaults() {
    remove("hbm:chemical_plant/oxygen");                 // dropped
    remove("hbm:chemical_plant/biogas");                 // replaced: same id, same position
    register(at(orderOf("hbm:chemical_plant/biogas"), new GenericRecipe("chem.biogas").setupNamed(60, 100)
            .inputItems(new ComparableStack(ModFuelItems.biomass.get(), 16))
            .outputFluids(new FluidStack(Fluids.BIOGAS, 2_000))));
}

// every row sets its own order, so register() must not number them
@Override
protected boolean ordered() {
    return false;
}

private static GenericRecipe at(int order, GenericRecipe recipe) {
    recipe.order = order;
    return recipe;
}
```

`orderOf` reads the loaded HBM row before any removal, so a row can take the position of the row it removes. A table's
removals can be stated by one source only, since each source writes `recipe_removals/<table>.json`.

### Other data folders

Every other folder is a `dev.golem.core.world.DataSource<R>`:

```java
protected DataSource(String folder)                                       // e.g. "fluid_property", "value_maps/item"
protected abstract void registerDefaults();
public abstract JsonElement encode(R row, HolderLookup.Provider registries);
public abstract R decode(JsonElement json, HolderLookup.Provider registries);
protected void register(String id, R row)                                 // data/<ns>/<folder>/<id>.json
```

Ready-made subclasses:

| Class | Writes |
|---|---|
| `dev.golem.core.data.DataMapSource<V>` | a data map file, or with `patch = true` your patch of another mod's map ([Data maps](../java-data-maps/)) |
| `dev.golem.core.world.RemovalSource` | `recipe_removals` lists for recipes that are not a table source's (crafting, smelting) |

```java title="com/ntmspace/recipes/data/SpaceRemovals.java (shortened)"
public final class SpaceRemovals extends RemovalSource {

    @Override
    protected void registerDefaults() {
        register("crafting", List.of("hbm:coffee", "hbm:laser_crystal_dnt", "hbm:powder_fertilizer"));
        register("smelting", List.of("hbm:chunk_ore_cryolite_1"));
    }
}
```

For fluid properties, write a `DataSource` with HBM's `FluidProperties.write/read` (and `writePatch/readPatch` for
`fluid_property_patch`). Item pools use HBM's `ItemPool.PoolFile`. NTM: Space's sources are in
`NTM-Continuum-Space/src/recipes/java/com/ntmspace/recipes/data/`.

A loot function of your own, for loot tables you write or generate, is registered with
`dev.golem.core.world.LootFunctions.register(ns, name, codec)` at mod construction; the codec's type implements
`LootFunctions.Transform` (`ItemStack apply(ItemStack stack, LootContext context)`). It has no `conditions` of its own;
gate it on the entry. HBM's `hbm:fill_fluid` is one.

### Listing the sources

One class implements `dev.golem.core.world.DataSources`:

```java title="com/ntmspace/recipes/SpaceDataSources.java (shortened)"
public final class SpaceDataSources implements DataSources {

    @Override
    public String namespace() {
        return "ntmspace";
    }

    @Override
    public List<DataSource<?>> sources() {
        return List.of(new CryoDistillTable(), new ChemicalPlantTable(), new PressTable(), new SpaceRemovals());
    }
}
```

The namespace is the one the files are written in: the mod that ships them. A source may fill another mod's table: its
files carry that table's `"type"` but live in your namespace.

## Build wiring

The rows are generated on 26.1 NeoForge only, in a headless GameTest server (26.1 binds item components only on a started
server, never in a data run). Golem Core's `DataGenerator` writes every row once the server has started, then halts it.

Copy the `if (project.name == "26.1-neoforge")` block at the end of `NTM-Continuum-Space/build.neoforge.gradle.kts`. It:

1. creates a `recipes` source set over `src/recipes/java`, compiled against the main classes;
2. registers a mod group `<modId>Recipes` for it and a `generateData` run of type `gameTestServer` with:

```kotlin
register("generateData") {
    type = "gameTestServer"
    sourceSet = recipes
    loadedMods.set(setOf(mods.getByName("ntmspaceRecipes")))
    gameDirectory = file("runs/generatedata")
    systemProperty("golem.data.output", generatedDataRoot.get().asFile.absolutePath)
    systemProperty("golem.data.sources", "com.ntmspace.recipes.SpaceDataSources")
    systemProperty("golem.gametest.filter", "^$")
}
```

3. makes every other run load only the mod's own groups, and checks after `runGenerateData` that `manifest.txt` was
   written (the generator writes it last, only when every source succeeded).

`golem.data.sources` takes a comma-separated list of `DataSources` classes.

Then copy `generated-data.gradle.kts` from Golem Core's `gradle/mod/` into your `gradle/golem/` (see
[Project setup](../project-setup/#the-shared-build-scripts)) and apply it on **every** node. It makes `processResources` depend on
`:26.1-neoforge:runGenerateData` and packs `build/generated/data/pack` into the resources, so nobody runs the generator by
hand. It logs `generatedData: packed N generated file(s) in M folder(s)` and fails the build if a folder's file count
differs from the manifest, or if an authored file sits at a generated path. Change the task or the output root with
`golem.build.generatedData.generator` and `golem.build.generatedData.root`.

Edit the Java sources, never the generated JSON.

## Crafting and smelting

Crafting and smelting recipes are Dejson declarations through `dev.golem.core.dejson.Crafting`, in a class listed in
`gradle/dejson-classes.txt` with a static `declare()`. The class runs in a plain JVM, so it names everything by string id.

```java title="com/ntmspace/recipe/SpaceCraftingRecipes.java (shortened)"
public static void declare() {
    shaped(NS, "crafting/block_nickel", "ntmspace:block_nickel", rows("###", "###", "###"), "#", "ntmspace:ingot_nickel");
    shaped(NS, "crafting/ingot_nickel_from_block_nickel", "ntmspace:ingot_nickel", 9, rows("#"), "#", "ntmspace:block_nickel");
}
```

| Method | Writes |
|---|---|
| `compress(ns, id, ingredient, result)` / `decompress(...)` | the 3x3 block recipe and its reverse |
| `smelt(ns, id, ingredient, result, experience[, count])` | a furnace recipe |
| `blast(ns, id, ingredient, result, experience)` | a blast-furnace recipe (100 ticks) |
| `shaped(ns, id, result[, count], pattern, key...)` | a shaped recipe; key is symbol, ingredient pairs; `#tag` allowed |
| `shapeless(ns, id, result[, count], ingredients...)` | a shapeless recipe |
| `componentShaped`, `componentShapeless`, `componentSmelt`, `copyShapeless` | recipes whose result or ingredients carry data components |
| `componentShapedCopy(ns, id, result, copyFrom, ...)` | a shaped recipe whose result copies the components of the ingredient under the `copyFrom` symbol |
| `special(ns, id, type)` | a file that only names a special recipe serializer, whose results are decided in Java |
| `whenModLoaded(recipe, modId)` | loads the recipe only with that mod |
| `requires(recipe, literals...)` | adds `"golem:requires"` (see recipe flags above) |

A replaced HBM crafting recipe is removed through a `RemovalSource` or a `recipe_removals` file, never by a file at HBM's
path: pack order between mods is not reliable (Fabric 1.20.1 orders mod packs by mod list).
