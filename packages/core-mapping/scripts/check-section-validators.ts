import {SECTION_VALIDATORS_PATH, generateSectionValidatorsSource} from './generate-section-validators.ts';

const DIVERGED_VALIDATORS_REASON = 'regenerating them from the JSON Schemas of shared-save-processing does not reproduce the versioned module: run bun run generate:section-validators and commit what it writes';
const MISSING_VALIDATORS_REASON = 'the repository does not carry the generated module: run bun run generate:section-validators and commit what it writes';

export function findSectionValidatorsDivergence({regeneratedSource, versionedSource}: {
  regeneratedSource: string;
  versionedSource: string | null;
}): string | null {
  if (versionedSource === null) {
    return MISSING_VALIDATORS_REASON;
  }
  if (versionedSource !== regeneratedSource) {
    return DIVERGED_VALIDATORS_REASON;
  }

  return null;
}

async function readVersionedSectionValidators(): Promise<string | null> {
  const versionedFile = Bun.file(SECTION_VALIDATORS_PATH);

  return await versionedFile.exists() ? versionedFile.text() : null;
}

async function checkSectionValidators(): Promise<number> {
  const divergence = findSectionValidatorsDivergence({
    regeneratedSource: generateSectionValidatorsSource(),
    versionedSource: await readVersionedSectionValidators()
  });
  if (divergence !== null) {
    console.error(`check:section-validators: ${SECTION_VALIDATORS_PATH}\n  ${divergence}`);
    return 1;
  }
  console.log('check:section-validators: the versioned section validators match the JSON Schemas.');

  return 0;
}

if (import.meta.main) {
  process.exit(await checkSectionValidators());
}
