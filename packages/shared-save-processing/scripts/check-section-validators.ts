import {generateSectionValidatorsSource} from './generate-section-validators.ts';
import {runAsEntryPoint, SECTION_VALIDATORS_PATH, type SectionValidatorsFileIo} from './sectionValidatorsFile.ts';

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

export async function checkSectionValidators(io: SectionValidatorsFileIo): Promise<void> {
  const divergence = findSectionValidatorsDivergence({
    regeneratedSource: generateSectionValidatorsSource(),
    versionedSource: await io.readVersionedSource()
  });
  if (divergence !== null) {
    io.printError(`check:section-validators: ${SECTION_VALIDATORS_PATH}\n  ${divergence}`);
    io.exit(1);
    return;
  }
  io.print('check:section-validators: the versioned section validators match the JSON Schemas.');
  io.exit(0);
}

await runAsEntryPoint(import.meta.main, checkSectionValidators);
