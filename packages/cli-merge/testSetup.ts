import {enforceTestIsolation} from '../../testing/testIsolation';
import writeMergeCliFixtures from '../../scripts/fixtures/generate-merge-cli-fixtures.ts';

enforceTestIsolation();
await writeMergeCliFixtures();
