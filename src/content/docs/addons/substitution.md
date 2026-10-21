---
title: Substitution
description: "Replacing an HBM block, item or block entity type under its own id with Golem Core's Substitutions, and subclassing HBM classes."
sidebar:
  order: 5
---

For a small change to how HBM behaves, use a [hook](../hooks/). To rewrite what an HBM block, item or block entity
**is**, substitute it: your factory builds the entry under HBM's own id, before the registries are filled. Worlds,
recipes, tags and HBM's own references keep working, because the id and the field are unchanged.

## The API

`dev.golem.core.registry.Substitutions`:

```java
// id's block is built by factory, given the block properties HBM's own registration states
public static void block(String owner, String id, Function<BlockBehaviour.Properties, ? extends Block> factory)

// id's item is built by factory, given the item properties HBM's own registration states
public static void item(String owner, String id, Function<Item.Properties, ? extends Item> factory)

// any other registry ("block_entity_type", "menu", ...): factory receives the entry's ResourceKey and
// replaces the registration's whole factory
public static <T> void entry(String owner, String registry, String id, Function<ResourceKey<T>, ? extends T> factory)
```

`owner` is your mod id. Call these from your `ModEntry.substitute()`. On Fabric that runs before any mod's declarations;
on NeoForge and Forge, before any registry is filled.

## Rules

- **The substitute must be a subclass** of the class it replaces. HBM's fields are typed by that class.
- **One id, one mod.** A second substitution of the same id fails at start-up, naming both mods. Two addons can never
  silently overwrite each other.
- A substitution that matches no registration is reported when the registries are filled, and every applied one is
  logged.

## A block

NTM: Space makes HBM's fan sealable-aware. Same id, HBM's own properties, NTM: Space's subclass:

```java title="com/ntmspace/SpaceEntry.java"
@Override
public void substitute() {
    Substitutions.block(NtmSpace.MOD_ID, "hbm:fan", SpaceMachineFan::new);
}
```

```java title="com/ntmspace/block/SpaceMachineFan.java"
public class SpaceMachineFan extends MachineFan implements BlockSealable {

    public SpaceMachineFan(Properties properties) {
        super(properties, () -> ModBlockEntities.MACHINE_FAN.get());
    }

    @Override
    public boolean isSealed(Level level, BlockPos pos) {
        return false;
    }
}
```

## A block and its block entity type

NTM: Space turns the LPW-2 into an orbital station engine. It replaces the block and the block entity type, and keeps
HBM's renderer:

```java title="com/ntmspace/block/station/SpaceMachineLPW2.java (shortened)"
public static void substitute() {
    Substitutions.block(NtmSpace.MOD_ID, "hbm:machine_lpw2", SpaceMachineLPW2::new);
    Substitutions.<BlockEntityType<?>>entry(NtmSpace.MOD_ID, "block_entity_type", "hbm:machine_lpw2",
            key -> BlockEntities.ticking(TileEntityMachineLPW2Space::new, TileEntityMachineLPW2Space::clientTick,
                    TileEntityMachineLPW2Space::serverTick, ModPowerGenBlocks.MACHINE_LPW2.get()));
}
```

## Subclassing HBM block entities

HBM's block entity classes are not `final`. Where an addon needs it, a class has a protected constructor taking the
type, so a subclass can pass HBM's own type:

```java
// HBM
public TileEntityMachineLPW2(BlockPos pos, BlockState state)
protected TileEntityMachineLPW2(BlockEntityType<?> type, BlockPos pos, BlockState state)
```

```java title="com/ntmspace/tileentity/station/TileEntityMachineLPW2Space.java (shortened)"
public class TileEntityMachineLPW2Space extends TileEntityMachineLPW2 implements Propulsion, IFluidStandardReceiverMK2 {

    public TileEntityMachineLPW2Space(BlockPos pos, BlockState state) {
        super(ModPowerGenBlockEntities.LPW2.get(), pos, state);
    }
}
```

If a class you need to subclass lacks such a constructor, ask for one to be added rather than working around it.

## An item

```java
Substitutions.item(NtmSpace.MOD_ID, "hbm:oil_detector", SpaceOilDetector::new);
```

## Testing a substitution

NTM: Space's GameTest `fan_substitution` checks that `ModMachineBlocks.fan.get()` is the substitute and that it still
creates HBM's fan block entity. The probe addon's `-Pprobe.doubleSubstitution=true` run substitutes `hbm:fan` a second
time, which must make start-up fail with an error naming both mods.
