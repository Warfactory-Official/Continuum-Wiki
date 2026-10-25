---
title: Mod entry
description: "The ModEntry start-up phases every Golem-based mod uses, and how NeoForge, Forge and Fabric call them."
sidebar:
  order: 3
---

Every Golem-based mod starts through `dev.golem.core.platform.ModEntry`. Golem Core runs the phases in the same order,
for every mod, on every loader, and fills the registries itself, once, from every mod's registers. Never flush a
register or a payload yourself.

```java
public interface ModEntry {
    default void substitute() {}
    void declare();
    default void registered() {}
}
```

| Phase | Runs | Use it to |
|---|---|---|
| `substitute()` | before any mod's registers are filled into the registries | replace another mod's block, item or other entry ([Substitution](../substitution/)) |
| `declare()` | before any registry is filled; nothing in a registry exists yet | fill your registers; declare payloads, recipe tables, data maps, fluids, hook listeners, script bindings |
| `registered()` | after every mod's registers are in the registries | work that needs registered objects (furnace fuels, lookups by id) |

Because your mod is ordered after `hbm`, your `declare()` runs after HBM's. Listeners registered in `declare()` are
therefore ordered after HBM's own in the same hook phase (dependencies first, on every loader).

## NTM: Space's entry

```java title="com/ntmspace/SpaceEntry.java (shortened)"
public final class SpaceEntry implements ModEntry {

    @Override
    public void substitute() {
        Substitutions.block(NtmSpace.MOD_ID, "hbm:fan", SpaceMachineFan::new);
        Substitutions.item(NtmSpace.MOD_ID, "hbm:oil_detector", SpaceOilDetector::new);
    }

    @Override
    public void declare() {
        SpaceFluids.init();
        SpaceBlocks.init();
        SpaceDimensions.init();
        SpaceEnvironment.init();
        // ... every registration class, in registry order
    }

    @Override
    public void registered() {
        Fuels.register(FloraBlocks.burnTimes());
    }
}
```

A registration class's empty `init()` only forces its static fields (the registration chain) to run in `declare()`.

## NeoForge

NeoForge constructs every mod before any registry is filled. Call `ModEntries.start` from your `@Mod` constructor:
`substitute()` and `declare()` run at once, Golem Core fills each registry from its own `RegisterEvent` listener, and
`registered()` runs in Golem Core's common setup.

```java title="com/ntmspace/platform/neoforge/NeoForgeInit.java"
//? if neoforge {
@Mod(NtmSpace.MOD_ID)
public final class NeoForgeInit {

    public NeoForgeInit(IEventBus bus) {
        ModEntries.start(new SpaceEntry());
        if (Platform.isClient()) SpaceClient.init();
    }
}
//?}
```

## Forge 1.20.1

The same call from the Forge `@Mod` constructor. Forge constructs mods in parallel; `ModEntries.start` waits until every
Golem-based mod you order yourself `AFTER` has run its declarations, so Forge declares in NeoForge's order.

GameTests are not registered here: the uploaded jar drops the test classes, so the entry and `@Mod` classes must not
name them (see [Testing](../testing/#registering-per-loader)).

```java title="com/ntmspace/platform/forge/ForgeInit.java"
//? if forge {
/*@Mod(NtmSpace.MOD_ID)
public final class ForgeInit {

    public ForgeInit() {
        ModEntries.start(new SpaceEntry());
        if (Platform.isClient()) SpaceClient.init();
    }
}
*///?}
```

## Fabric

Fabric has no deferred registration and does not run `main` entrypoints in dependency order. List your `ModEntry` class
under the `golemcore:entry` entrypoint (`ModEntries.FABRIC_ENTRYPOINT`) instead of `main`:

```json title="fabric.mod.json"
"entrypoints": {
  "golemcore:entry": ["com.ntmspace.SpaceEntry"],
  "client": ["com.ntmspace.platform.fabric.FabricClientInit"]
}
```

Golem Core's own `main` entrypoint runs every mod's `substitute()`, then every mod's `declare()` (dependencies first),
fills the registries, entity attributes, spawn placements and payloads once, then runs every `registered()`. Calling
`ModEntries.start` on Fabric throws.

Client set-up goes in an ordinary Fabric `client` entrypoint:

```java title="com/ntmspace/platform/fabric/FabricClientInit.java"
//? if fabric {
/*public final class FabricClientInit implements ClientModInitializer {
    @Override
    public void onInitializeClient() {
        SpaceClient.init();
    }
}
*///?}
```

Fabric runs `client` entrypoints in no defined order. A client hook listener that must run after another mod's goes in a
phase ordered after the default one (see [Hooks](../hooks/)).

## Client set-up

NTM: Space keeps all client work in one class, `SpaceClient.init()`, called from the NeoForge and Forge constructors
(when `dev.golem.core.platform.Platform.isClient()`) and from the Fabric `client` entrypoint. It and the client classes
it calls register screens and renderers, HUD overlays, sky layers, fluid droplet sprites (`FluidSprites.install(ns)`),
custom item renderers (`CustomItemRenderers.register`) and `MachineItemNamespaces.add(ns)`. The Golem Core calls are
listed under [Client registrations](../registering-content/#client-registrations).

Two Golem Core calls make 26.1 model features work below 26.1 for your namespace, and HBM makes them only for `hbm`:

- `dev.golem.core.client.Tints.install(ns)`: item tints declared in item definitions (`.tints(...)` on a preset).
- `dev.golem.core.client.BlockLayers.install(ns)`: a block model's `render_type` (cutout, translucent) as the chunk
  layer on Fabric below 26.1, where the model's own `render_type` is ignored. Without it, a cutout block draws its
  transparent pixels as a solid plate on 1.20.1 and 1.21.1 Fabric.

Both are no-ops where they are not needed, so call them on every node.
