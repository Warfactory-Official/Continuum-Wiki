---
title: Project setup
description: "The files an addon mod project needs to build for all six NTM - Continuum nodes, trimmed from NTM: Space's build."
sidebar:
  order: 2
---

This page lists every file an addon mod project needs before it has any content, with contents trimmed from NTM: Space's
build ([NTM-Continuum-Space](https://github.com/Warfactory-Official/NTM-Continuum-Space)). Copying that project and
renaming it is the fastest start; this page explains what each part does and what you can leave out. When the files are
in place, continue with [Your first addon mod](../first-addon/).

## Directory layout

Clone Golem Core, NTM - Continuum and your addon side by side. The builds find each other by relative path.

```text
workspace/
  Golem-Core/        https://github.com/Warfactory-Official/Golem-Core
  new-hbm/           https://github.com/Warfactory-Official/NTM-Continuum
  my-addon/
    settings.gradle.kts
    stonecutter.gradle.kts
    gradle.properties
    build.neoforge.gradle.kts
    build.fabric.gradle.kts
    build.forge.gradle.kts
    gradlew, gradlew.bat, gradle/wrapper/     copied from NTM: Space
    gradle/
      dejson-classes.txt
      dejson-authored.txt
    versions/
      26.1-neoforge/gradle.properties
      26.1-fabric/gradle.properties
      1.21.1-neoforge/gradle.properties
      1.21.1-fabric/gradle.properties
      1.20.1-forge/gradle.properties
      1.20.1-fabric/gradle.properties
    src/
      main/java/        one source tree for every node
      main/resources/   one resource tree for every node
      recipes/java/     data written in Java, not shipped (optional)
```

The folder names `Golem-Core` and `new-hbm` matter: the build scripts below refer to `../Golem-Core` and `../new-hbm`.

## settings.gradle.kts

Stonecutter declares the six nodes. Golem Core and HBM are composite builds, so edits to them are picked up with no
publish step: each node's Maven artifact is replaced by the upstream project of the same node.

```kotlin title="settings.gradle.kts"
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
        maven("https://maven.fabricmc.net/") { name = "Fabric" }
        maven("https://maven.neoforged.net/releases/") { name = "NeoForged" }
        maven("https://maven.kikugie.dev/releases") { name = "KikuGie" }
        maven("https://maven.kikugie.dev/snapshots") { name = "KikuGie Snapshots" }
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
    id("dev.kikugie.stonecutter") version "0.9.8"
    id("dev.kikugie.loom-back-compat") version "0.4.2"
}

stonecutter {
    create(rootProject) {
        fun match(version: String, vararg loaders: String) = loaders.forEach {
            version("$version-$it", version).buildscript = "build.$it.gradle.kts"
        }
        match("26.1", "fabric", "neoforge")
        match("1.21.1", "fabric", "neoforge")
        match("1.20.1", "fabric", "forge")
        vcsVersion = "26.1-neoforge"
    }
}

rootProject.name = "myaddon"

val nodes = listOf("26.1-fabric", "26.1-neoforge", "1.21.1-fabric", "1.21.1-neoforge", "1.20.1-fabric", "1.20.1-forge")

includeBuild("../Golem-Core") {
    dependencySubstitution {
        nodes.forEach { node ->
            val (mc, loader) = node.split('-', limit = 2)
            substitute(module("dev.golem:golemcore-$loader-$mc")).using(project(":$node"))
        }
    }
}

includeBuild("../new-hbm") {
    dependencySubstitution {
        nodes.forEach { node ->
            val (mc, loader) = node.split('-', limit = 2)
            substitute(module("com.hbm:hbm-$loader-$mc")).using(project(":$node"))
        }
    }
}
```

`loom-back-compat` picks the right Fabric Loom variant per node (obfuscated below 26.1).

## stonecutter.gradle.kts

This file holds the loader constants and the version replacements. Copy NTM: Space's whole file: its `replacements`
block is the same set as HBM's, so your code reads like HBM's on every node. For example `Identifier.fromNamespaceAndPath(`
becomes `dev.golem.core.Ids.of(`, and `Identifier` becomes `ResourceLocation` below 1.21.11.

```kotlin title="stonecutter.gradle.kts (start)"
plugins {
    id("dev.kikugie.stonecutter")
}

stonecutter active "26.1-neoforge" /* [SC] DO NOT EDIT */

tasks.register("chiseledBuild") {
    group = "build"
    dependsOn(stonecutter.tasks.named("build"))
}

stonecutter parameters {
    val loader = node.metadata.project.substringAfterLast('-')
    constants["fabric"] = loader == "fabric"
    constants["neoforge"] = loader == "neoforge"
    constants["forge"] = loader == "forge"
    constants["forgelike"] = loader == "neoforge" || loader == "forge"
    swaps["mc_version"] = "\"${node.metadata.version}\";"
    constants["jei"] = !(node.project.findProperty("deps.jei") as String?).isNullOrBlank()
    constants["kubejs"] = !(node.project.findProperty("deps.kubejs") as String?).isNullOrBlank()
    replacements {
        // copy NTM: Space's list unchanged
    }
}
```

Use loader guards (`//? if fabric {`) only for loader glue under your `platform` package. A difference between Minecraft
versions belongs in Golem Core, not in your addon mod.

## gradle.properties

The root file holds the mod identity, the upstream versions, the `golem.build.*` parameters for the shared scripts, and a
`[VERSIONED]` placeholder for every key a node file sets.

```properties title="gradle.properties"
org.gradle.jvmargs=-Xmx3G -XX:+UseG1GC -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true

mod.id=myaddon
mod.name=My Addon
mod.group=com.example.myaddon
mod.version=0.1.0
mod.author=You
mod.license=LGPL-3.0
mod.credits=
mod.description=An addon for NTM - Continuum.

deps.golemcore=0.1.0
deps.hbm=0.1.0

golem.build.dejson.classes=gradle/dejson-classes.txt
golem.build.dejson.authored=gradle/dejson-authored.txt

deps.minecraft=[VERSIONED]
deps.minecraft_range=[VERSIONED]
java_version=[VERSIONED]
pack_format=[VERSIONED]
deps.fabric_loader=[VERSIONED]
deps.fabric_api=[VERSIONED]
deps.neoforge=[VERSIONED]
deps.neoforge_loader_range=[VERSIONED]
deps.forge=[VERSIONED]
deps.forge_loader_range=[VERSIONED]
deps.jei_mc=[VERSIONED]
deps.jei=[VERSIONED]
deps.lwjgl=[VERSIONED]

loomx.loom_version=1.16.3
```

NTM: Space also sets these, needed only if you use HBM's item-model vocabulary (`hbm:machine_obj`, `hbm:custom_item`,
`hbm:model_state`) or smelting recipes whose result carries a count or components:

```properties
golem.build.legacyRecipes.componentSmeltingType=hbm:component_smelting
golem.build.legacyAssets.modelNamespace=hbm
golem.build.legacyAssets.selfRenderedSpecialTypes=hbm:machine_obj,hbm:rbmk_fuel_column,hbm:rbmk_block_column
golem.build.legacyAssets.selectProperties=hbm:model_state
```

## versions/&lt;node&gt;/gradle.properties

Each node's file holds only that node's dependency versions. Keep them equal to HBM's file for the same node, since the
addon mod runs on that HBM node. NTM: Space's values:

| Key | 26.1 NeoForge | 26.1 Fabric | 1.21.1 NeoForge | 1.21.1 Fabric | 1.20.1 Forge | 1.20.1 Fabric |
|---|---|---|---|---|---|---|
| `deps.minecraft` | `26.1.2` | `26.1.2` | `1.21.1` | `1.21.1` | `1.20.1` | `1.20.1` |
| `deps.minecraft_range` | `[26.1.2, 26.2)` | `>=26.1.2` | `[1.21.1, 1.22)` | `>=1.21.1 <1.22` | `[1.20.1,1.21)` | `>=1.20.1 <1.21` |
| `java_version` | `25` | `25` | `21` | `21` | `17` | `17` |
| `pack_format` | `84` | `84` | `34` | `34` | `15` | `15` |
| loader | `deps.neoforge=26.1.2.114` | `deps.fabric_loader=0.19.5` | `deps.neoforge=21.1.248` | `deps.fabric_loader=0.19.5` | `deps.forge=1.20.1-47.2.30` | `deps.fabric_loader=0.19.5` |
| loader range / API | `deps.neoforge_loader_range=[4,)` | `deps.fabric_api=0.155.3+26.1.2` | `deps.neoforge_loader_range=[4,)` | `deps.fabric_api=0.116.17+1.21.1` | `deps.forge_loader_range=[47,)` | `deps.fabric_api=0.92.12+1.20.1` |
| `deps.jei_mc` / `deps.jei` | `26.1.2` / `29.43.0.107` | `26.1.2` / `29.43.0.107` | `1.21.1` / `19.44.0.401` | `1.21.1` / `19.44.0.401` | `1.20.1` / `15.49.0.188` | `1.20.1` / `15.49.0.188` |

1.20.1 Fabric also sets `deps.lwjgl=3.3.1`; the other Fabric nodes leave it blank. 26.1 NeoForge sets
`deps.neoforge_floor=26.1.2.109`, the oldest NeoForge the released jar accepts (see
[Scripting surface](../scripting-surface/#dev-runs)). JEI is optional: leave `deps.jei` blank to build without it.

```properties title="versions/1.21.1-neoforge/gradle.properties"
deps.minecraft=1.21.1
deps.minecraft_range=[1.21.1, 1.22)
java_version=21
pack_format=34
deps.neoforge=21.1.248
deps.neoforge_loader_range=[4,)
deps.jei_mc=1.21.1
deps.jei=19.44.0.401
```

## The loader buildscripts

There is one buildscript per loader; Stonecutter runs it once per node of that loader. Each one:

1. sets the Java toolchain from `java_version` (26.1 on Java 25, 1.21.1 on 21, 1.20.1 on 17);
2. excludes the other loaders' `platform` packages from the main source set;
3. depends on Golem Core and HBM by their Maven coordinates (the composite build substitutes the projects);
4. fills the `${...}` placeholders in the metadata files and excludes the other loaders' metadata;
5. makes `compileJava` and `processResources` (and on NeoForge `createMinecraftArtifacts`) depend on
   `stonecutterGenerate`, or they read the previous node's source;
6. applies Golem Core's shared scripts.

Running a node on the wrong Java fails in confusing ways: a 1.21.1 NeoForge client on Java 25 dies with
`ClassNotFoundException: java.lang.Boolean`. `run-toolchain.gradle.kts` pins every run task to the node's Java.

### build.neoforge.gradle.kts

```kotlin title="build.neoforge.gradle.kts (trimmed)"
plugins {
    id("java-library")
    id("net.neoforged.moddev") version "2.0.141"
}

fun prop(name: String): String = property(name) as String
fun propOrNull(name: String): String? = (findProperty(name) as String?)?.takeIf { it.isNotBlank() }

val mcVersion = stonecutter.current.version
val javaVersion = prop("java_version").toInt()
val modId = prop("mod.id")

group = prop("mod.group")
version = "${prop("mod.version")}+$mcVersion"
base.archivesName = "$modId-neoforge-$mcVersion"

java { toolchain.languageVersion = JavaLanguageVersion.of(javaVersion) }

sourceSets["main"].java {
    exclude("com/example/myaddon/platform/fabric/**", "com/example/myaddon/platform/forge/**")
}

val neoforgeFloor = propOrNull("deps.neoforge_floor") ?: prop("deps.neoforge")

neoForge {
    version = prop("deps.neoforge")
    runs {
        configureEach { systemProperty("neoforge.enabledGameTestNamespaces", modId) }
        register("client") { client(); gameDirectory = file("runs/client") }
        register("server") { server(); gameDirectory = file("runs/server") }
        register("gameTestServer") {
            type = "gameTestServer"
            gameDirectory = file("runs/gametest")
            systemProperty("golem.gametest.filter",
                providers.gradleProperty("gametest.filter").orElse("$modId:.*").get())
        }
    }
    mods { register(modId) { sourceSet(sourceSets["main"]) } }
}

repositories {
    mavenCentral()
    maven("https://maven.blamejared.com") { name = "BlameJared" }
}

dependencies {
    implementation("dev.golem:golemcore-neoforge-$mcVersion:${prop("deps.golemcore")}+$mcVersion")
    implementation("com.hbm:hbm-neoforge-$mcVersion:${prop("deps.hbm")}+$mcVersion")
    compileOnly("org.jspecify:jspecify:1.0.0")
}

val modProps = mapOf(
    "mod_id" to modId,
    "mod_name" to prop("mod.name"),
    "mod_version" to prop("mod.version"),
    "mod_author" to prop("mod.author"),
    "mod_license" to prop("mod.license"),
    "mod_credits" to prop("mod.credits"),
    "mod_description" to prop("mod.description"),
    "minecraft_range" to prop("deps.minecraft_range"),
    "neoforge_version" to neoforgeFloor,
    "neoforge_loader_range" to prop("deps.neoforge_loader_range"),
    "pack_format_entry" to if (mcVersion.substringBefore('.').toInt() >= 26)
        "\"min_format\": ${prop("pack_format")}, \"max_format\": ${prop("pack_format")}"
    else
        "\"pack_format\": ${prop("pack_format")}",
)

tasks.processResources {
    inputs.properties(modProps)
    filesMatching(listOf("META-INF/neoforge.mods.toml", "pack.mcmeta")) { expand(modProps) }
    exclude("fabric.mod.json", "META-INF/mods.toml")
}

tasks.named("createMinecraftArtifacts") { dependsOn(tasks.named("stonecutterGenerate")) }
tasks.compileJava { dependsOn(tasks.named("stonecutterGenerate")) }
tasks.processResources { dependsOn(tasks.named("stonecutterGenerate")) }

tasks.matching { it.name == "runGameTestServer" }.configureEach {
    doFirst { delete(layout.projectDirectory.dir("runs/gametest/world")) }
}

extra["mc_version"] = mcVersion
extra["java_version"] = javaVersion.toString()
extra["loader_cooking_result_count"] = true
apply(from = rootProject.file("../Golem-Core/gradle/mod/run-toolchain.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-recipes.gradle.kts"))
extra["loader"] = "neoforge"
apply(from = rootProject.file("../Golem-Core/gradle/mod/kubejs-order.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/recipe-conditions.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-biomes.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-dimensions.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-assets.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/dejson.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/mixin-validation.gradle.kts"))
```

NTM: Space's file adds JEI (`compileOnly` API jars, the full jar as a dev-only runtime mod), the dev-only probe addon's
source set, KubeJS dev runs (`-Pkubejs.run=true`), the publish script, and the data generator (below).

### build.fabric.gradle.kts

Below 26.1 Fabric remaps mod dependencies, so they go in `modImplementation` and the build needs Mojang mappings. On 26.1
they are plain `implementation`.

```kotlin title="build.fabric.gradle.kts (trimmed)"
plugins {
    id("java-library")
    id("dev.kikugie.loom-back-compat")
}

fun prop(name: String): String = property(name) as String
fun propOrNull(name: String): String? = (findProperty(name) as String?)?.takeIf { it.isNotBlank() }

val mcVersion = stonecutter.current.version
val javaVersion = prop("java_version").toInt()
val modId = prop("mod.id")

group = prop("mod.group")
version = "${prop("mod.version")}+$mcVersion"
base.archivesName = "$modId-fabric-$mcVersion"

java { toolchain.languageVersion = JavaLanguageVersion.of(javaVersion) }

sourceSets["main"].java {
    exclude("com/example/myaddon/platform/neoforge/**", "com/example/myaddon/platform/forge/**")
}

repositories { mavenCentral() }

val obfuscated = mcVersion.substringBefore('.').toInt() < 26
val modCfg = if (obfuscated) "modImplementation" else "implementation"

// LWJGL pinned to what 1.20.1 ships
propOrNull("deps.lwjgl")?.let { pinned ->
    configurations.configureEach {
        resolutionStrategy.eachDependency { if (requested.group == "org.lwjgl") useVersion(pinned) }
    }
}

extra["mc_version"] = mcVersion
extra["golem.build.composite.roots"] = "../Golem-Core=dev/golem,../new-hbm=com/hbm"
apply(from = rootProject.file("../Golem-Core/gradle/mod/composite-freshness.gradle.kts"))

dependencies {
    "minecraft"("com.mojang:minecraft:${prop("deps.minecraft")}")
    if (obfuscated) "mappings"(loom.officialMojangMappings())
    modCfg("net.fabricmc:fabric-loader:${prop("deps.fabric_loader")}")
    modCfg("net.fabricmc.fabric-api:fabric-api:${prop("deps.fabric_api")}")
    modCfg("dev.golem:golemcore-fabric-$mcVersion:${prop("deps.golemcore")}+$mcVersion")
    modCfg("com.hbm:hbm-fabric-$mcVersion:${prop("deps.hbm")}+$mcVersion")
    compileOnly("org.jspecify:jspecify:1.0.0")
}

loom {
    runs {
        named("client") { client(); runDir = "runs/client" }
        named("server") { server(); runDir = "runs/server" }
        register("gametest") {
            server()
            runDir = "runs/gametest"
            vmArg("-Dfabric-api.gametest")
            vmArg("-Dgolem.gametest.filter=${providers.gradleProperty("gametest.filter").orElse("$modId:.*").get()}")
        }
    }
}

val modProps = mapOf(
    "mod_id" to modId,
    "mod_name" to prop("mod.name"),
    "mod_version" to prop("mod.version"),
    "mod_author" to prop("mod.author"),
    "mod_license" to prop("mod.license"),
    "mod_description" to prop("mod.description"),
    "minecraft_range" to prop("deps.minecraft_range"),
    "fabric_loader" to prop("deps.fabric_loader"),
    "java_version" to javaVersion.toString(),
    "pack_format_entry" to if (!obfuscated)
        "\"min_format\": ${prop("pack_format")}, \"max_format\": ${prop("pack_format")}"
    else
        "\"pack_format\": ${prop("pack_format")}",
)

tasks.processResources {
    inputs.properties(modProps)
    filesMatching(listOf("fabric.mod.json", "pack.mcmeta")) { expand(modProps) }
    exclude("META-INF/mods.toml", "META-INF/neoforge.mods.toml", "data/neoforge/**")
}

tasks.compileJava {
    dependsOn(tasks.named("stonecutterGenerate"))
    options.release = javaVersion
}
tasks.processResources { dependsOn(tasks.named("stonecutterGenerate")) }

tasks.matching { it.name == "runGametest" }.configureEach {
    doFirst { delete(layout.projectDirectory.dir("runs/gametest/world")) }
}

extra["java_version"] = javaVersion.toString()
apply(from = rootProject.file("../Golem-Core/gradle/mod/run-toolchain.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-recipes.gradle.kts"))
extra["loader"] = "fabric"
apply(from = rootProject.file("../Golem-Core/gradle/mod/recipe-conditions.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-biomes.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-dimensions.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/legacy-assets.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/dejson.gradle.kts"))
apply(from = rootProject.file("../Golem-Core/gradle/mod/mixin-validation.gradle.kts"))
```

`composite-freshness.gradle.kts` goes before the `dependencies` block: it stops Loom from compiling against a stale remap
of an edited upstream jar. The Fabric file applies no `kubejs-order` script.

### build.forge.gradle.kts

Forge 1.20.1 uses ModDevGradle's legacy Forge plugin. Its differences from the NeoForge file:

```kotlin title="build.forge.gradle.kts (differences)"
plugins {
    id("java-library")
    id("net.neoforged.moddev.legacyforge") version "2.0.141"
}

legacyForge {
    version = prop("deps.forge")
    runs {
        configureEach { systemProperty("forge.enabledGameTestNamespaces", modId) }
        // client, server, gameTestServer as on NeoForge
    }
    mods { register(modId) { sourceSet(sourceSets["main"]) } }
}

dependencies {
    modImplementation("dev.golem:golemcore-forge-$mcVersion:${prop("deps.golemcore")}+$mcVersion")
    modImplementation("com.hbm:hbm-forge-$mcVersion:${prop("deps.hbm")}+$mcVersion")
    compileOnly("org.jspecify:jspecify:1.0.0")
}

// modProps: "forge_loader_range" to prop("deps.forge_loader_range") instead of the NeoForge keys,
// and "pack_format_entry" to "\"pack_format\": ${prop("pack_format")}"
tasks.processResources {
    inputs.properties(modProps)
    filesMatching(listOf("META-INF/mods.toml", "pack.mcmeta")) { expand(modProps) }
    exclude("fabric.mod.json", "META-INF/neoforge.mods.toml", "data/neoforge/**")
}

extra["mc_version"] = mcVersion
extra["java_version"] = javaVersion.toString()
extra["convention_namespace"] = "forge"
// then the same apply(...) lines as NeoForge, with extra["loader"] = "forge"
```

There is no `createMinecraftArtifacts` task and no `loader_cooking_result_count` on Forge. `convention_namespace` makes
the shared scripts use Forge 1.20.1's `forge:` convention tags in converted recipes and biome tags. NTM: Space's Forge GameTest run also writes
`level-type=minecraft:flat` into its `server.properties` before each run, so every run starts from an empty flat world.

## The shared build scripts

Each loader buildscript applies Golem Core's scripts from `../Golem-Core/gradle/mod/`, after setting the `extra` values
they read (`mc_version`, `java_version`, `loader`).

| Script | Does | Parameters (`golem.build.*`) |
|---|---|---|
| `run-toolchain` | pins run tasks to the node's Java | `runToolchain.clientFlags` |
| `legacy-recipes` | rewrites recipe JSON for nodes below 1.21.2 | `legacyRecipes.componentSmeltingType`, `resourceTasks` |
| `recipe-conditions` | rewrites `"golem:conditions"` to the loader's spelling | `resourceTasks` |
| `legacy-biomes` | converts biome files for older nodes | none |
| `legacy-dimensions` | converts 26.1 dimension types for older nodes | none |
| `legacy-assets` | generates item models below 1.21.4 | `legacyAssets.modelNamespace`, `legacyAssets.selectProperties`, `legacyAssets.selfRenderedSpecialTypes` |
| `dejson` | writes declared models, blockstates, loot, tags and recipes; adds `dejsonVerify` and `dejsonOwnership` | `dejson.classes`, `dejson.authored`, `dejson.unownedFolders` |
| `generated-data` | packs data generated from Java (see [Recipes and data](../recipes-and-data/#build-wiring)) | `generatedData.generator`, `generatedData.root` |
| `mixin-validation` | fails `check` if a mixin config names a missing class | none |
| `kubejs-order` (NeoForge, Forge) | orders your mod before KubeJS in the mod metadata | none |
| `composite-freshness` (Fabric) | refreshes Loom's remap of upstream jars | `composite.roots` |
| `publish` | uploads release jars to Modrinth and CurseForge | `publish.*` |

Apply `generated-data` only once your 26.1 NeoForge buildscript declares the `runGenerateData` task it depends on (see
[Recipes and data](../recipes-and-data/#build-wiring)); without it, the build fails. Each script logs a count of what it
converted. Read it after a change: a missing line means the script did nothing.

## Mod metadata

Declare `golemcore` and `hbm` as required dependencies. On NeoForge and Forge order your mod **after** both, so your
start-up phases run after theirs.

```toml title="src/main/resources/META-INF/neoforge.mods.toml"
modLoader = "javafml"
loaderVersion = "${neoforge_loader_range}"
license = "${mod_license}"

[[mods]]
modId = "${mod_id}"
version = "${mod_version}"
displayName = "${mod_name}"
credits = "${mod_credits}"
authors = "${mod_author}"
description = '''${mod_description}'''

[[dependencies.${mod_id}]]
modId = "neoforge"
type = "required"
versionRange = "[${neoforge_version},)"
ordering = "NONE"
side = "BOTH"

[[dependencies.${mod_id}]]
modId = "golemcore"
type = "required"
versionRange = "[0.1.0,)"
ordering = "AFTER"
side = "BOTH"

[[dependencies.${mod_id}]]
modId = "hbm"
type = "required"
versionRange = "[0.1.0,)"
ordering = "AFTER"
side = "BOTH"

[[dependencies.${mod_id}]]
modId = "minecraft"
type = "required"
versionRange = "${minecraft_range}"
ordering = "NONE"
side = "BOTH"
```

Forge 1.20.1 reads `META-INF/mods.toml`: the same file with `loaderVersion = "${forge_loader_range}"`, a `forge`
dependency (`versionRange = "${forge_loader_range}"`) in place of `neoforge`, and `mandatory = true` in place of
`type = "required"` on every dependency. Keep `ordering = "AFTER"` on `golemcore` and `hbm`: Golem Core makes Forge's
parallel mod construction wait for them.

On Fabric, list your `ModEntry` under `golemcore:entry` (not `main`) and depend on both mods:

```json title="src/main/resources/fabric.mod.json"
{
  "schemaVersion": 1,
  "id": "${mod_id}",
  "version": "${mod_version}",
  "name": "${mod_name}",
  "description": "${mod_description}",
  "authors": ["${mod_author}"],
  "license": "${mod_license}",
  "environment": "*",
  "entrypoints": {
    "golemcore:entry": ["com.example.myaddon.MyAddonEntry"]
  },
  "depends": {
    "fabricloader": ">=${fabric_loader}",
    "fabric-api": "*",
    "golemcore": "*",
    "hbm": "*",
    "minecraft": "${minecraft_range}",
    "java": ">=${java_version}"
  }
}
```

Add a `client` entrypoint for client set-up, and a `fabric-gametest` entrypoint for GameTests below 26.1 (see
[Mod entry](../mod-entry/#fabric) and [Testing](../testing/#registering-per-loader)).

Every loader needs `pack.mcmeta`. The pack format key changed in 26.1 (`min_format`/`max_format` instead of
`pack_format`), so the buildscripts fill it in:

```json title="src/main/resources/pack.mcmeta"
{
    "pack": {
        "description": "${mod_name}",
        ${pack_format_entry}
    }
}
```

A wrong key here makes the game reject the whole pack: every recipe, tag and loot table of your mod silently disappears.

## Dejson lists

`gradle/dejson-classes.txt` names every class whose static fields or `declare()` method state models, loot, tags or
crafting recipes. `gradle/dejson-authored.txt` names hand-written JSON files that sit in folders Dejson owns. Both may
start empty (comments start with `#`). See
[Registering content](../registering-content/#dejson-what-to-declare-and-what-to-author).

## Package and namespace

- **Use your own Java package.** NeoForge loads mods as Java modules, and no package may be split between your jar and
  HBM's. Never put a class in `com.hbm.*`.
- **Use your own namespace** for everything you register and every data file you ship. Content ported from another mod
  keeps its path under your namespace (`ntmspace:moon_rock`). Never register into `hbm:`.
- To change HBM's own content, use [substitution](../substitution/), recipe removals, data map patches and fluid
  property patches, each in your own namespace.

## Building

```bash
./gradlew :26.1-neoforge:compileJava   # fastest check of the active node
./gradlew :26.1-neoforge:runClient
./gradlew chiseledBuild                # every node
./gradlew "Reset active project"       # back to 26.1 NeoForge before committing
```

Stonecutter rewrites `src/` in place for the active node. Commit only with the `vcsVersion` node (26.1 NeoForge)
active.
