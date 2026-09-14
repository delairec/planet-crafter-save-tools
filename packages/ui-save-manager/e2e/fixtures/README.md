# End-to-end fixtures

Save files used by the scenarios. They are generated, never copied from a real game save: `input/` is not versioned,
so the suite has to run on a machine — and on a CI runner — that has no real save at hand.

Every fixture is the output of `createFakeSaveContent()`, from
`packages/shared-save-processing/testing/createFakeSaveContent.js` (a wrapper around `createFakeSaveString.js`, the
generator the unit tests already rely on). Pass an override object to build a variant; the record builders the
overrides use come from `packages/shared-save-processing/testing/createSaveRecords.js`. A fixture meant to be valid is
checked with `bun validate -- --file=<path>`.

## `valid-save.json`

`createFakeSaveContent()` called with no override. Regenerate it from the repository root:

```
bun -e "
import {createFakeSaveContent} from './packages/shared-save-processing/testing/createFakeSaveContent.js';
await Bun.write('packages/ui-save-manager/e2e/fixtures/valid-save.json', createFakeSaveContent());
"
```

## `companion-save.json`

The second save of a merge: another player, another set of world objects and inventories, another save display name,
so that the file the merge produces can be told apart from both of its sources. Its player is a host, like the player
of `valid-save.json` — a save designating no host does not pass validation, and the merge is what demotes the second
host. Regenerate it from the repository root:

```
bun -e "
import {createFakeSaveContent} from './packages/shared-save-processing/testing/createFakeSaveContent.js';
import {createEquipment, createGlobalMetadata, createInventory, createPlayer, createSaveConfiguration, createWorldObject} from './packages/shared-save-processing/testing/createSaveRecords.js';
await Bun.write('packages/ui-save-manager/e2e/fixtures/companion-save.json', createFakeSaveContent({
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
