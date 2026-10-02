import {enforceTestIsolation} from '../../testing/testIsolation';
import writeMergeCliFixtures from '../../scripts/generate-merge-cli-fixtures.ts';

enforceTestIsolation();
await writeMergeCliFixtures();
