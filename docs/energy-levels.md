# Energy Levels — Business Rules

> This document establishes the rules used to compute the available energy level (in kW) for a save file:
> total production, total consumption, and the balance — computed independently **per planet** (Rule
> EN-PLANET-1), since each planet has its own power grid in-game.
> It complements [`docs/save-format.md`](./save-format.md) and the merge rules of
> [`docs/awawa-project-specification/rules.awawa`](./awawa-project-specification/rules.awawa).
>
> Sources: in-game data cross-checked with the community wiki
> ([Machine Optimizers](https://planet-crafter.fandom.com/wiki/Machine_Optimizers),
> [Fuse](https://planet-crafter.fandom.com/wiki/Fuse)).

---

## 1. Base energy values

Base production and consumption values (kW) per `WorldObject.gId`, **before any Optimizer/Fuse bonus**, are
rows of
[`packages/core-mapping/src/domain/energyLevels.json`](../packages/core-mapping/src/domain/energyLevels.json)
(`@DATATABLE.EnergyLevels`), which `energyLevelsByWorldObjectName.ts` reads into two lookups:

- `energyProductionLevelsByWorldObjectName` — energy producers (`EnergyGenerator1..6`, `WindTurbine1`).
- `energyConsumptionLevelsByWorldObjectName` — energy consumers: drills, heaters, extractors, spreaders,
  atmosphere purifiers, detoxification machines, toxic/atmospheric/lake water collectors, vegetubes, algae
  generators, food growers, the DNA manipulator, the biolab, the incubator, the auto-crafter, craft stations
  (T2, Advanced, Quartz, Refinement), the vehicle station, beehives, the butterfly dome, biodomes, the launch
  platform, display screens, lamps and the beacon; plus, since the 2026-09-07 cross-check, outdoor farms, fish
  farms, aquariums, butterfly farms, the amphibian farm, the animal shelter, the animal feeder, the ecosystem,
  the silk generator, the water life collector, the genetic synthesizer and extractor, ore crushers, the
  harvesting robot, the drone station, the portal generator, the interplanetary exchange shuttle, the
  planetary delivery depot, the extraction platform and, since the 2026-09-09 cross-check, the T2
  incubator and the intense area lamp.

**Rule EN-BASE-2 (exhaustiveness):** every positioned `WorldObject` whose `gId` corresponds to a machine that
has a power cost in-game must have an entry in `energyConsumptionLevelsByWorldObjectName`, otherwise the
computed total consumption falls short of the in-game HUD value. A prior version of this table only covered a
subset of consumers (drills, heaters, extractors, spreaders, recycling machines, the communication antenna and
the teleporter), which under-reported total consumption by several thousand kW on real saves containing water
collectors, atmosphere purifiers, detoxification machines, craft stations, biodomes, etc. All added values were
cross-checked against the wiki (see the [Craft Stations](https://planet-crafter.fandom.com/wiki/Craft_Stations),
[Atmosphere Purifiers](https://planet-crafter.fandom.com/wiki/Atmosphere_Purifiers),
[Detoxification Machines](https://planet-crafter.fandom.com/wiki/Detoxification_Machines),
[Toxic Water Collectors](https://planet-crafter.fandom.com/wiki/Toxic_Water_Collectors),
[Biodomes](https://planet-crafter.fandom.com/wiki/Biodomes),
[Base Building](https://planet-crafter.fandom.com/wiki/Base_Building) and
[Display Screens](https://planet-crafter.fandom.com/wiki/Display_Screens) wiki pages).

**EN-BASE-2 is not verifiable by a unit test, and no test claims it.** The rule is a statement about the
*game*: proving it would need an inventory of the game's power-drawing machines *and of their cost*, which no
public source provides. `worldObjectNames.ts` now inventories the `gId`s themselves (see section 6), but it says
which world objects exist, not which of them draw power. Reference saves cannot serve either — they are private
and unavailable in CI. A test whose input set is `Object.keys(...)` of the table under test therefore cannot fail
on the very defect the rule describes, and must not be titled as if it could.

**What the versioned guard covers.** `worldObjectNames.ts` declares every known `gId` in exactly one of three
groups — producing energy, consuming energy, or without a known energy level (section 6) — and
`PlanetEnergyGrid.spec.ts` asserts the two directions of that
partition: every name of the producing and consuming groups yields a strictly positive level, and no name of the
third group yields any. Consequences: removing a table entry turns the suite red (including the entry of a machine
that has no sibling tier, `Beacon` or `ComAntenna`, which the earlier by-family guard let through), pricing a name
without moving it into its group turns it red, and a `gId` added on the next regeneration of the list cannot reach
the type without an energy decision being made about it.

It does **not** prove EN-BASE-2: putting a machine in the third group asserts only that *this repository has not
established* a level for it, never that the game charges nothing for it. The machines whose cost the sources leave
undecided are listed below, and they sit in that third group.

**Identifying a `gId` before pricing it.** `gId`s do not reliably match wiki page titles: `OreBreaker*` is the
Ore Crusher and not the Ore Extractor, `InterplanetaryExchangePlatform1` is the Interplanetary Exchange Shuttle,
and `LarvaeBase1..3` are larva *items* rather than machines. Every `gId` added to the table is therefore first
resolved to a display name through the label file described in section 6, before its value is read off the
corresponding wiki page.

**Last wiki cross-check: 2026-09-09**, against game version 2.102. It covered every `gId` observed placed in the
reference saves. Machines whose wiki page documents the object but prints no energy value — among them the
Megadome, the trade space rocket, the light box, the hologram projector, the server, the planet viewer, the
cooking station and the display boxes — are deliberately absent from the table rather than priced at zero: an
absent infobox field is an undocumented value, not a stated absence of cost. Resources, seeds, growables,
furniture, structural parts, posters, effigies and rockets are excluded as non-machines. Two exclusions rest on
an explicit statement rather than on silence: drones draw no power of their own ("Each additional Drone does not
draw any energy", [Drone Station](https://planet-crafter.fandom.com/wiki/Drone_Station)), and the wreck
[fusion reactor](https://planet-crafter.fandom.com/wiki/Fusion_reactor) is inert scenery that "ha[s] run out of
power since [it] crashed" — not the player-built nuclear fusion generator, which the same page disambiguates.

**Skeo update (game v2.103), read 2026-09-21.** `TreePlanter3` (Giant trees pot), `PodUnderground` (Underground
living compartment) and `RocketAnimals2` (T2 Animals spreader rocket) also print no energy field on their wiki
infoboxes, but they are handled differently from the machines above: their predecessors with a similar label
(`TreePlanter`, `TreePlanter2`, `RocketAnimals1`) carry no energy value either, so the missing field is read as
these three neither drawing nor producing power, not as an undocumented cost
(`@HYPOTHESIS.PodUndergroundAndRocketAnimals2DrawNoPower`). They stay in the group without a known energy
level, the same way an undocumented-cost machine does, but are not counted among the machines this document lists
above, whose consumption the tool underestimates
(`@DECISION.AHypothesisedZeroEnergyMachineIsNotAnUnknownEnergyMachine`). The hypothesis stands until observed
otherwise in game. The game data search below prices `TreePlanter3` at 85 kW and `TreePlanter` at 40 kW, so the
hypothesis is narrowed to `PodUnderground` and `RocketAnimals2`, `TreePlanter3` moving to the consuming group;
the fixture of `@TASK.TEST125` keeps it, to check the 85 kW in game.

**Game data search: 2026-09-25**, against game version 2.103. Every name of the group without a known energy level,
placed in a reference save or not, was looked up in a community export of the game's own item data
(`@URL.CompanionAppGameDataV2103`), whose `stats.energy` field carries the `unitGenerationEnergy` value the game
reads, negative for a consumer; the 110 rows already in the table were not checked again, but the export matches 107
of them to the kilowatt, which is what makes it a source rather than a guess. Eight names are priced by it and moved
to the consuming group: `TradePlatform1` (425 kW), `Megadome1` (250), `TreePlanter3` (85), `HologramGenerator` (75),
`PlanetViewer1` (75), `TreePlanter` (40), `LightBoxMedium` (30) and `FountainBig` (25), each row carrying the export
in its `source` field. The export prints 0 for 458 other names and omits 75 more; a zero is not a price, since the
export writes the same 0 for a resource, a seed or a structural part that has no energy field at all, so these names
stay in the group without a known energy level (`@DECISION.AZeroInTheGameDataExportIsNotAPrice`). Among the placed
machines the 2026-09-09 cross-check left unpriced, `ButterflyDisplayer1`, `FishDisplayer1`, `FrogDisplayer1`,
`Server1` and `CookingStation1` remain so, and only they are listed by
`@LIMITATION.ElevenPlacedMachinesHaveNoKnownEnergyLevel`.

**Source registry.** Each value the 2026-09-07/09 cross-check added carries, in the `source` field of its row, the
wiki page it was read from (game v2.102). Earlier values are sourced by the wiki pages listed in EN-BASE-2 above.

**Rule EN-BASE-1:** The base energy balance of a save is
`sum(production of every positioned world object) - sum(consumption of every positioned world object)`,
using the tables above, **before** any Optimizer bonus is applied (see section 3). Only **positioned**
world objects (`pos` and `planet` both defined — see `GR-WO-1`) are counted: world objects without a
`pos` are not actually placed/active in the world (e.g. spare/unbuilt items) and do not contribute to
production or consumption. This was validated against a real save where the in-game HUD production
matched only after excluding un-positioned generators.

---

## 2. World object roles

The producers are the `production` rows of the energy levels table. `Optimizer1` and `Optimizer2` are fuse
holders and boosters **and** energy consumers; `FuseEnergy1` is the Energy Fuse, a bonus item that goes inside an
Optimizer. Display labels are the rows of
[`packages/core-mapping/src/presentation/worldObjectLabels.json`](../packages/core-mapping/src/presentation/worldObjectLabels.json)
(`@DATATABLE.WorldObjectLabels`), see section 6.

All values in `energyProductionLevelsByWorldObjectName` are, per the wiki, boostable by the Energy Fuse
(wind turbines, solar panels, nuclear reactors, nuclear fusion generator).

**Note:** Optimizers themselves draw power (50 kW for T1, 150 kW for T2, per the
[Machine Optimizers wiki page](https://planet-crafter.fandom.com/wiki/Machine_Optimizers)) — they are listed
in `energyConsumptionLevelsByWorldObjectName` in addition to their role as fuse holders/boosters.

---

## 3. Optimizers & Fuses

### 3.1 What an Optimizer is

An **Optimizer** (`Optimizer1` = T1, `Optimizer2` = T2) is a machine world object that holds **Fuses** in its
linked inventory (`WorldObject.liId` → `Inventory.id` → `Inventory.woIds`). A Fuse only has an effect once
placed inside an Optimizer.

**Rule EN-OPT-1 (capacity):** the fuse slots, the maximum number of machines affected and the radius of each
Optimizer tier are the rows of
[`packages/core-mapping/src/domain/optimizerConfig.json`](../packages/core-mapping/src/domain/optimizerConfig.json)
(`@DATATABLE.OptimizerConfiguration`).

**Rule EN-OPT-2 (targeting):** An Optimizer boosts the **closest** machines of the type matching its fuse(s),
within its radius, up to its max-machines capacity. If more eligible machines exist in range than the capacity
allows, only the N closest (N = its capacity) receive the bonus; the rest are unaffected by that Optimizer.

**Rule EN-OPT-3 (multiple optimizers):** Multiple Optimizers (even holding the same fuse type) do not compete
for the same machines — each Optimizer independently selects its closest eligible machines, and their bonuses
stack on any machine boosted by more than one Optimizer.

### 3.2 The Energy Fuse (`FuseEnergy1`)

**Rule EN-FUSE-1 (identification):** In the world objects list, an Optimizer (`Optimizer1`/`Optimizer2`) is
relevant to energy computation only if its linked inventory contains at least one `FuseEnergy1` world object.

**Rule EN-FUSE-2 (bonus value):** Each `FuseEnergy1` gives a **power multiplier of 150%** to an affected
producer, i.e. one fuse raises the producer's output from 100% to 150% of its base value. This **replaces**
the producer's base 100% value rather than adding to it (see EN-FUSE-3 for multiple fuses).

**Rule EN-FUSE-3 (stacking — confirmed against real save data):** Multiple Energy Fuses affecting the same
machine (whether from one T2 Optimizer holding several `FuseEnergy1`, or from several Optimizers overlapping
on the same machine) stack **additively by their raw percentage value** (150% each), matching the pattern
documented on the [Fuse wiki page](https://planet-crafter.fandom.com/wiki/Fuse) for other multiplier fuses
(e.g. two Heat Fuses → 1000%, not 2500%: each Heat Fuse is 500%, and 2 × 500% = 1000%). A producer reached by
zero fuses keeps its base 100%:

```
totalFuses = sum of fuseCount over every Optimizer reaching this producer (EN-OPT-3)
multiplier = totalFuses === 0 ? 1 : totalFuses × 1.5
finalOutput = baseOutput × multiplier
```

This was verified against a real save file: 8 T2 Nuclear Reactors (base 331.5 kW each) reached by a
combination of a T1 Optimizer (1 fuse) and a T2 Optimizer (3 fuses) produced exactly 12762.75 kW in-game,
which matches this formula (4 reactors reached by both = 4 fuses × 331.5 × 1.5 = 1989 kW each; 3 reactors
reached by the T2 Optimizer only = 3 fuses × 331.5 × 1.5 = 1492.75... kW each — see the implementation for
the exact grouping). The Nuclear Fusion generator (base 1485 kW, reached by the same 4 fuses) produced
exactly 8910 kW = 1485 × 6.

**Rule EN-FUSE-4 (eligible producers):** Only energy-producing machines are boosted by the Energy Fuse: wind
turbines, solar panels (T1/T2), nuclear reactors (T1/T2) and the nuclear fusion generator — i.e. every `gId`
listed in `energyProductionLevelsByWorldObjectName`. Energy consumers (drills, heaters, extractors, …) are
never affected by the Energy Fuse.

---

## 4. Computation algorithm (implemented)

Implemented in [`PlanetEnergyGrid`](../packages/core-mapping/src/domain/PlanetEnergyGrid.ts), the aggregate that
is one planet's power grid: it counts the Energy Fuses reaching each producer once, in its constructor, and
`levels()` reads that count back.

To compute the true available energy level of a save, accounting for Optimizers:

1. Collect all world objects with a `pos` and `planet` (positioned objects only — see `GR-WO-1` and
   `EN-BASE-1`); un-positioned objects are excluded entirely from production and consumption.
2. Identify all `Optimizer1`/`Optimizer2` objects; for each, resolve its linked inventory via `liId` and list
   its contained fuses via `woIds`.
3. Keep only Optimizers whose inventory contains at least one `FuseEnergy1`; count how many `FuseEnergy1` each
   one holds (`fuseCount`).
4. For each qualifying Optimizer, find energy-producing machines (`gId` in
   `energyProductionLevelsByWorldObjectName`) on the **same `planet`**, within its radius (EN-OPT-1) of its
   `pos`, sorted by distance; keep at most its machine capacity.
5. For each affected producer, accumulate `fuseCount` (summed across every Optimizer that reaches it — Rule
   EN-OPT-3) into a per-producer `totalFuses` count.
6. `multiplier = totalFuses === 0 ? 1 : totalFuses × 1.5`; `boostedProduction = baseProduction × multiplier`
   (Rule EN-FUSE-3).
7. Total energy level = `sum(boostedProduction for all positioned producers) - sum(baseConsumption for all
   positioned consumers)`.

**Validated against real save data** (see Rule EN-FUSE-3 above): this algorithm reproduces the exact in-game
HUD production value (24075.45 kW) for a real save containing 2 active Optimizers with Energy Fuses.

**Rule EN-PLANET-1 (per-planet scoping, resolved):** each planet has its own independent power grid in-game.
Steps 1–7 above are therefore applied **once per distinct `WorldObject.planet`** rather than once globally:
positioned world objects are grouped by `planet` first, and production, consumption, available, breakdowns
and Optimizers are all computed from each planet's own subset only (`SaveSectionsReaderService.getEnergyLevels`
returns `EnergyLevelsValueObject.planets`, one entry per planet). Optimizer targeting was already restricted to
producers on the same `planet` (Rule EN-OPT-2), so no cross-planet leakage was possible there; this rule only
formalizes that production/consumption/breakdowns are scoped the same way.

**Rule EN-PLANET-2 (planet label resolution):** each planet is labelled using the fixed numeric-id → name
lookup table of `packages/core-mapping/src/domain/planetNamesByNumericId.json` (`@DATATABLE.PlanetNamesByNumericId`),
looked up by `SaveSectionsReaderService.resolvePlanetLabel`. For planet ids not in that table (e.g. future
planets, modded content), a fallback heuristic applies: some world object `gId`s embed the planet name in
plain text (e.g. `Seed7Humble` on planet `Humble`) — if exactly one of the save's known planet names (from
`TerraformationLevels`) is found as a substring of a `gId` among that planet's world objects, that name is
used as the label; otherwise the label falls back to `` `Planet ${planetId}` ``.

**Open points:**
- Distance metric implemented: straight-line 3D distance using `pos` (`"x,y,z"`), restricted to producers on
  the same `planet` as the Optimizer. Height (`y`) is included; this matched real save data as well as a
  horizontal-only (`x,z`) distance would have, so it hasn't been possible to distinguish the two — both gave
  the same targeting result in the validated save.
- A `FuseEnergy1` with `liId` unset / not inside an Optimizer inventory has no effect (ignored), as implemented.
- The planet label fallback heuristic (Rule EN-PLANET-2) only applies to planet ids missing from the static
  lookup table (e.g. planets added by a future game update, or modded content); if that ever fails too, the
  label falls back to a plain numeric id.

---

## 5. Optimizers section (UI)

The UI's Power section displays one card per planet (`EnergyLevelsViewModel.planets`, one
`PlanetEnergyLevelsViewModel` per distinct `WorldObject.planet` — see Rule EN-PLANET-1), each labelled with its
resolved planet name (Rule EN-PLANET-2). Within each planet's card, one sub-card per qualifying Optimizer
(`PlanetEnergyLevelsValueObject.optimizers`, built by the planet's `PlanetEnergyGrid`) shows:

- the label (`Machine optimizer T1` / `Machine Optimizer T2`);
- its Energy Fuse count (`fuseCount`);
- which machines it boosts and how many of each (`boostedMachines`, grouped by `gId` among the producers it
  reaches — the same selection the fuse counts rest on, see section 4);
- its **own contribution to production, computed in isolation** (`contribution`): for each producer it
  boosts, `baseLevel × fuseCount × 1.5`, summed across all boosted producers. When a producer is reached by
  several Optimizers (Rule EN-OPT-3), each Optimizer's card reports its own share rather than the producer's
  final combined output, so contributions across cards do not necessarily sum to `production - baseProduction`.

---

## 6. World object names and labels

`packages/core-mapping/src/domain/worldObjectNames.ts` lists the `gId`s the game is known to use, and derives the
`WorldObjectName` type from them. Until 2026-09-09 the list had been collected by hand from sources that were not
recorded, and it was wrong in both directions: it carried 104 names nothing corroborated and lacked 56 that two
independent sources attest, among them `Incubator2` and `InsideLamp2`, two real consumers that could not be priced
because the type refused them.

**Attestation rule.** A name is kept only if at least one of these two sources carries it:

- the 639 `GROUP_NAME_<gId>=<display name>` keys of the English label file of the community mod [(UI) English Plus Translation](https://github.com/akarnokd/ThePlanetCrafterMods/blob/3f10f457eb9dab78537a3b9dc9f1692679782391/UITranslationEnglishPlus/labels-engplus.txt).
  That mod overrides the game's vanilla English labels, so its *wording* is community-made, but its *keys* are the
  game's own group identifiers — a translation file that used any other key would not resolve in-game. It targets
  game version 2.102 (`LibCommon/GameVersionCheck.cs`, `TargetVersion = "2.102"`), and it is the source that
  distinguishes `OreBreaker*` (ore crusher) from `OreExtractor*`, `InterplanetaryExchangePlatform1` (exchange
  shuttle) and `LarvaeBase1..3` (larva items, not machines).
- the `gId`s read in the six private reference saves — 14 further names, all unlabelled scenery, blueprints and
  escape pods (`RockExplodable`, `Elevator`, `GenerationGroupVein`, `Blueprint*`, `EscapePod*`, …).

The 104 names attested by neither were dropped, including the six `*T*` spellings
(`AirPurificationMachine1T1`..`4T4`, `AlgaeGenerator1T1`, `2T2`): the label file has an entry for every plain
tier and none for any `*T*` form, and none of them appears in a reference save. Dropping a name has no runtime
effect — every construction site casts through `as WorldObjectName` — so the risk of dropping a real one is a
name to re-add, not a defect.

**Energy partition.** The list is declared as three groups whose concatenation is `WORLD_OBJECT_NAMES`: producing
energy, consuming energy, and without a known energy level. Totality is by construction rather than asserted, and
the guard described in section 1 turns any drift between a group and a table red.

**Labels.** `packages/core-mapping/src/presentation/worldObjectLabels.json` maps every `WorldObjectName` to a
display label. `worldObjectLabels.spec.ts` fails on a name without a label and on a label for an unknown name: the
two files cannot drift apart. The 25 labels added on 2026-09-09 come from the label file
above.

**Label wording.** 178 of the 614 labels this repository shares with the label file differ in more than word
order or case, and the repository's wording is deliberately the more precise of the two: it disambiguates names
the game repeats (`GoldenEffigie1..9` are all "Golden effigy" in the game, `WreckEntryLocked1..5` all "Access
Console") and carries bonus percentages the label file does not print. That precision is kept, so the wording is
not realigned on the label file.

Two of the differences were identity discrepancies rather than wording, and the label file's name was adopted for
both: `GeneticManipulator1` is **Tree seed sequencer** (formerly "DNA Manipulator") — which is what the machine
does in-game, the older name most likely predating a game update — and `DebrisContainer1` is **Container from
space** (formerly "Debris"). `GeneticManipulator1` carries an energy value (117.5 kW) collected before this
cross-check, and no page was identified for it: the value is unconfirmed, though the machine's identity no longer
is.
