import {enforceTestIsolation} from '../../testing/testIsolation';
import writeScenarioFixtures from '../../scripts/generate-scenario-fixtures.ts';

enforceTestIsolation();
await writeScenarioFixtures();
