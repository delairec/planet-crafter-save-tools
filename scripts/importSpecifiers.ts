const FROM_SPECIFIER_PATTERN = /\bfrom\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_SPECIFIER_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

export function readImportSpecifiers(line: string): string[] {
  return [
    ...Array.from(line.matchAll(FROM_SPECIFIER_PATTERN), match => match[1]!),
    ...Array.from(line.matchAll(DYNAMIC_IMPORT_SPECIFIER_PATTERN), match => match[1]!)
  ];
}
