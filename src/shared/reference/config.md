---
title: Config files
description: Every hbm.cfg key, every hbmServer.json key and every RBMK gamerule, with defaults.
sidebar:
  order: 4
---

These settings live in config files and gamerules, not in datapacks. This page is generated from the mod's source by `scripts/gen-config-reference.py`, so it lists exactly what NTM - Continuum writes.

| Where | Applies to | When changes apply |
|---|---|---|
| `config/hbm.cfg` | The whole game or server | Restart |
| `config/hbmConfig/hbmServer.json` | The whole server | Restart, or `/ntmserver set` in game |
| RBMK gamerules | One world | At once (`/gamerule`) |

Other config files: `hbmClient.json` (client display settings, `/ntmclient`), [`hbmMachines.json`](../machine-settings/) (per-machine values), `hbmRadResist.json` (radiation resistance per item) and the [custom machine files](../../data/custom-machines/).

## hbm.cfg

1.7's main config: 313 keys in 20 categories, with 1.7's names, so a 1.7 file carries over. Keys 1.7 had that do nothing in Continuum are not written. The game writes every key with its default the first time it starts.

### General

Category `01_general`.

| Key | Default | Description |
|---|---|---|
| `1.01_enableMyceliumSpread` | `false` | Allows glowing mycelium to spread |
| `1.02_enablePlutoniumNetherOre` | `false` | Enables plutonium ore generation in the nether |
| `1.03_enableDungeonSpawn` | `flag` | Allows structures and dungeons to spawn. Valid values are true\|false\|flag - flag will respect the "Generate Structures" world flag. |
| `1.05_enableLandmineSpawn` | `true` | Allows landmines to generate |
| `1.06_enableRadHotspotSpawn` | `true` | Allows radiation hotspots to generate |
| `1.14_enableBomberShortMode` | `false` | Has bomber planes spawn in closer to the target for use with smaller render distances |
| `1.15_enableVaultSpawn` | `true` | Allows locked safes to spawn |
| `1.17_enableCataclysm` | `false` | Causes satellites to fall whenever a mob dies |
| `1.18_enableExtendedLogging` | `false` | Logs uses of the detonator, nuclear explosions, missile launches, grenades, etc. |
| `1.20_enableGuns` | `true` | Prevents new system guns to be fired |
| `1.21_enableVirus` | `false` | Allows virus blocks to spread |
| `1.22_enableCrosshairs` | `true` | Shows custom crosshairs when an NTM gun is being held |
| `1.31_enableSkyboxes` | `true` | If enabled, will try to use NTM's custom skyboxes. |
| `1.32_enableImpactWorldProvider` | `true` | If enabled, registers custom world provider which modifies lighting and sky colors for post impact effects. |
| `1.33_enableStatReRegistering` | `true` | If enabled, will re-register item crafting/breaking/usage stats in order to fix a forge bug where modded items just won't show up. |
| `1.34_enableKeybindOverlap` | `true` | If enabled, will handle keybinds that would otherwise be ignored due to overlapping. |
| `1.37_enableGuideBook` | `true` | If enabled, gives players the guide book when joining the world for the first time |
| `1.42_preferredOutputMod` | `hbm` | The mod which is preferred as output when certain machines autogenerate recipes. Currently used for the shredder |
| `1.90_enableRawOres` | `true` | Metal ores drop raw ore items (smelted or processed at two thirds of the ore's yield). False restores the old drops. |
| `1.99_enableExpensiveMode` | `false` | It does what the name implies. |

### Ores

Category `02_ores`.

| Key | Default | Description |
|---|---|---|
| `2.00_uraniumSpawnrate` | `7` | Amount of uranium ore veins per chunk |
| `2.01_titaniumSpawnrate` | `8` | Amount of titanium ore veins per chunk |
| `2.02_sulfurSpawnrate` | `5` | Amount of sulfur ore veins per chunk |
| `2.03_aluminiumSpawnrate` | `7` | Amount of aluminium ore veins per chunk |
| `2.04_copperSpawnrate` | `12` | Amount of copper ore veins per chunk |
| `2.05_fluoriteSpawnrate` | `6` | Amount of fluorite ore veins per chunk |
| `2.06_niterSpawnrate` | `6` | Amount of niter ore veins per chunk |
| `2.07_tungstenSpawnrate` | `10` | Amount of tungsten ore veins per chunk |
| `2.08_leadSpawnrate` | `6` | Amount of lead ore veins per chunk |
| `2.09_berylliumSpawnrate` | `6` | Amount of beryllium ore veins per chunk |
| `2.10_thoriumSpawnrate` | `7` | Amount of thorium ore veins per chunk |
| `2.11_ligniteSpawnrate` | `2` | Amount of lignite ore veins per chunk |
| `2.12_asbestosSpawnRate` | `2` | Amount of asbestos ore veins per chunk |
| `2.13_lithiumSpawnRate` | `6` | Amount of schist lithium ore veins per chunk |
| `2.14_rareEarthSpawnRate` | `6` | Amount of rare earth ore veins per chunk |
| `2.16_gasShaleSpawnRate` | `5` | Amount of oil shale veins per chunk |
| `2.17_gasBubbleSpawnRate` | `12` | Spawns a gas bubble every nTH chunk |
| `2.18_cinnebarSpawnRate` | `1` | Amount of cinnebar ore veins per chunk |
| `2.18_cobaltSpawnRate` | `2` | Amount of cobalt ore veins per chunk |
| `2.19_explosiveBubbleSpawnRate` | `0` | Spawns an explosive gas bubble every nTH chunk |
| `2.20_alexandriteSpawnRate` | `100` | Spawns an alexandrite vein every nTH chunk |
| `2.21_oilSpawnRate` | `100` | Spawns an oil bubble every nTH chunk |
| `2.22_bedrockOilSpawnRate` | `200` | Spawns a bedrock oil node every nTH chunk |
| `2.23_meteoriteSpawnRate` | `200` | Spawns a fallen meteorite every nTH chunk |
| `2.B00_bedrockIronWeight` | `100` | Spawn weight for iron bedrock ore |
| `2.B01_bedrockCopperWeight` | `200` | Spawn weight for copper bedrock ore |
| `2.B02_bedrockBoraxWeight` | `50` | Spawn weight for borax bedrock ore |
| `2.B03_bedrockAsbestosWeight` | `50` | Spawn weight for asbestos bedrock ore |
| `2.B04_bedrockNiobiumWeight` | `50` | Spawn weight for niobium bedrock ore |
| `2.B05_bedrockTitaniumWeight` | `100` | Spawn weight for titanium bedrock ore |
| `2.B06_bedrockTungstenWeight` | `100` | Spawn weight for tungsten bedrock ore |
| `2.B07_bedrockGoldWeight` | `50` | Spawn weight for gold bedrock ore |
| `2.B08_bedrockUraniumWeight` | `35` | Spawn weight for uranium bedrock ore |
| `2.B09_bedrockThoriumWeight` | `50` | Spawn weight for thorium bedrock ore |
| `2.B10_bedrockCoalWeight` | `200` | Spawn weight for coal bedrock ore |
| `2.B11_bedrockNiterWeight` | `50` | Spawn weight for niter bedrock ore |
| `2.B12_bedrockFluoriteWeight` | `50` | Spawn weight for fluorite bedrock ore |
| `2.B13_bedrockRedstoneWeight` | `50` | Spawn weight for redstone bedrock ore |
| `2.B14_bedrockChlorocalciteWeight` | `35` | Spawn weight for chlorocalcite bedrock ore |
| `2.B15_bedrockNeodymiumWeight` | `50` | Spawn weight for neodymium bedrock ore |
| `2.B16_bedrockRareEarthWeight` | `50` | Spawn weight for rare earth bedrock ore |
| `2.B17_bedrockBauxiteWeight` | `100` | Spawn weight for bauxite bedrock ore |
| `2.B18_bedrockEmeraldWeight` | `50` | Spawn weight for emerald bedrock ore |
| `2.BN00_bedrockGlowstoneWeight` | `100` | Spawn weight for glowstone bedrock ore |
| `2.BN01_bedrockPhosphorusWeight` | `50` | Spawn weight for phosphorus bedrock ore |
| `2.BN01_bedrockQuartzWeight` | `100` | Spawn weight for quartz bedrock ore |
| `2.C00_enableSulfurCave` | `true` | Toggles sulfur caves |
| `2.C00_ironClusterSpawn` | `4` | Amount of iron cluster veins per chunk |
| `2.C01_enableAsbestosCave` | `true` | Toggles asbestos caves |
| `2.C01_titaniumClusterSpawn` | `2` | Amount of titanium cluster veins per chunk |
| `2.C02_aluminiumClusterSpawn` | `3` | Amount of aluminium cluster veins per chunk |
| `2.C03_copperClusterSpawn` | `4` | Amount of copper cluster veins per chunk |
| `2.D00_overworldOres` | `true` | General switch for whether overworld ores should be generated. Does not include special structures like oil. |
| `2.D01_netherOres` | `true` | General switch for whether nether ores should be generated. |
| `2.D02_endOres` | `true` | General switch for whether end ores should be generated. Does not include special structures like trixite crystals. |
| `2.E00_tikiteSpawnrate` | `8` | Amount of end trixite per chunk |
| `2.L00_enableHematite` | `true` | Toggles hematite deposits |
| `2.L01_enableMalachite` | `true` | Toggles malachite deposits |
| `2.L02_enableBauxite` | `true` | Toggles bauxite deposits |
| `2.L02_limestoneSpawn` | `1` | Amount of limestone block veins per chunk |
| `2.N00_uraniumSpawnrate` | `8` | Amount of nether uranium per chunk |
| `2.N01_tungstenSpawnrate` | `10` | Amount of nether tungsten per chunk |
| `2.N02_sulfurSpawnrate` | `26` | Amount of nether sulfur per chunk |
| `2.N03_phosphorusSpawnrate` | `24` | Amount of nether phosphorus per chunk |
| `2.N04_coalSpawnrate` | `8` | Amount of nether coal per chunk |
| `2.N05_plutoniumSpawnrate` | `8` | Amount of nether plutonium per chunk, if enabled |
| `2.N06_cobaltSpawnrate` | `2` | Amount of nether cobalt per chunk |

### Nukes

Category `03_nukes`.

| Key | Default | Description |
|---|---|---|
| `3.00_gadgetRadius` | `150` | Radius of the Gadget |
| `3.01_boyRadius` | `120` | Radius of Little Boy |
| `3.02_manRadius` | `175` | Radius of Fat Man |
| `3.03_mikeRadius` | `250` | Radius of Ivy Mike |
| `3.04_tsarRadius` | `500` | Radius of the Tsar Bomba |
| `3.05_prototypeRadius` | `150` | Radius of the Prototype |
| `3.06_fleijaRadius` | `50` | Radius of F.L.E.I.J.A. |
| `3.07_missileRadius` | `100` | Radius of the nuclear missile |
| `3.08_mirvRadius` | `100` | Radius of a MIRV |
| `3.09_fatmanRadius` | `35` | Radius of the Fatman Launcher |
| `3.10_nukaRadius` | `25` | Radius of the nuka grenade |
| `3.11_aSchrabRadius` | `20` | Radius of dropped anti schrabidium |
| `3.12_soliniumRadius` | `150` | Radius of the blue rinse |
| `3.13_n2Radius` | `200` | Radius of the N2 mine |

### Dungeons

Category `04_dungeons`.

| Key | Default | Description |
|---|---|---|
| `4.01_antennaSpawn` | `250` | Spawn antenna on every nTH chunk |
| `4.02_atomSpawn` | `500` | Spawn power plant on every nTH chunk |
| `4.04_dungeonSpawn` | `64` | Spawn library dungeon on every nTH chunk |
| `4.06_satelliteSpawn` | `500` | Spawn satellite dish on every nTH chunk |
| `4.10_dudSpawn` | `500` | Spawn dud on every nTH chunk |
| `4.11_spaceshipSpawn` | `1000` | Spawn spaceship on every nTH chunk |
| `4.12_barrelSpawn` | `5000` | Spawn waste tank on every nTH chunk |
| `4.13_broadcasterSpawn` | `5000` | Spawn corrupt broadcaster on every nTH chunk |
| `4.14_landmineSpawn` | `64` | Spawn AP landmine on every nTH chunk |
| `4.15_radHotspotSpawn` | `5000` | Spawn radiation hotspot on every nTH chunk |
| `4.16_vaultSpawn` | `2500` | Spawn locked safe on every nTH chunk |
| `4.18_geyserChlorineSpawn` | `3000` | Spawn poison geyser on every nTH chunk |
| `4.19_geyserVaporSpawn` | `250` | Spawn vapor geyser on every nTH chunk |
| `4.21_capsuleSpawn` | `100` | Spawn landing capsule on every nTH chunk |
| `4.22_arcticVaultSpawn` | `500` | Spawn arctic code vault on every nTH chunk |
| `4.23_jungleDungeonSpawn` | `2000` | Spawn jungle dungeon on every nTH chunk |
| `4.24_pyramidSpawn` | `4000` | Spawn pyramid on every nTH chunk |

### Meteors

Category `05_meteors`.

| Key | Default | Description |
|---|---|---|
| `5.00_enableMeteorStrikes` | `true` | Toggles the spawning of meteors |
| `5.01_enableMeteorShowers` | `true` | Toggles meteor showers, which start with a 1% chance for every spawned meteor |
| `5.02_enableMeteorTails` | `true` | Toggles the particle effect created by falling meteors |
| `5.03_enableSpecialMeteors` | `true` | Toggles rare, special meteor types with different impact effects |
| `5.03_meteorStrikeChance` | `20 * 60 * 60 * 5` | The probability of a meteor spawning (an average of once every nTH ticks) |
| `5.04_meteorShowerChance` | `20 * 60 * 15` | The probability of a meteor spawning during meteor shower (an average of once every nTH ticks) |
| `5.05_meteorShowerDuration` | `20 * 60 * 30` | Max duration of meteor shower in ticks |

### Explosions

Category `06_explosions`.

| Key | Default | Description |
|---|---|---|
| `6.00_limitExplosionLifespan` | `0` | How long an explosion can be unloaded until it dies in seconds. Based of system time. 0 disables the effect |
| `6.01_blastSpeed` | `1024` | Base speed of MK3 system (old and schrabidium) detonations (Blocks / tick) |
| `6.02_mk5BlastTime` | `50` | Minimum amount of milliseconds per tick allocated for mk5 chunk processing |
| `6.03_falloutRange` | `100` | Radius of fallout area (base radius * value in percent) |
| `6.04_falloutDelay` | `4` | How many ticks to wait for the next fallout chunk computation |
| `6.05_enableChunkLoading` | `true` | Allows all types of procedural explosions to keep the central chunk loaded and to generate new chunks. |
| `6.06_explosionAlgorithm` | `2` | Configures the algorithm of mk5 explosion.  0 = Legacy, 1 = Threaded DDA, 2 = Threaded DDA with damage accumulation. |

### Missile machines

Category `07_missile_machines`.

| Key | Default | Description |
|---|---|---|
| `7.03_ciwsAccuracy` | `50` | Additional modifier for CIWS accuracy |

### Potion effects

Category `08_potion_effects`.

| Key | Default | Description |
|---|---|---|
| `8.S0_potionSickness` | `OFF` | Valid configs include "NORMAL" and "TERRARIA", otherwise potion sickness is turned off |

### Machines

Category `09_machines`.

| Key | Default | Description |
|---|---|---|
| `9.00_scaleRTGPower` | `false` | Should RTG/Betavoltaic fuel power scale down as it decays? |
| `9.01_doRTGsDecay` | `true` | Should RTG/Betavoltaic fuel decay at all? |
| `9.50_energyRatioHE` | `5` | HE side of the HE:FE exchange used where HBM cables meet other mods' FE/RF machines. energyRatioHE HE is worth energyRatioFE FE, both ways. Minimum 1. |
| `9.51_energyRatioFE` | `1` | FE side of the HE:FE exchange. See 9.50_energyRatioHE. Minimum 1. |
| `9.52_foreignExportReserve` | `0` | Fraction (0 to 1) of a power net's supply that other mods' FE machines may take at normal priority, ahead of HBM machines. 0 feeds them only from the surplus HBM machines leave. |

### Dangerous drops

Category `10_dangerous_drops`.

| Key | Default | Description |
|---|---|---|
| `10.00_dropCell` | `true` | Whether antimatter cells should explode when dropped |
| `10.01_dropBHole` | `true` | Whether singularities and black holes should spawn when dropped |
| `10.02_dropStar` | `true` | Whether rigged star blaster cells should explode when dropped |
| `10.04_dropCrys` | `true` | Whether xen crystals should move blocks when dropped |
| `10.05_dropDead` | `true` | Whether dead man's explosives should explode when dropped |

### Tools

Category `11_tools`.

| Key | Default | Description |
|---|---|---|
| `11.00_recursionDepth` | `1000` | Limits veinminer's recursive function. Usually not an issue, unless you're using bukkit which is especially sensitive for some reason. |
| `11.01_recursionStone` | `false` | Determines whether veinminer can break stone |
| `11.02_recursionNetherrack` | `false` | Determines whether veinminer can break netherrack |
| `11.03_hammerAbility` | `true` | Allows AoE ability |
| `11.04_abilityVein` | `true` | Allows veinminer ability |
| `11.05_abilityLuck` | `true` | Allow luck (fortune) ability |
| `11.06_abilitySilk` | `true` | Allow silk touch ability |
| `11.07_abilityFurnace` | `true` | Allow auto-smelter ability |
| `11.08_abilityShredder` | `true` | Allow auto-shredder ability |
| `11.09_abilityCentrifuge` | `true` | Allow auto-centrifuge ability |
| `11.10_abilityCrystallizer` | `true` | Allow auto-crystallizer ability |
| `11.11_abilityMercury` | `true` | Allow mercury touch ability (digging redstone gives mercury) |
| `11.12_abilityExplosion` | `true` | Allow explosion ability |

### Mobs

Category `12_mobs`.

| Key | Default | Description |
|---|---|---|
| `12.D00_enableDucks` | `true` | Whether pressing O should allow the player to duck |
| `12.D01_enableMobGear` | `true` | Whether zombies and skeletons should have additional gear when spawning |
| `12.D02_enableMobWeapons` | `true` | Whether skeletons should have bows replaced with guns when spawning at higher soot levels |
| `12.D03_mobWeaponSootReduction` | `0` | Reduces the amount of soot needed for skeleton guns to appear |
| `12.E00_enableMeltdownElementals` | `true` | Whether there should be radiation elementals |
| `12.E01_elementalDelay` | `30 * 60 * 60` | How many world ticks need to pass for a check to be performed |
| `12.E02_elementalChance` | `2` | 1:x chance to spawn elementals, must be at least 1 |
| `12.E03_elementalAmount` | `10` | How many elementals are spawned each raid |
| `12.E04_elementalAttackDistance` | `32` | How far away elementals will spawn from the targeted player |
| `12.F00_enableFBIRaids` | `false` | Whether there should be FBI raids |
| `12.F01_raidDelay` | `30 * 60 * 60` | How many world ticks need to pass for a check to be performed |
| `12.F02_raidChance` | `3` | 1:x chance to spawn a raid, must be at least 1 |
| `12.F03_raidAmount` | `15` | How many FBI agents are spawned each raid |
| `12.F04_raidAttackDelay` | `40` | Time between individual attempts to break machines |
| `12.F05_raidAttackReach` | `2` | How far away machines can be broken |
| `12.F06_raidAttackDistance` | `32` | How far away agents will spawn from the targeted player |
| `12.F07_raidDrones` | `5` | How many quadcopter drones are spawned each raid |
| `12.G00_enableHives` | `true` | Whether glyphid hives should spawn |
| `12.G01_hiveSpawn` | `256` | The average amount of chunks per hive |
| `12.G02_scoutThreshold` | `1` | Minimum amount of soot for scouts to spawn |
| `12.G07_spawnMax` | `50` | Maximum amount of glyphids being able to exist at once through natural spawning |
| `12.G08_targetingThreshold` | `1` | Minimum amount of soot required for glyphids' extended targeting range to activate |
| `12.G10_scoutSwarmSpawn` | `3` | How likely are scouts to spawn in swarms, 1 in x chance format |
| `12.G11_largeHiveChance` | `5` | The chance for a large hive to spawn, formula: 1/x |
| `12.G12_largeHiveThreshold` | `20` | The soot threshold for a large hive to spawn |
| `12.G13_waypointDebug` | `false` | Allows glyphid waypoints to be seen, mainly used for debugging, also useful as an aid against them |
| `12.GC01_glyphidChance` | `50, -45, 0` | Base Spawn chance and soot modifier for a glyphid grunt |
| `12.GC02_brawlerChance` | `10, 30, 1` | Base Spawn chance and soot modifier for a glyphid brawler |
| `12.GC03_bombardierChance` | `20, -15, 1` | Base Spawn chance and soot modifier for a glyphid bombardier |
| `12.GC04_blasterChance` | `-5, 40, 5` | Base Spawn chance and soot modifier for a glyphid blaster |
| `12.GC05_diggerChance` | `-15, 25, 5` | Base Spawn chance and soot modifier for a glyphid digger |
| `12.GC06_behemothChance` | `-30, 45, 10` | Base Spawn chance and soot modifier for a glyphid behemoth |
| `12.GC07_brendaChance` | `-50, 60, 20` | Base Spawn chance and soot modifier for a glyphid brenda |
| `12.GC08_johnsonChance` | `-50, 60, 50` | Base Spawn chance and soot modifier for Big Man Johnson |
| `12.GS01_baseSwarmSize` | `5` | The basic, soot-less swarm size |
| `12.GS02_swarmScalingMult` | `1.2` | By how much should swarm size scale by per soot amount determined below |
| `12.GS03_sootStep` | `50` | The soot amount the above multiplier applies to the swarm size |
| `12.GS04_swarmCooldown` | `120` | How often do glyphid swarms spawn, in seconds |
| `12.I01_enableInfestation` | `true` | Whether structures infested with glyphids should spawn |
| `12.I02_baseInfestChance` | `5` | The chance for infested structures to spawn |
| `12.M00_enableMaskman` | `true` | Whether mask man should spawn |
| `12.M01_maskmanTimer` | `20 * 60` | How many world seconds need to pass for mask man to spawn, if the requirements are met |
| `12.M03_maskmanMinRad` | `50` | The amount of radiation needed for mask man to spawn |
| `12.M04_maskmanUnderound` | `true` | Whether players need to be underground for mask man to spawn |
| `12.R01_rampantMode` | `false` | The main rampant mode toggle, enables all other features associated with it |
| `12.R02.1_rampantScoutSpawnThresh` | `13` | How much soot is needed for scouts to naturally spawn |
| `12.R02.2_rampantScoutSpawnChance` | `1400` | How often scouts naturally spawn per mob population, 1/x format, the bigger the number, the more uncommon the scouts |
| `12.R02_rampantScoutSpawn` | `false` | Whether scouts should spawn natually in highly polluted chunks |
| `12.R03_rampantExtendedTargeting` | `false` | Whether Glyphids should have the extended targetting always enabled |
| `12.R04_rampantDig` | `false` | Whether Glyphids should be able to dig to waypoints |
| `12.R05_rampantGlyphidGuidance` | `false` | Whether Glyphids should always expand toward a player's spawnpoint |
| `12.R06_rampantSmokeStackOverride` | `0.4` | How much should the smokestack multiply soot by when on rampant mode |
| `12.R07_scoutInitialSpawn` | `false` | Whether glyphid scouts should be able to spawn on the first swarm of a hive, causes glyphids to expand significantly faster |
| `12.R08_pollutionMult` | `1` | A multiplier for soot emitted, whether you want to increase or decrease it |

### Radiation

Category `13_radiation`.

| Key | Default | Description |
|---|---|---|
| `AMBIENT_00_nether` | `0.1` | RAD/s in the nether |
| `FOG_00_threshold` | `100` | Radiation in RADs required for fog to spawn |
| `FOG_01_threshold` | `20` | 1:n chance of fog spawning every second |
| `RADIATION_00_enableContamination` | `true` | Toggles player contamination (and negative effects from radiation poisoning) |
| `RADIATION_01_enableChunkRads` | `true` | Toggles the world radiation system (chunk radiation only, some blocks use an AoE!) |
| `RADWORLD_00_toggle` | `true` | Whether high radiation levels should perform changes in the world |
| `RADWORLD_01_amount` | `10` | How many block operations radiation can perform per tick |
| `RADWORLD_02_minimum` | `20` | The least amount of RADs required for block modification to happen |
| `RADWORLD_03_regrow` | `false` | Whether dead grass and mycelium should decay into dirt |

### Hazards

Category `14_hazard`.

| Key | Default | Description |
|---|---|---|
| `HAZ_00_disableAsbestos` | `false` | When turned off, all asbestos hazards are disabled |
| `HAZ_01_disableCoaldust` | `false` | When turned off, all coal dust hazards are disabled |
| `HAZ_02_disableHot` | `false` | When turned off, all hot hazards are disabled |
| `HAZ_03_disableExplosive` | `false` | When turned off, all explosive hazards are disabled |
| `HAZ_04_disableHydroactive` | `false` | When turned off, all hydroactive hazards are disabled |
| `HAZ_05_disableBlinding` | `false` | When turned off, all blinding hazards are disabled |
| `HAZ_06_disableFibrosis` | `false` | When turned off, all fibrosis hazards are disabled |

### Structures

Category `15_structures`.

| Key | Default | Description |
|---|---|---|
| `5.00_enableStructures` | `flag` | Flag for whether modern NTM structures will spawn. Valid values are true\|false\|flag - flag will respect the "Generate Structures" world flag. |
| `5.01_structureMinChunks` | `4` | Minimum non-zero distance between structures in chunks (Settings lower than 8 may be problematic). |
| `5.02_structureMaxChunks` | `16` | Maximum non-zero distance between structures in chunks. |
| `5.03_lootAmountFactor` | `1` | General factor for loot spawns. Applies to spawned IInventories, not loot blocks. |
| `5.04_debugStructures` | `false` | If enabled, special structure blocks like jigsaw blocks will not be transformed after generating |
| `5.05_enableRuins` | `true` | Toggle for all ruin structures (A through J) |
| `5.06_enableOceanStructures` | `true` | Toggle for ocean structures. (Aircraft carrier, oil rig, lighthouse.) |
| `5.07_spireSpawnWeight` | `2` | Spawn weight for spire structure. |
| `5.08_featuresSpawnWeight` | `50` | Spawn weight for misc structures (ex. Houses, offices.) |
| `5.09_bunkerSpawnWeight` | `6` | Spawn weight for bunker structure. |
| `5.10_vertibirdSpawnWeight` | `6` | Spawn weight for vertibird structure. |
| `5.11_crashedVertibirdSpawnWeight` | `10` | Spawn weight for crashed vertibird structure. |
| `5.12_aircraftCarrierSpawnWeight` | `3` | Spawn weight for aircraft carrier structure. |
| `5.13_oilRigSpawnWeight` | `5` | Spawn weight for oil rig structure. |
| `5.14_lighthouseSpawnWeight` | `1` | Spawn weight for lighthouse structure. |
| `5.15_beachedPatrolSpawnWeight` | `15` | Spawn weight for beached patrol structure. |
| `5.16_dishSpawnWeight` | `10` | Spawn weight for dish structures. |
| `5.17_forestChemSpawnWeight` | `30` | Spawn weight for forest chemical plant structure. |
| `5.18_plane1SpawnWeight` | `25` | Spawn weight for crashed plane 1 structure. |
| `5.19_plane2SpawnWeight` | `25` | Spawn weight for crashed plane 2 structure. |
| `5.20_desertShack1SpawnWeight` | `18` | Spawn weight for desert shack 1 structure. |
| `5.21_desertShack2SpawnWeight` | `20` | Spawn weight for desert shack 2 structure. |
| `5.22_desertShack3SpawnWeight` | `22` | Spawn weight for desert shack 3 structure. |
| `5.23_laboratorySpawnWeight` | `20` | Spawn weight for laboratory structure/ |
| `5.24_forestPostSpawnWeight` | `30` | Spawn weight for forest post structure. |
| `5.25_ruinASpawnWeight` | `10` | Spawn weight for ruin A structure. |
| `5.26_ruinBSpawnWeight` | `12` | Spawn weight for ruin B structure. |
| `5.27_ruinCSpawnWeight` | `12` | Spawn weight for ruin C structure. |
| `5.28_ruinDSpawnWeight` | `12` | Spawn weight for ruin D structure. |
| `5.29_ruinESpawnWeight` | `12` | Spawn weight for ruin E structure. |
| `5.30_ruinFSpawnWeight` | `12` | Spawn weight for ruin F structure. |
| `5.31_ruinGSpawnWeight` | `12` | Spawn weight for ruin G structure. |
| `5.32_ruinHSpawnWeight` | `12` | Spawn weight for ruin H structure. |
| `5.33_ruinISpawnWeight` | `12` | Spawn weight for ruin I structure. |
| `5.34_ruinJSpawnWeight` | `12` | Spawn weight for ruin J structure. |
| `5.35_radioSpawnWeight` | `25` | Spawn weight for radio structure. |
| `5.36_factorySpawnWeight` | `40` | Spawn weight for factory structure. |
| `5.37_plainsNullWeight` | `20` | Null spawn weight for plains biome |
| `5.38_oceanNullWeight` | `35` | Null spawn weight for ocean biomes |
| `5.39_craneSpawnWeight` | `20` | Spawn weight for crane structure. |
| `5.40_broadcastingTowerSpawnWeight` | `25` | Spawn weight for broadcasting tower structure. |
| `5.41_towerBaseSpawnWeight` | `30` | Spawn weight for tower base. |
| `5.42_waterPumpSpawnWeight` | `15` | Spawn weight for water pump structure. |
| `5.43_deadDishSmallSpawnWeight` | `15` | Spawn weight for dead dish small structure. |
| `5.44_falloutShelterHouseSpawnWeight` | `15` | Spawn weight for fallout shelter house. |
| `5.45_abandonedArcticStationSpawnWeight` | `5` | Spawn weight for abandoned arctic station. |
| `5.46_militaryBaseSpawnWeight` | `1` | Spawn weight for military base. |
| `5.49_submarineSpawnWeight` | `2` | Spawn weight for submarine. |

### Pollution

Category `16_pollution`.

| Key | Default | Description |
|---|---|---|
| `POL_00_enablePollution` | `true` | If disabled, none of the polltuion related things will work |
| `POL_01_enableLeadFromBlocks` | `true` | Whether breaking blocks in heavy metal polluted areas will poison the player |
| `POL_02_enableLeadPoisoning` | `true` | Whether being in a heavy metal polluted area will poison the player |
| `POL_03_enableSootFog` | `true` | Whether smog should be visible |
| `POL_04_enablePoison` | `true` | Whether being in a poisoned area will affect the player |
| `POL_05_buffMobThreshold` | `15` | The amount of soot required to buff naturally spawning mobs |
| `POL_06_sootFogThreshold` | `35` | How much soot is required for smog to become visible |
| `POL_07_sootFogDivisor` | `120` | The divisor for smog, higher numbers will require more soot for the same smog density |
| `POL_08_smokeStackSootMult` | `0.8` | How much does smokestack multiply soot by, with decimal values reducing the soot |

### Biomes

Category `17_biomes`.

| Key | Default | Description |
|---|---|---|
| `17.B_toggle` | `true` | Enables the biome change caused by nuclear explosions |
| `17.R00_craterBiomeRad` | `5` | RAD/s for the crater biome |
| `17.R01_craterBiomeInnerRad` | `25` | RAD/s for the inner crater biome |
| `17.R02_craterBiomeOuterRad` | `0.5` | RAD/s for the outer crater biome |
| `17.R03_craterBiomeWaterMult` | `5` | Multiplier for RAD/s in crater biomes when in water |

### Weapons

Category `18_weapons`.

| Key | Default | Description |
|---|---|---|
| `18.00_linearAnimations` | `false` | Should heavily stylised weapon animations be replaced with more conventional ones? |

### 528 mode

Category `528`.

| Key | Default | Description |
|---|---|---|
| `X528_enable528ExplosiveEnergistics` | `true` | Renders AE2 unusable. |
| `X528_enable528MachineGravity` | `true` | Requires most large machines to have a proper foundation, or else they tilt and break. |
| `X528_enable528NetherBurn` | `true` | Whether players burn in the nether |
| `X528_enable528PressurizedRecipes` | `true` | Sets some recipes to require pressurized input fluid |
| `X528_enableBosniaSimulator` | `true` | Enables anti tank mines spawning all over the world. |
| `X528_enableColtanDeposit` | `true` | Enables the coltan deposit. A large amount of coltan will spawn around a single random location in the world. |
| `X528_enableColtanSpawning` | `false` | Enables coltan ore as a random spawn in the world. Unlike the deposit option, coltan will not just spawn in one central location. |
| `X528_forceReasimBoilers` | `true` | Keeps the RBMK dial for ReaSim boilers on, preventing use of non-ReaSim boiler columns and forcing the use of steam in-/outlets |
| `X528_oreColtanFrequency` | `2` | Determines how many coltan ore veins are to be expected in a chunk. These values do not affect the frequency in deposits, and only apply if random coltan spanwing is enabled. |
| `enable528Mode` | `false` | The central toggle for 528 mode, required TRUE for most subsequent toggles to work. |

### Less Bullshit Mode

Category `LESS BULLSHIT MODE`.

| Key | Default | Description |
|---|---|---|
| `LBSM_recipeSimpleAlloy` | `true` | When enabled, adds some blast furnace recipes to make certain things cheaper |
| `LBSM_recipeSimpleArmor` | `true` | When enabled, simplifies the recipe for armor sets like starmetal or schrabidium. |
| `LBSM_recipeSimpleCentrifuge` | `true` | When enabled, enhances centrifuge outputs to make rare materials more common |
| `LBSM_recipeSimpleChemistry` | `true` | When enabled, simplifies some chemical plant recipes |
| `LBSM_recipeSimpleCrafting` | `true` | When enabled, some uncraftable or more expansive items get simple crafting recipes. Scorched uranium also becomes washable |
| `LBSM_recipeSimpleMedicine` | `true` | When enabled, makes some medicine recipes (like ones that require bismuth) much more affordable |
| `LBSM_recipeSimpleTool` | `true` | When enabled, simplifies the recipe for tool sets like starmetal or scrhabidium |
| `LBSM_recipeUnlockAnvil` | `true` | When enabled, all anvil recipes are available at tier 1 |
| `LBSM_safeCrates` | `true` | When enabled, prevents crates from becoming radioactive |
| `LBSM_safeMEDrives` | `true` | When enabled, prevents ME Drives and Portable Cells from becoming radioactive |
| `LBSM_schrabOreRate` | `20` | Changes the amount of uranium ore needed on average to create one schrabidium ore using nukes. Standard mode value is 100 |
| `LBSM_shortDecay` | `true` | When enabled, this will highly accelerate the speed at which nuclear waste disposal drums decay their contents. 60x faster than 528 mode and 5-12x faster than on normal mode. |
| `enableLessBullshitMode` | `false` | The central toggle for LBS mode. Forced OFF when 528 is enabled! |

## hbmServer.json

1.7's server variables. List and change them in game with `/ntmserver` (`/ntmserver set <key> <value>`); the file is rewritten with the running values.

| Key | Default | Effect |
|---|---|---|
| `DAMAGE_COMPATIBILITY_MODE` | `false` | 1.7's compatibility path for HBM damage, which also applies knockback multipliers. |
| `MINE_AP_DAMAGE` | `10` | Damage of the anti-personnel landmine. |
| `MINE_HE_DAMAGE` | `35` | Damage of the high-explosive landmine. |
| `MINE_SHRAP_DAMAGE` | `7.5` | Damage of each shrapnel piece from the shrapnel landmine. |
| `MINE_NUKE_DAMAGE` | `100` | Damage of the nuclear landmine. |
| `MINE_NAVAL_DAMAGE` | `60` | Damage of the naval mine. |
| `ENTITY_TAINT_TRAILS` | `false` | Tainted creepers and the taint effect leave spreading taint behind. |
| `CRATE_OPEN_HELD` | `true` | The tungsten crate can be opened from the hand. |
| `CRATE_KEEP_CONTENTS` | `true` | Crates and clutter keep their contents when broken. |
| `ITEM_HAZARD_DROP_TICKRATE` | `2` | How often, in ticks, dropped hazardous items apply their hazards. |
| `ENABLE_MKU` | `true` | The MKU contagion can spread. |
| `STRUCTURE_DEBUG` | `false` | Built structures keep their placeholders visible (air, jigsaw and loot markers). |
| `AUTOCAL_MAX_CLOCK` | `20` | Clock cycles an AUTOCAL unit runs per game tick. |
| `MAX_BUFFER_LENGTH` | `256` | Longest text buffer Redstone-over-Radio script parsing accepts. |
| `MAX_STACK_SIZE` | `256` | Deepest value stack Redstone-over-Radio script parsing allows. |
| `CONVEYOR_CRAM_MAX` | `25` | Items in one conveyor cell before the jam pops. |
| `CONVEYOR_CRAM_EXPLODE` | `true` | A long-lasting conveyor jam breaks the belt under it. |
| `ULTRA_LARP_MODE` | `false` | Large doors open by redstone only, except doors that never need it. |
| `DEBUG_PORT_VIEW` | `false` | Machine ports show their connections with particles. |

### Gun damage

Each gun's base damage per bullet, before the bullet type's multiplier.

| Key | Default |
|---|---|
| `GUN_ABERRATOR_DAMAGE` | `100` |
| `GUN_AM180_DAMAGE` | `2` |
| `GUN_ANTI_MATERIEL_DAMAGE` | `30` |
| `GUN_ASSAULT_RIFLE_DAMAGE` | `5` |
| `GUN_ATLAS_DAMAGE` | `12.5` |
| `GUN_AUTOSHOTGUN_DAMAGE` | `48` |
| `GUN_BOLTER_DAMAGE` | `15` |
| `GUN_BROKEN_DAMAGE` | `48` |
| `GUN_CARBINE_BAYONET_DAMAGE` | `15` |
| `GUN_CARBINE_DAMAGE` | `15` |
| `GUN_CHARGE_THROWER_DAMAGE` | `10` |
| `GUN_COILGUN_DAMAGE` | `35` |
| `GUN_CONGO_LAKE_DAMAGE` | `20` |
| `GUN_DANI_CELESTIAL_DAMAGE` | `15` |
| `GUN_DANI_LUNAR_DAMAGE` | `15` |
| `GUN_DAYBREAKER_DAMAGE` | `25` |
| `GUN_DOUBLE_BARREL_DAMAGE` | `?` |
| `GUN_EOTT_LEFT_DAMAGE` | `100` |
| `GUN_EOTT_RIGHT_DAMAGE` | `100` |
| `GUN_EXTINGUISHER_DAMAGE` | `0` |
| `GUN_FATMAN_DAMAGE` | `100` |
| `GUN_FLAMER_DAMAGE` | `1` |
| `GUN_FLARE_DAMAGE` | `15` |
| `GUN_GREASEGUN_DAMAGE` | `3` |
| `GUN_HANGMAN_DAMAGE` | `25` |
| `GUN_HANGMAN_SMACK_DAMAGE` | `10` |
| `GUN_HEAVY_REVOLVER_DAMAGE` | `15` |
| `GUN_HENRY_DAMAGE` | `10` |
| `GUN_HERETIC_DAMAGE` | `100` |
| `GUN_LACUNAE_DAMAGE` | `12` |
| `GUN_LASER_PISTOL_DAMAGE` | `25` |
| `GUN_LASER_RIFLE_DAMAGE` | `50` |
| `GUN_LIBERATOR_DAMAGE` | `16` |
| `GUN_LIGHT_REVOLVER_DAMAGE` | `7.5` |
| `GUN_LILMAC_DAMAGE` | `30` |
| `GUN_LINCOLN_DAMAGE` | `20` |
| `GUN_LONG_PISTOL_DAMAGE` | `25` |
| `GUN_M2_DAMAGE` | `7.5` |
| `GUN_MARES_LEG_AKIMBO_LEFT_DAMAGE` | `16` |
| `GUN_MARES_LEG_AKIMBO_RIGHT_DAMAGE` | `16` |
| `GUN_MARES_LEG_DAMAGE` | `16` |
| `GUN_MINIGUN_DAMAGE` | `6` |
| `GUN_MINIGUN_DUAL_LEFT_DAMAGE` | `6` |
| `GUN_MINIGUN_DUAL_RIGHT_DAMAGE` | `6` |
| `GUN_MISSILE_LAUNCHER_DAMAGE` | `50` |
| `GUN_MK108_DAMAGE` | `25` |
| `GUN_MORNING_GLORY_DAMAGE` | `30` |
| `GUN_NI4NI_DAMAGE` | `35` |
| `GUN_PANZERSCHRECK_DAMAGE` | `25` |
| `GUN_PENANCE_DAMAGE` | `45` |
| `GUN_PEPPERBOX_DAMAGE` | `5` |
| `GUN_PEW_PEW_DAMAGE` | `30` |
| `GUN_PROTEGE_DAMAGE` | `30` |
| `GUN_QUADRO_DAMAGE` | `40` |
| `GUN_SACRED_DRAGON_DAMAGE` | `45` |
| `GUN_SEXY_DAMAGE` | `64` |
| `GUN_SHREDDER_DAMAGE` | `50` |
| `GUN_SOUTH_STAR_BAYONET_DAMAGE` | `15` |
| `GUN_SOUTH_STAR_DAMAGE` | `30` |
| `GUN_SPAS_DAMAGE` | `32` |
| `GUN_STARF_AKIMBO_LEFT_DAMAGE` | `12.5` |
| `GUN_STARF_AKIMBO_RIGHT_DAMAGE` | `12.5` |
| `GUN_STARF_DAMAGE` | `12.5` |
| `GUN_STG77_DAMAGE` | `10` |
| `GUN_STINGER_DAMAGE` | `35` |
| `GUN_SUBTLETY_DAMAGE` | `50` |
| `GUN_TAU_CANNON_CHARGE_DAMAGE` | `5` |
| `GUN_TAU_CANNON_DAMAGE` | `25` |
| `GUN_TESLA_CANNON_DAMAGE` | `35` |
| `GUN_TOPAZ_DAMAGE` | `1.5` |
| `GUN_UZI_AKIMBO_LEFT_DAMAGE` | `3` |
| `GUN_UZI_AKIMBO_RIGHT_DAMAGE` | `3` |
| `GUN_UZI_DAMAGE` | `3` |
| `GUN_ZEBRA_DAMAGE` | `7.5` |

## RBMK gamerules

The RBMK's dials are per-world gamerules, changed with `/gamerule <name> <value>` and applied at once.

| Gamerule | Type | Default | Range | Effect |
|---|---|---|---|---|
| `dialSaveDials` | boolean | `true` |  | Keep the dials as set; `false` resets every dial to its default when the world loads. |
| `dialPassiveCooling` | number | `2.5` | 0 to any | Heat per tick a column at the edge of the reactor loses on its own. |
| `dialPassiveCoolingInner` | number | `0.1` | 0 to any | Heat per tick a column surrounded by other columns loses on its own. |
| `dialColumnHeatFlow` | number | `0.2` | 0 to 1 | How quickly neighbouring columns' heat evens out: 1 is instant, 0.5 halves the difference each step. |
| `dialDiffusionMod` | number | `1` | 0 to any | Multiplier on how quickly a fuel rod's core and hull temperatures even out. |
| `dialHeatProvision` | number | `0.2` | 0 to 1 | How quickly a fuel rod's hull heat and its column's heat even out: 1 is instant. |
| `dialColumnHeight` | integer | `4` | 2 to 16 | How tall the reactor structure is, in blocks. |
| `dialEnablePermaScrap` | boolean | `true` |  | Debris stays until picked up instead of despawning. |
| `dialBoilerHeatConsumption` | number | `0.1` | 0 to any | Heat units a steam channel uses per mB of water. |
| `dialControlSpeed` | number | `1` | 0 to any | Multiplier on how quickly control rods move. |
| `dialReactivityMod` | number | `1` | 0 to any | Multiplier on how much flux fuel rods give out. |
| `dialOutgasserSpeedMod` | number | `1` | 0 to any | Multiplier on irradiation channel speed. |
| `dialControlSurgeMod` | number | `1` | 0 to any | Multiplier on how high the power surge goes when control rods are inserted. |
| `dialFluxRange` | integer | `5` | 1 to 100 | How far a normal fuel rod's flux reaches, in columns. |
| `dialReasimRange` | integer | `10` | 1 to 100 | How far a ReaSim fuel rod's flux reaches, in columns. |
| `dialReasimBoilers` | boolean | `false` |  | Every column acts as a boiler, with dedicated inlet and outlet blocks. Also on when `hbm.cfg` 528 mode forces it. |
| `dialReasimBoilerSpeed` | number | `0.05` | 0 to 1 | Share of the possible steam a ReaSim boiler makes per tick. |
| `dialDisableMeltdowns` | boolean | `false` |  | Overheating fuel columns do not start a meltdown. |
| `dialEnableMeltdownOverpressure` | boolean | `false` |  | Connected pipes and turbines explode when the reactor melts down. |
| `dialModeratorEfficiency` | number | `1` | 0 to 1 | Share of neutrons a moderator turns from fast to slow. |
| `dialAbsorberEfficiency` | number | `1` | 0 to 1 | Share of neutrons an absorber column absorbs. |
| `dialReflectorEfficiency` | number | `1` | 0 to 1 | Share of neutrons a reflector column reflects. |
| `dialDisableDepletion` | boolean | `false` |  | Fuel rods never deplete. |
| `dialDisableXenon` | boolean | `false` |  | No xenon poisoning. |
| `dialAbsorberHeatConversion` | number | `0.05` | 0 to 1 | °C of heat an absorber gains per unit of flux it absorbs. |
