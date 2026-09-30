import {VALIDATION_ISSUE_CODES} from "../application/ports/validationIssueCodes.ts";
import type {ValidationIssue} from "../application/ports/ValidationIssue.ts";

const FLOAT_FIELDS = new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger'
]);

export function validateFloatSerialization(mergedSave: string): ValidationIssue[] {
  const floatFieldsPattern = Array.from(FLOAT_FIELDS).join('|');
  const regex = new RegExp(`"(${floatFieldsPattern})":(-)?(\\d+)(?![.\\d])`, 'g');

  const issues: ValidationIssue[] = [];
  let match;
  while ((match = regex.exec(mergedSave)) !== null) {
    issues.push({
      code: VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION,
      fieldName: match[1],
      serializedValue: `${match[2] ?? ''}${match[3]}`
    });
  }
  return issues;
}
