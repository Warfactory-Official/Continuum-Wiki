---
title: Dimensions
description: "Adding dimensions with Golem Core: authored dimension JSON, custom chunk generators and biome sources, skies, a dimension's own clock, world types, rain and clouds."
sidebar:
  order: 11
---

An addon mod adds dimensions with authored JSON plus a few Golem Core calls that work on every node. This page covers the
files, chunk generators and biome sources, how HBM sees your dimension, skies, time of day, world types and weather.

## Dimension files

Dimension, dimension type and biome files are authored JSON in the **26.1 shape**, under `data/<ns>/dimension/`,
`data/<ns>/dimension_type/` and `data/<ns>/worldgen/`. Dejson owns `worldgen`, so list `data/<ns>/worldgen/` in
`gradle/dejson-authored.txt` (NTM: Space lists all three folders). The shared
build scripts convert them for older nodes: `legacy-dimensions.gradle.kts` rewrites dimension types to the older flat
shape (`skybox` becomes `effects`, environment attributes become `ultrawarm`, `bed_works`, `has_raids` and so on; a type
may carry `"golem:effects"` to name the legacy effects id), and `legacy-biomes.gradle.kts` converts biomes.

## Declaring a dimension

```java
// dev.golem.core.world.Dimensions
public static ResourceKey<Level> dimension(String namespace, String path)
public static ResourceKey<Level> level(String namespace, String path)
```

`dimension` declares `<namespace>:<path>` as a mod dimension and returns its level key. Vanilla calls any world with
dimensions other than its own three "experimental" and asks before creating or opening it; a declared dimension does
not trigger that screen. Call it once, at mod construction. `level` only builds the key.

```java title="com/ntmspace/world/SpaceDimensions.java (shortened)"
public static final ResourceKey<Level> MUN = Dimensions.dimension(NtmSpace.MOD_ID, "mun");
public static final Dimensions.GeneratorType MUN_GENERATOR =
        Dimensions.chunkGenerator(NtmSpace.MOD_ID, "mun", () -> MunChunkGenerator.CODEC);
```

## Chunk generators

```java
public static GeneratorType chunkGenerator(String namespace, String name,
                                           Supplier<? extends MapCodec<? extends ChunkGenerator>> codec)
```

registers `<namespace>:<name>`, the `"type"` of a dimension's generator in JSON. Registries hold a `MapCodec` from 1.20.5
and a plain `Codec` below; this registers whichever the node needs.

Extend `dev.golem.core.world.CompatChunkGenerator`. It implements vanilla's version-specific abstract methods and forwards
them to a neutral shape:

| Member | Implement |
|---|---|
| `CompatChunkGenerator(BiomeSource biomeSource)` | constructor |
| `protected abstract MapCodec<? extends ChunkGenerator> mapCodec()` | the registered codec |
| `protected abstract void fill(ChunkAccess chunk)` | fill the chunk's blocks |
| `protected abstract int minimumY()` | the bottom of the world |
| `protected void carve(WorldGenRegion region, ChunkAccess chunk)` | optional carving step |
| `protected void surface(WorldGenRegion region, ChunkAccess chunk)` | optional surface step |
| `protected final long seed()` | the level seed (captured from `createState`) |
| `protected static void set(ChunkAccess chunk, BlockPos.MutableBlockPos pos, BlockState state)` | helper |

Vanilla's remaining abstract methods (`getBaseHeight`, `getBaseColumn`, `getGenDepth`, `getSeaLevel`) are yours too.

```java title="com/ntmspace/orbit/OrbitChunkGenerator.java (shortened)"
public final class OrbitChunkGenerator extends CompatChunkGenerator {

    public static final MapCodec<OrbitChunkGenerator> CODEC = RecordCodecBuilder.mapCodec(instance -> instance.group(
            BiomeSource.CODEC.fieldOf("biome_source").forGetter(ChunkGenerator::getBiomeSource)
    ).apply(instance, OrbitChunkGenerator::new));

    public OrbitChunkGenerator(BiomeSource biomeSource) {
        super(biomeSource);
    }

    @Override
    protected MapCodec<? extends ChunkGenerator> mapCodec() {
        return CODEC;
    }

    @Override
    protected void fill(ChunkAccess chunk) {}

    // getBaseHeight, getBaseColumn, getGenDepth, getSeaLevel, minimumY ...
}
```

## Biome sources

```java
public static BiomeSourceType biomeSource(String namespace, String name,
                                          Supplier<? extends MapCodec<? extends BiomeSource>> codec)
```

Extend `dev.golem.core.world.CompatBiomeSource`: implement `mapCodec()`, plus vanilla's `collectPossibleBiomes` and
`getNoiseBiome`, which have the same shape on every version. `seed()` is the level seed; a `CompatChunkGenerator` passes it
to its biome source before any query (override `seeded(long levelSeed)` to react). A biome source that needs the seed
must sit under a `CompatChunkGenerator`, otherwise `seed()` throws. Biome queries come from worker threads, so be
thread-safe.

## HBM's view of your dimension

HBM's hard-wired dimension checks go through `com.hbm.api.environment.Environment`: answer `SURFACE`, `ORBIT`,
`PRESSURE`, `BREATHING`, `GRAVITY`, `SUNLIGHT` and the others for your levels. See [Hooks](../hooks/#environment). If you
draw a dimension's sky yourself, register with `SkyOwnership.OWNERS` so HBM's own sky layers stay off it.

## Skies

**Sky values.** `dev.golem.core.world.Skies.addModifier(Skies.Modifier)` changes how bright the sky is and what colour,
the stand-in for 1.7 `WorldProvider` overrides. Nothing is asked unless `active(Level)` returns true. Every other method
receives vanilla's value and returns the one to use:

| `Skies.Modifier` method | 1.7 |
|---|---|
| `boolean active(Level level)` | |
| `float daylight(Level level, float daylight)` | `getSunBrightnessFactor` (both sides) |
| `Vec3 skyColor(Level level, Vec3 color)` | `getSkyColor` |
| `Vec3 fogColor(Level level, Vec3 color)` | `getFogColor` |
| `Vec3 cloudColor(Level level, Vec3 color)` | cloud colour |
| `float starBrightness(Level level, float brightness)` | `getStarBrightness` |
| `float skyLight(Level level, float factor)` | `getSunBrightness` |
| `float[] sunriseColor(Level level, float[] rgba)` | `calcSunriseSunsetColors` |

**Sky drawing.** `dev.golem.core.render.Skyboxes.register(Skyboxes.Skybox)` adds a sky layer, in any dimension:

| `Skyboxes.Skybox` method | Does |
|---|---|
| `boolean replacesCelestial(ClientLevel level)` | true to draw this frame's sun, moon and stars instead of vanilla |
| `void celestial(Sky sky)` | draws the replacement (only after `replacesCelestial` said true) |
| `void afterSky(Sky sky)` | draws after the whole sky, every frame an overworld-type sky is drawn |

`dev.golem.core.render.Sky` is one sky draw, in the style of a 1.7 `IRenderHandler`: no fog, no depth, the blend chosen
per call. `pose()` starts as vanilla's sky pose, so 1.7 `glRotatef`/`glTranslatef` calls map to `pose().mulPose` /
`translate`. It has `level()`, `partialTick()`, `celestialAngle()`, `moonPhase()`, `skyColor()`, and draws with
`quads(Blend, r, g, b, a, xyz...)`, `coloredQuads(Blend, xyzrgba...)`, `texturedQuads(Texture, Blend, r, g, b, a,
xyzuv...)`, `lines(...)`, `points(...)` and `shaderQuads(...)`. `Sky.Texture.of(ns, path)`, `Texture.sun()` and
`Texture.moon(phase)` name textures with UVs 0..1 on every node.

NTM: Space orders its sky listeners before the default phase:

```java
Skyboxes.SKYBOXES.addPhaseOrdering(SpaceSkies.PHASE, Hook.DEFAULT_PHASE);
```

## A dimension's own day

```java
// dev.golem.core.world.TimeOfDay
public static synchronized void ownClock(ResourceKey<Level> dimension)
public static long get(Level level)
public static void set(ServerLevel level, long time)
```

`ownClock` gives a dimension its own time of day (1.7 `WorldProvider.getWorldTime` per provider): saved per level,
advanced each server tick while the daylight game rule is on, and sent to the level's players. Call it at mod
construction on both sides. Read any level's time of day with `TimeOfDay.get(level)` (vanilla's day time where no clock
of its own was set).

## World types

A world type (1.7 `WorldType`) is a choice on the create-world screen that the world remembers. It is authored JSON (a
world preset `data/<ns>/worldgen/world_preset/<name>.json` whose overworld `multi_noise` biome source names the parameter
list `<ns>:<name>`, that list as `{"preset": "minecraft:overworld"}`, the `minecraft:normal` preset tag, and the lang key
`generator.<ns>.<name>`) plus:

```java
// dev.golem.core.world.WorldTypes
public static void declare(String namespace, String name)        // at mod construction
public static boolean is(MinecraftServer server, String namespace, String name)
```

NTM: Space's "The Martian" uses it to start players on Duna, with `Lifecycle.onPlayerJoin`'s first-time flag.

## Rain, snow and clouds

Both are client side, per dimension, with one owner each: a second registration for the same dimension is a start-up
error naming the first.

```java
// dev.golem.core.client.Precipitation
public static void register(ResourceKey<Level> dimension, Renderer renderer)
// Renderer: void render(Frame frame); Frame has level(), partialTick(), camera() and takes the quads

// dev.golem.core.client.Clouds
public static void register(ResourceKey<Level> dimension, Provider provider)
public static void off(ResourceKey<Level> dimension)
// Provider: List<Layer> layers(Level level, float partialTick)
// Layer(float height, float red, float green, float blue, float alpha, double shiftX, double shiftZ)
```

`Precipitation` replaces vanilla's weather columns with your quads (1.7 `getWeatherRenderer`); rain splashes, sounds and
lightning stay vanilla's. `Clouds` replaces vanilla's clouds with your layers, each drawn by the node's own cloud renderer;
an empty list (or `off`) draws none. Dimensions nobody registers keep vanilla's.

```java title="com/ntmspace/client/CelestialWeather.java (shortened)"
Precipitation.register(SpaceDimensions.MUN, renderer);
Precipitation.register(SpaceDimensions.DUNA, renderer);
```

Server-side weather state per level is `dev.golem.core.world.Weathers.register(provider)`.
