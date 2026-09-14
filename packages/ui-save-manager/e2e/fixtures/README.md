# End-to-end fixtures

Save files used by the scenarios. They are generated, never copied from a real game save: `input/` is not versioned,
so the suite has to run on a machine — and on a CI runner — that has no real save at hand.

Every fixture is the output of `createFakeSaveContent()`, from
`packages/shared-save-processing/testing/createFakeSaveContent.js` (a wrapper around `createFakeSaveString.js`, the
generator the unit tests already rely on). Pass an override object to build a variant; the record builders the
overrides use come from `packages/shared-save-processing/testing/createSaveRecords.js`. A fixture meant to be valid is
checked with `bun validate -- --file=<path>`.

## Naming

`<content>_<expected>.json`: what the save carries that no other fixture carries, then the verdict the validator
gives it — `valid` or `invalid`. Words inside a segment are separated by a hyphen, the two segments by an underscore.
The role a fixture plays in a scenario is not part of its name: the same file is the save under display in one
scenario and save A of a merge in another, so the role belongs to the variable that binds it and to this file.

## `baseline_valid.json`

`createFakeSaveContent()` called with no override. Regenerate it from the repository root:

```
bun -e "
import {createFakeSaveContent} from './packages/shared-save-processing/testing/createFakeSaveContent.js';
await Bun.write('packages/ui-save-manager/e2e/fixtures/baseline_valid.json', createFakeSaveContent());
"
```

## `other-player_valid.json`

Another player, another set of world objects and inventories, another save display name, so that the file a merge
produces can be told apart from both of its sources. Its player is a host, like the player of `baseline_valid.json` —
a save designating no host does not pass validation, and the merge is what demotes the second host. Regenerate it
from the repository root:

```
bun -e "
import {createFakeSaveContent} from './packages/shared-save-processing/testing/createFakeSaveContent.js';
import {createEquipment, createGlobalMetadata, createInventory, createPlayer, createSaveConfiguration, createWorldObject} from './packages/shared-save-processing/testing/createSaveRecords.js';
await Bun.write('packages/ui-save-manager/e2e/fixtures/other-player_valid.json', createFakeSaveContent({
  globalMetadata: createGlobalMetadata({terraTokens: 250, allTimeTerraTokens: 310_456, unlockedGroups: 'BootsSpeed2'}),
  players: [createPlayer({id: '76561190000000007', name: 'Sakia', inventoryId: 144, equipmentId: 145})],
  inventories: [
    createInventory({id: 144, woIds: '31000001,31000002'}),
    createEquipment({id: 145, woIds: '31000003,31000004'})
  ],
  worldObjects: [
    createWorldObject({id: 31000001, gId: 'Phytoplankton2'}),
    createWorldObject({id: 31000002, gId: 'NeptunQuartz'}),
    createWorldObject({id: 31000003, gId: 'Backpack5'}),
    createWorldObject({id: 31000004, gId: 'OxygenTank3'}),
    createWorldObject({id: 31000005, gId: 'WindTurbine2', pos: '20,0,0', planet: 1}),
    createWorldObject({id: 31000006, gId: 'Heater2', pos: '21,0,0', planet: 1})
  ],
  saveConfiguration: createSaveConfiguration({saveDisplayName: 'Companion Save', worldSeed: 77})
}));
"
```
