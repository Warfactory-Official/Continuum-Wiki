---
title: Scripting surface
description: "Offering your addon's own KubeJS bindings and events through Golem Core's neutral Scripts API, with no KubeJS dependency."
sidebar:
  order: 12
---

HBM has no KubeJS dependency, and neither should your addon. A mod states what it offers to scripts once, through Golem
Core's neutral `dev.golem.core.script.Scripts`, and Golem Core's adapter turns that into KubeJS on the nodes KubeJS exists
for (26.1 NeoForge, 1.21.1 NeoForge, 1.20.1 Forge and Fabric). Elsewhere every call is a cheap no-op. For the pack-maker
side, see [KubeJS setup](../../kubejs/setup/).

## What you get for free

- Every table declared with `RecipeTables`, `DataGenericRecipes` or `DataRecipeTable` is a KubeJS recipe type
  (`event.recipes.<ns>.<table>(...)`). State its fields with `Table.fields(RecipeFields)` for typed builder arguments
  (see [Recipes and data](../recipes-and-data/#script-fields)).
- A fluid from `Fluids.register` is in `HBM.fluids()`; a material from `Mats.register` is in `HBM.materials()`.
- HBM's `HBMEvents` already cover explosions, bombs, missiles, finished machine recipes and irradiation.

## The API

```java
public final class Scripts {
    public static synchronized void binding(String name, Supplier<?> value);
    public static synchronized Group group(String name);
    public static synchronized void onStartupScriptsLoaded(Runnable work);
    public static boolean available();

    public static final class Group {
        public <T> ScriptEvent<T> server(String event, Class<T> payload);
        public <T> ScriptEvent<T> startup(String event, Class<T> payload);
        public <T> ScriptEvent<T> client(String event, Class<T> payload);
        public <T> ScriptEvent<T> common(String event, Class<T> payload);
    }
}

public final class ScriptEvent<T> {
    public boolean active();       // could a script hear it now?
    public void post(T value);     // never throws
}
```

| Call | Does |
|---|---|
| `binding(name, supplier)` | adds the global `name` to every script (startup, server, client); names are unique across mods |
| `group(name)` | the event group `name`, a script global such as `HBMEvents`; the same group for the same name |
| `group.server/startup/client/common(event, Payload.class)` | declares an observe-only event in that group |
| `onStartupScriptsLoaded(work)` | runs once, right after startup scripts ran, before any datapack loads; never runs without an adapter |
| `available()` | whether a scripting adapter is installed |

Declare at mod construction, from your `declare()`, never with a KubeJS type.

## Events

Script events are observe-only: scripts read the payload and cannot cancel or change what happens. A payload should be
a small immutable record of plain values and game objects (level, entity, position, ids); scripts see its record
accessors and public getters as properties (`event.radius`). Never hand a script a live internal object.

Make the moment a Java [hook](../hooks/) first, so addon mods see it too, then forward it to the script event. Register
the forwarding listener in `onStartupScriptsLoaded`, so without KubeJS the hook keeps no listener at all. This is what
HBM does:

```java title="com/hbm/api/script/HbmScripts.java (shortened)"
public static final Scripts.Group EVENTS = Scripts.group("HBMEvents");

public record NuclearBlast(ServerLevel level, double x, double z, float radius) {}

public static final ScriptEvent<NuclearBlast> NUCLEAR_BLAST = EVENTS.server("nuclearBlast", NuclearBlast.class);
public static final ScriptEvent<HbmEvents.Explosion> EXPLOSION = EVENTS.server("explosion", HbmEvents.Explosion.class);

public static void declare() {
    Scripts.binding("HBM", () -> HbmScriptApi.INSTANCE);
    Scripts.onStartupScriptsLoaded(HbmScripts::startupScriptsLoaded);
}

private static void startupScriptsLoaded() {
    Environment.NUCLEAR_BLAST.register((level, x, z, radius) -> {
        if (NUCLEAR_BLAST.active()) NUCLEAR_BLAST.post(new NuclearBlast(level, x, z, radius));
    });
    HbmEvents.EXPLOSION.register(event -> {
        if (EXPLOSION.active()) EXPLOSION.post(event);
    });
}
```

Scripts then use `HBMEvents.nuclearBlast(event => ...)` in a server script. `post` costs one check when no script
listens; check `active()` before building an expensive payload.

## Bindings

A binding is a global object with plain values in and out. HBM's `HBM` global is `com.hbm.api.script.HbmScriptApi`.
Setters on a binding should do nothing on a client.

## Startup events

A `startup` event is posted once, from `onStartupScriptsLoaded`, while the game starts. HBM's `HBMEvents.registry` hands
startup scripts a registry object, collects what they asked for, and applies it once every mod's registers are filled
(from `registered()`), whichever of the two comes last.

## Ordering

`kubejs-order.gradle.kts` adds an optional `kubejs` dependency with ordering `BEFORE` to your NeoForge and Forge
metadata, so your declarations exist before KubeJS reads them. On Fabric the adapter runs the pending Golem declarations
itself. Apply the script in each Forge-like buildscript (see [Project setup](../project-setup/#the-shared-build-scripts)).

## Dev runs

`-Pkubejs.run=true` adds KubeJS to the client, server and GameTest runs on the four nodes that have it (NTM: Space's
buildscripts also copy `harness/kubejs` into each run's `kubejs/` folder). On 26.1 NeoForge, KubeJS 8.0.6 crashes with
NeoForge 26.1.2.110 or newer, so dev runs use `deps.neoforge_kubejs=26.1.2.109`.
