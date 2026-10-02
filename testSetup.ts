import {enforceTestIsolation} from './testing/testIsolation';
import writeMergeCliFixtures from './scripts/generate-merge-cli-fixtures.ts';
import writeValidateCliFixtures from './scripts/generate-validate-cli-fixtures.ts';

enforceTestIsolation();
await writeMergeCliFixtures();
await writeValidateCliFixtures();
