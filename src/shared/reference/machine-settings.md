---
title: Machine settings
description: "Every hbmMachines.json entry and key, with defaults: power, tanks, speeds and heat of 26 machines."
sidebar:
  order: 5
---

`config/hbmConfig/hbmMachines.json` holds the per-machine numbers 1.7 made configurable: buffers, tank sizes, speeds,
heat values and oil yields of 26 machines. It is a config file, not a datapack: it applies to the whole game or server
and is read once when the game starts. The game then writes it back with every key, so a missing key gets its default.
The format is 1.7's, so a 1.7 file carries over.

On a dedicated server, the server's file counts: joining players receive its values, so their menus and tooltips show
the server's numbers.

Each machine is one entry. Keys start with 1.7's type tag: `I:` integer, `L:` long integer, `D:` decimal, `B:` true or
false, `D[:` a list of decimals, `M:` a nested object. `INFO` keys are comments.

```json title="config/hbmConfig/hbmMachines.json (part)"
{
  "centrifuge": { "I:powerCap": 100000, "I:timeToProcess": 100, "I:consumption": 200 },
  "waterpump": { "I:groundHeight": 70, "I:groundDepth": 4, "I:steamSpeed": 1000, "I:electricSpeed": 10000 }
}
```

Changes apply after a restart. Tank sizes are read when a machine is placed or loaded.

## Entries

### Centrifuge

Entry `centrifuge`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:powerCap` | int | 100000 | HE buffer |
| `I:timeToProcess` | int | 200 | ticks per operation |
| `I:consumption` | int | 200 | HE/t base (upgrades add multiples of it) |

### Diesel generator

Entry `dieselgen`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `L:powerCap` | long | 50000 | HE buffer (new generators; a placed one keeps its saved `powerCap`) |
| `I:fuelCap` | int | 16000 | fuel tank mB |
| `INFO` | string | `Fuel grades in order: LOW MEDIUM HIGH AERO GAS` | comment |
| `D[:efficiency` | double[5] | `[0.0, 0.5, 0.75, 0.1, 0.0]` | HE multiplier per fuel grade, in INFO order; LOW never burns whatever its value |

### Radar

Entry `radar`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `L:powerCap` | long | 100000 | HE buffer |
| `L:consumption` | long | 500 | HE/t |
| `I:radarRange` | int | 1000 | scan range, blocks |
| `I:radarBuffer` | int | 30 | entities must be this many blocks above the radar |
| `I:radarAltitude` | int | 55 | radar must stand at or above this Y |
| `I:chunkLoadCap` | int | 10 | map chunks loaded per tick; read only, never written (1.7) |
| `B:generateChunks` | bool | false | the map may generate missing chunks |

### Large radar

Entry `radar_large`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:radarLargeRange` | int | 3000 | large radar scan range |

### Forcefield emitter

Entry `forcefield`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `L:powerCap` | long | 1000000 | HE buffer |
| `I:baseConsumption` | int | 1000 | HE/t base |
| `I:radiusConsumption` | int | 500 | HE/t per radius upgrade |
| `I:shieldConsumption` | int | 250 | HE/t per shield upgrade |
| `I:baseRadius` | int | 16 | radius without upgrades |
| `I:radiusUpgrade` | int | 16 | radius per upgrade |
| `I:shieldUpgrade` | int | 50 | shield HP per upgrade |
| `D:cooldownModifier` | double | 1.0 | shield cooldown multiplier |
| `D:healthRegenModifier` | double | 1.0 | shield regen multiplier |

### Rotary furnace

Entry `rotaryfurnace`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `M:burnModule` | object | see burn module | fuel class multipliers (time = burn time, heat = progress per fuel) |

### ICF laser controller

Entry `icfLaser`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:capacitorPower` | int | 2500000 | HE per capacitor |
| `I:turboPower` | int | 5000000 | HE per turbocharger |

### Firebox

Entry `firebox`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:baseHeat` | int | 100 | TU/t while burning |
| `D:burnTimeMult` | double | 1.0 | burn time multiplier |
| `I:heatCap` | int | 100000 | TU buffer |
| `M:burnModule` | object | see burn module | fuel class multipliers |

### Heating oven

Entry `heatingoven`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:baseHeat` | int | 500 | TU/t while burning |
| `D:burnTimeMult` | double | 0.125 | burn time multiplier |
| `D:heatPullEff` | double | 0.5 | share of heat pulled from the source below that is kept |
| `I:heatCap` | int | 500000 | TU buffer |
| `M:burnModule` | object | see burn module | fuel class multipliers |

### Ashpit

Entry `ashpit`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:thresholdWood` | int | 2000 | ash points per wood ash item |
| `I:thresholdCoal` | int | 2000 | per coal ash |
| `I:thresholdMisc` | int | 2000 | per misc ash |
| `I:thresholdFly` | int | 2000 | per fly ash |
| `I:thresholdSoot` | int | 8000 | per soot |

### Stirling engine

Entry `stirling`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `D:diffusion` | double | 0.1 | share of the heat source's stored heat taken per tick |
| `D:efficiency` | double | 0.5 | HE per TU |
| `I:maxHeatNormal` | int | 300 | TU/t before the normal gear overspeeds |
| `I:maxHeatSteel` | int | 1500 | TU/t limit with the steel gear |
| `I:overspeedLimit` | int | 300 | overspeed ticks before the gear breaks |

### Crucible

Entry `crucible`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:recipeCapacity` | int | 10368 | recipe stack capacity, quanta (16 blocks) |
| `I:wasteCapacity` | int | 10368 | waste stack capacity, quanta |
| `I:processHeat` | int | 20000 | heat per alloying operation |
| `D:diffusion` | double | 0.25 | share of the heat difference pulled from below |
| `I:heatCap` | int | 100000 | TU buffer |

### Boiler

Entry `boiler`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:maxHeat` | int | 3200000 | TU buffer |
| `D:diffusion` | double | 0.1 | share of the heat difference pulled from below |
| `B:canExplode` | bool | true | bursts when steam has nowhere to go |

### Industrial boiler

Entry `boilerIndustrial`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:maxHeat` | int | 12800000 | TU buffer |
| `D:diffusion` | double | 0.1 | heat pull share |

### Groundwater pumps (steam and electric)

Entry `waterpump`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:groundHeight` | int | 70 | pumps work only at or below this Y |
| `I:groundDepth` | int | 4 | blocks below that must be ground |
| `I:steamSpeed` | int | 1000 | steam pump mB water per operation (tank 100x) |
| `I:electricSpeed` | int | 10000 | electric pump mB per operation (tank 100x) |

### Steam condenser

Entry `condenser`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:inputTankSize` | int | 100 | spent steam tank mB |
| `I:outputTankSize` | int | 100 | water tank mB |

### Auxiliary cooling tower

Entry `condenserTowerSmall`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:inputTankSize` | int | 1000 | auxiliary cooling tower, spent steam mB |
| `I:outputTankSize` | int | 1000 | water mB |

### Cooling tower

Entry `condenserTowerLarge`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:inputTankSize` | int | 10000 | cooling tower, spent steam mB |
| `I:outputTankSize` | int | 10000 | water mB |

### High-power condenser

Entry `condenserPowered`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `L:maxPower` | long | 10000000 | HE buffer |
| `I:inputTankSize` | int | 1000000 | spent steam mB |
| `I:outputTankSize` | int | 1000000 | water mB |
| `I:powerConsumption` | int | 10 | HE per mB condensed |

### Steam engine

Entry `steamengine`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:steamCap` | int | 2000 | steam tank mB |
| `I:ldsCap` | int | 20 | spent steam tank mB |
| `D:efficiency` | double | 0.85 | HE per TU released |

### Industrial steam turbine

Entry `steamturbineIndustrialMk2`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `INFO` | string | `industrial steam turbine consumes 20% of available steam per tick` | comment |
| `I:inputTankSize` | int | 750000 | steam mB |
| `I:outputTankSize` | int | 3000000 | output mB |
| `D:efficiency` | double | 1.0 | HE per TU |

### Leviathan steam turbine

Entry `steamturbineLeviathan`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `INFO` | string | `leviathan steam turbine consumes all availible steam per tick` | comment |
| `I:inputTankSize` | int | 1000000000 | steam mB |
| `I:outputTankSize` | int | 1000000000 | output mB |
| `D:efficiency` | double | 0.85 | HE per TU |

### Oil derrick

Entry `derrick`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:powerCap` | int | 100000 | HE buffer |
| `I:consumption` | int | 100 | HE per working tick |
| `I:delay` | int | 50 | ticks per drill step |
| `I:oilPerDeposit` | int | 500 | oil mB per suck (times the deposit's `hbm:fluid_deposit` yield) |
| `I:gasPerDepositMin` | int | 100 | gas mB min per suck (times the secondary yield) |
| `I:gasPerDepositMax` | int | 500 | gas mB max |
| `D:drainChance` | double | 0.05 | chance a suck empties the deposit (times its drain) |

### Pumpjack

Entry `pumpjack`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:powerCap` | int | 250000 | as the oil derrick |
| `I:consumption` | int | 200 | as the oil derrick |
| `I:delay` | int | 25 | as the oil derrick |
| `I:oilPerDeposit` | int | 750 | as the oil derrick |
| `I:gasPerDepositMin` | int | 50 | as the oil derrick |
| `I:gasPerDepositMax` | int | 250 | as the oil derrick |
| `D:drainChance` | double | 0.025 | as the oil derrick |

### Hydraulic fracking tower

Entry `frackingtower`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `I:powerCap` | int | 5000000 | HE buffer |
| `I:consumption` | int | 5000 | HE per working tick |
| `I:solutionRequired` | int | 10 | fracking solution mB per suck |
| `I:delay` | int | 20 | ticks per drill step |
| `I:oilPerDeposit` | int | 1000 | as derrick, normal deposits |
| `I:gasPerDepositMin` | int | 100 |  |
| `I:gasPerDepositMax` | int | 500 |  |
| `D:drainChance` | double | 0.02 |  |
| `I:oilPerBedrockDeposit` | int | 100 | oil from a fracking-only deposit (bedrock oil) |
| `I:gasPerBedrockDepositMin` | int | 10 | gas min from it |
| `I:gasPerBedrockDepositMax` | int | 50 | gas max from it |
| `I:destructionRange` | int | 75 | oil-spot blight radius per suck |

### MHD turbine

Entry `mhd-turbine`.

| Key | Type | Default | What it does |
|---|---|---|---|
| `L:minimumPlasma` | long | 5000000 | TU/t of plasma below which the turbine yields half |

## Burn module

The firebox, heating oven and rotary furnace have an `M:burnModule` object: how long each class of fuel burns and how
much heat it gives, as multipliers. Sixteen keys: `D:timeLog`, `D:timeWood`, `D:timeCoal`, `D:timeLignite`, `D:timeCoke`,
`D:timeSolid`, `D:timeRocket`, `D:timeBalefire`, then `D:heatLog`, `D:heatWood`, `D:heatCoal`, `D:heatLignite`,
`D:heatCoke`, `D:heatSolid`, `D:heatRocket` and `D:heatBalefie` (1.7's spelling).

| Machine | time log, wood, coal, lignite, coke, solid, rocket, balefire | heat log, wood, coal, lignite, coke, solid, rocket, balefire |
|---|---|---|
| Firebox, heating oven | 1, 1, 1.25, 1.25, 1.25, 1.5, 1.5, 0.5 | 1, 1, 2, 2, 2, 3, 5, 15 |
| Rotary furnace | 1, 1, 1, 1, 1.25, 1.5, 1.5, 1.5 | 1, 1, 1, 1, 1, 1.5, 3, 10 |

As in 1.7, the module is only read when the entry also has a key named plain `burnModule` (any value). Editing
`M:burnModule` alone changes nothing; add `"burnModule": true` to the entry as well.

## Oddities kept from 1.7

- The radar reads `I:chunkLoadCap` but never writes it: add the key yourself to change it.
- The diesel generator's `L:powerCap` applies to newly placed generators; a placed one keeps the buffer it was saved with.
- The fracking tower's bedrock values apply to fracking-only deposits (bedrock oil): it gives
  `oilPerDeposit × the deposit's yield × oilPerBedrockDeposit / 100` oil, and gas likewise with `/ 10` and `/ 50`.
  With HBM's deposits and defaults that is exactly `oilPerBedrockDeposit`. Deposit yields are the
  [fluid_deposit](../../data-maps/world/#fluid_deposit) data map.

Addon mods add their own machines to this file with `MachineDynConfig.register` (see
[Registries](../../../addons/registries/)).
