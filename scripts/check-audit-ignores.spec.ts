import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkAuditIgnores, findUnacknowledgedAdvisories} from './check-audit-ignores.ts';

const AUDIT_IGNORING_TWO_ADVISORIES = 'bun audit --audit-level=moderate --ignore=GHSA-aaaa-bbbb-cccc --ignore=GHSA-dddd-eeee-ffff';

describe('findUnacknowledgedAdvisories', () => {

  describe('When an active limitation names every ignored advisory in its SEEN_IN', () => {
    it('should find none', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresTwoAdvisories',
        '\tSYMPTOM "two advisories are ignored"',
        '\tUNTIL "the upstream dependencies upgrade"',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc --ignore=GHSA-dddd-eeee-ffff"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual([]);
    });
  });

  describe('When the SEEN_IN naming the advisory wraps onto a continuation line', () => {
    it('should find none', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresTwoAdvisories',
        '\tSYMPTOM "two advisories are ignored"',
        '\tUNTIL "the upstream dependencies upgrade"',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc"',
        '\t\t+ "--ignore=GHSA-dddd-eeee-ffff"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual([]);
    });
  });

  describe('When each ignored advisory is named by a limitation of its own', () => {
    it('should find none', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresAFirstAdvisory',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc"',
        '',
        'LIMITATION TheAuditIgnoresASecondAdvisory',
        '\tSEEN_IN "package.json::--ignore=GHSA-dddd-eeee-ffff"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual([]);
    });
  });

  describe('When no limitation names an ignored advisory', () => {
    it('should find that advisory', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresAFirstAdvisory',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual(['GHSA-dddd-eeee-ffff']);
    });
  });

  describe('When the only limitation naming the advisories is archived', () => {
    it('should find both advisories', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresTwoAdvisories',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc --ignore=GHSA-dddd-eeee-ffff"',
        '\tSTATUS archived',
        '\tARCHIVED_ON 2026-09-23'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual(['GHSA-aaaa-bbbb-cccc', 'GHSA-dddd-eeee-ffff']);
    });
  });

  describe('When an active limitation names the advisories outside its SEEN_IN', () => {
    it('should find both advisories', () => {
      // Arrange
      const corpusSource = [
        'LIMITATION TheAuditIgnoresTwoAdvisories',
        '\tSYMPTOM "GHSA-aaaa-bbbb-cccc and GHSA-dddd-eeee-ffff are ignored"',
        '\tSEEN_IN "package.json::bun audit"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual(['GHSA-aaaa-bbbb-cccc', 'GHSA-dddd-eeee-ffff']);
    });
  });

  describe('When an entity other than a limitation names the advisories in a SEEN_IN', () => {
    it('should find both advisories', () => {
      // Arrange
      const corpusSource = [
        'DECISION TheAuditIgnoresTwoAdvisories',
        '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc --ignore=GHSA-dddd-eeee-ffff"'
      ].join('\n');

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: AUDIT_IGNORING_TWO_ADVISORIES, corpusSource});

      // Assert
      expect(advisories).toEqual(['GHSA-aaaa-bbbb-cccc', 'GHSA-dddd-eeee-ffff']);
    });
  });

  describe('When the audit ignores no advisory', () => {
    it('should find none', () => {
      // Arrange
      const auditIgnoringNothing = 'bun audit --audit-level=moderate';
      const corpusWithoutLimitation = '';

      // Act
      const advisories = findUnacknowledgedAdvisories({auditScript: auditIgnoringNothing, corpusSource: corpusWithoutLimitation});

      // Assert
      expect(advisories).toEqual([]);
    });
  });
});

describe('checkAuditIgnores', () => {

  const LIMITATION_NAMING_ONE_ADVISORY = [
    'LIMITATION TheAuditIgnoresOneAdvisory',
    '\tSYMPTOM "one advisory is ignored"',
    '\tUNTIL "the upstream dependency upgrades"',
    '\tSEEN_IN "package.json::--ignore=GHSA-aaaa-bbbb-cccc"'
  ].join('\n');

  describe('When an active limitation of the corpus names every advisory the audit script of the manifest ignores', () => {
    it('should print that every ignored advisory is named and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'package.json': '{"scripts": {"audit": "bun audit --audit-level=moderate --ignore=GHSA-aaaa-bbbb-cccc"}}',
          'docs/limitations.awawa': LIMITATION_NAMING_ONE_ADVISORY
        }
      });

      // Act
      await checkAuditIgnores(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:audit-ignores: every advisory the audit ignores is named by an active LIMITATION.'],
        exitCodes: [0]
      });
    });
  });

  describe('When the audit script ignores an advisory only a corpus outside our sources names', () => {
    it('should print the advisory no active limitation names, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'package.json': '{"scripts": {"audit": "bun audit --audit-level=moderate --ignore=GHSA-aaaa-bbbb-cccc"}}',
          'node_modules/some-lib/docs/limitations.awawa': LIMITATION_NAMING_ONE_ADVISORY
        }
      });

      // Act
      await checkAuditIgnores(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'package.json scripts.audit ignores GHSA-aaaa-bbbb-cccc, which no active LIMITATION names in a SEEN_IN',
          'check:audit-ignores: 1 ignored advisory(ies) no active LIMITATION names.'
        ],
        exitCodes: [1]
      });
    });
  });
});
