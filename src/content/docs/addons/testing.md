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

Initialise the suite classes from `declare()`.

A test whose entity leaves its plot (a rocket in flight) needs the chunks it moves through kept loaded:
`GameTests.holdChunks(helper, minX, maxX, minZ, maxZ)` holds them, relative to the test's origin, until the returned
`Runnable` runs. GameTest ticks run back to back, so a test that waits for chunk generation must wait in real time, not
only in ticks.

### Registering per loader

- **NeoForge / Forge:** from your `@Mod` constructor, `bus.addListener((RegisterGameTestsEvent event) ->
  GameTests.register(event, TESTS))` (see [Mod entry](../mod-entry/)). The run also needs your namespace in
  `neoforge.enabledGameTestNamespaces` / `forge.enabledGameTestNamespaces`.
- **Fabric 26.1:** Golem Core registers every declared suite itself.
- **Fabric below 26.1:** a `fabric-gametest` entrypoint with a `@GameTestGenerator` that returns
  `GameTests.functionsOf(TESTS)`:

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

HBM and NTM: Space use a shared harness that drives real dev clients and takes screenshots: `../Golem-Core/harness/harness`,
configured by your project's `harness.json`, with scenarios in `harness/scenarios`. See `Golem-Core/harness/README.md` in
the Golem Core repository for setup.

:::note
The harness is built for AI coding assistants doing automated testing: an assistant can boot the clients, run a
scenario, and read the report and screenshots without a person at the keyboard. For a quick check of your own, opening
the game and trying it by hand is usually faster.
:::
