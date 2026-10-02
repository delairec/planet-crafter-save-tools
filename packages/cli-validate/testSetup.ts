import {enforceTestIsolation} from '../../testing/testIsolation';
import writeValidateCliFixtures from '../../scripts/fixtures/generate-validate-cli-fixtures.ts';

enforceTestIsolation();
await writeValidateCliFixtures();
