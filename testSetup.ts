import {enforceTestIsolation} from './testing/testIsolation';
import writeMergeCliFixtures from './scripts/fixtures/generate-merge-cli-fixtures.ts';
import writeValidateCliFixtures from './scripts/fixtures/generate-validate-cli-fixtures.ts';

enforceTestIsolation();
await writeMergeCliFixtures();
await writeValidateCliFixtures();
