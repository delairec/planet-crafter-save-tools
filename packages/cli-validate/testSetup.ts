import {enforceTestIsolation} from '../../testing/testIsolation';
import writeValidateCliFixtures from '../../scripts/generate-validate-cli-fixtures.ts';

enforceTestIsolation();
await writeValidateCliFixtures();
