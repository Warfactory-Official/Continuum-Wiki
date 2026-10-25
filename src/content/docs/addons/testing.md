---
title: Testing
description: "Declaring GameTests with Golem Core, running them on every node, and building all six targets."
sidebar:
  order: 13
---

A green build proves little: most addon bugs are silent. Check a positive signal (a recipe count, a log line, a test that
asserts the value) and test on all six nodes.

## Declaring GameTests

Golem Core's `dev.golem.core.gametest.GameTests` declares tests once; they run on every loader.

```java title="com/ntmspace/gametest/SpaceGameTests.java (shortened)"
public final class SpaceGameTests {

    public static final GameTests.Suite TESTS = GameTests.suite(NtmSpace.MOD_ID);

    public static final GameTests.Function FAN_SUBSTITUTION = TESTS.function("fan_substitution", 20,
            () -> SpaceGameTests::fanSubstitution);

    private static void fanSubstitution(GameTestHelper helper) {
        Block fan = ModMachineBlocks.fan.get();
        if (!(fan instanceof SpaceMachineFan)) {
            fail(helper, "hbm:fan is " + fan.getClass().getName() + ", not NTM: Space's substitute"); // its own helper
            return;
        }
        helper.succeed();
    }
}
```

| Call | Does |
|---|---|
| `GameTests.suite(namespace)` | a suite; test ids are `<namespace>:<name>` |
| `suite.function(name, timeoutTicks, () -> body)` | declares a test; `body` is a `Consumer<GameTestHelper>` |
| `suite.function(name, timeoutTicks, padding, () -> body)` | the same with `padding` blocks of free space around its plot (for large structures) |

Keep every test class in your GameTest package (the one `golem.build.releaseJar.testPackages` names; classes whose name
contains `GameTest` are dropped wherever they are). The uploaded jar leaves them out, and the `release-jar` task fails if
any shipped class still names one. So never initialise or register a suite from your entry or `@Mod` class: the
registrations sit in the test package too, where the loaders find them by annotation or entrypoint.

A test whose entity leaves its plot (a rocket in flight) needs the chunks it moves through kept loaded:
`GameTests.holdChunks(helper, minX, maxX, minZ, maxZ)` holds them, relative to the test's origin, until the returned
`Runnable` runs. GameTest ticks run back to back, so a test that waits for chunk generation must wait in real time, not
only in ticks.

`dev.golem.core.gametest.GameTestHelpers` hides version differences inside test bodies: `blockEntity(helper, pos, type)`,
`mockPlayer(helper, GameType)`, and `mockServerPlayerInLevel(helper)`, a survival server player in the level (vanilla's
mock is creative, which skips drops, tool wear and damage).

### Registering per loader

- **NeoForge / Forge:** a class in the test package annotated `@EventBusSubscriber(modid = ...)` (Forge:
  `@Mod.EventBusSubscriber(modid = ..., bus = Bus.MOD)`) initialises the suites on `FMLConstructModEvent` and calls
  `GameTests.register(event, TESTS)` on `RegisterGameTestsEvent`. The run also needs your namespace in
  `neoforge.enabledGameTestNamespaces` / `forge.enabledGameTestNamespaces`.
- **Fabric:** a second `golemcore:entry` in `fabric.mod.json`, a `ModEntry` in the test package whose `declare()`
  initialises the suites. On 26.1 Golem Core then registers them itself.
- **Fabric below 26.1:** also a `fabric-gametest` entrypoint with a `@GameTestGenerator` that returns
  `GameTests.functionsOf(TESTS)`. `release-jar` removes both entrypoint lines from the uploaded `fabric.mod.json`.

```java title="com/ntmspace/gametest/GameTestSetup.java (NeoForge part)"
//? if neoforge {
@EventBusSubscriber(modid = NtmSpace.MOD_ID)
public final class GameTestSetup {

    @SubscribeEvent
    public static void construct(FMLConstructModEvent event) {
        SpaceGameTests.initAll();
    }

    @SubscribeEvent
    public static void register(RegisterGameTestsEvent event) {
        GameTests.register(event, SpaceGameTests.TESTS);
    }
}
//?}
```

```json title="fabric.mod.json (entrypoints)"
"golemcore:entry": ["com.ntmspace.SpaceEntry", "com.ntmspace.gametest.GameTestEntry"],
"fabric-gametest": ["com.ntmspace.platform.fabric.FabricGameTests"]
```

```java title="com/ntmspace/platform/fabric/FabricGameTests.java"
public final class FabricGameTests {

    public FabricGameTests() {}

    //? if fabric && <26.1 {
    /*@net.minecraft.gametest.framework.GameTestGenerator
    public static java.util.Collection<net.minecraft.gametest.framework.TestFunction> generate() {
        com.ntmspace.gametest.SpaceGameTests.initAll();
        return dev.golem.core.gametest.GameTests.functionsOf(com.ntmspace.gametest.SpaceGameTests.TESTS);
    }
    *///?}
}
```

## Running

```bash
./gradlew :26.1-neoforge:runGameTestServer                      # NeoForge and Forge
./gradlew :1.21.1-fabric:runGametest                            # Fabric
./gradlew :26.1-neoforge:runGameTestServer -Pgametest.filter="ntmspace:fan_.*"
```

`-Pgametest.filter=<regex>` is passed to the run as `-Dgolem.gametest.filter` and selects test ids by regular
expression. NTM: Space's default filter is `(ntmspace|ntmprobe):.*`, so its runs skip HBM's own tests. Delete the run's
`world` folder before each run (NTM: Space's buildscripts do this) so every run starts from an empty world.

GameTests are timing-sensitive under load. Re-run a failing test before blaming your change.

## Building every node

```bash
./gradlew chiseledBuild           # builds all six nodes
./gradlew :26.1-neoforge:compileJava
./gradlew :26.1-neoforge:dejsonVerify
./gradlew "Reset active project"  # back to the vcsVersion node before committing
```

Stonecutter rewrites `src/` in place for the active node, so only one node compiles at a time; `chiseledBuild` switches
between them. Each node runs on its own Java (25, 21, 17). Only `runClient` catches model, texture and renderer faults,
and only `runServer` (or a GameTest run) catches datapack and loot faults. After changing anything you can click (a
menu, a block interaction), open it in game on each loader.

## Scripted client checks

Golem Core's harness drives real dev clients and takes screenshots. A project from the
[template generator](../../getting-started/template-generator/) is ready for it: `harness.json` names its nodes, scenarios
go in `harness/scenarios` (the example content comes with `ExampleBlock.java`), and `harness/harness` runs the CLI.

```bash
./harness/harness up --nodes 26.1-neoforge,26.1-fabric   # build, capture the launch, start two clients in a test world
./harness/harness run ExampleBlock.java                    # report and screenshots in harness/out/runs/
./harness/harness down
```

On Windows use Git Bash; `harness\harness.cmd` works too, but cmd mangles JSON arguments. The CLI needs Java 21 or newer.

The regular Golem Core jar has no harness in it. The wrapper downloads the CLI from the Golem Core release named by
`deps.golemcore` in `gradle.properties`, and harness launches run on that release's `-dev` jars (the same Golem Core with
the harness kept). Golem Core releases after 1.0.1 carry them; with `deps.golemcore=1.0.1` the harness cannot start.
Writing scenarios and every
command: `harness/README.md` in the [Golem Core repository](https://github.com/Warfactory-Official/Golem-Core).

:::note
The harness is built for AI coding assistants doing automated testing: an assistant can boot the clients, run a
scenario, and read the report and screenshots without a person at the keyboard. For a quick check of your own, opening
the game and trying it by hand is usually faster.
:::
