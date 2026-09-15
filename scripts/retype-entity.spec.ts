import {describe, expect, it} from 'bun:test';
import {retypeEntity} from './retype-entity.ts';

const CHECKLIST_TO_PRACTICE = {fromType: 'DECISION', toType: 'PRACTICE', name: 'LeCorpusRemplaceLaChecklistDeFusion'};
const WIRE_TYPES_TO_PRACTICE = {fromType: 'DECISION', toType: 'PRACTICE', name: 'LesReglesDeFusionRecoiventDesDtoWireTypes'};

describe('retypeEntity', () => {

  describe('When the declaration line carries the type being replaced', () => {
    it('should rewrite the type and leave the name untouched', () => {
      // Arrange
      const source = 'DECISION LeCorpusRemplaceLaChecklistDeFusion\n\tSTATUS specified\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('PRACTICE LeCorpusRemplaceLaChecklistDeFusion\n\tSTATUS specified\n');
    });
  });

  describe('When another entity points at the retyped one', () => {
    it('should rewrite the type of the reference site', () => {
      // Arrange
      const source = '\t\tREF @DECISION.LeCorpusRemplaceLaChecklistDeFusion\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('\t\tREF @PRACTICE.LeCorpusRemplaceLaChecklistDeFusion\n');
    });
  });

  describe('When a version suffix extends the name being retyped', () => {
    it('should leave the successor declaration and its reference sites to their own type', () => {
      // Arrange
      const source = [
        'DECISION LesReglesDeFusionRecoiventDesDtoWireTypes',
        'DECISION LesReglesDeFusionRecoiventDesDtoWireTypes:v2',
        '\tSUPERSEDES @DECISION.LesReglesDeFusionRecoiventDesDtoWireTypes:v2',
        ''
      ].join('\n');

      // Act
      const retyped = retypeEntity(source, WIRE_TYPES_TO_PRACTICE);

      // Assert
      expect(retyped).toBe([
        'PRACTICE LesReglesDeFusionRecoiventDesDtoWireTypes',
        'DECISION LesReglesDeFusionRecoiventDesDtoWireTypes:v2',
        '\tSUPERSEDES @DECISION.LesReglesDeFusionRecoiventDesDtoWireTypes:v2',
        ''
      ].join('\n'));
    });
  });

  describe('When another entity of the same type shares the file', () => {
    it('should leave it to its type', () => {
      // Arrange
      const source = 'DECISION LeCorpusEstDecoupeParDomaine\n\tSTATUS implemented\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('DECISION LeCorpusEstDecoupeParDomaine\n\tSTATUS implemented\n');
    });
  });

  describe('When the name appears in prose without its type prefix', () => {
    it('should leave the prose untouched, a mention being indexed by nothing', () => {
      // Arrange
      const source = '\tDESC "LeCorpusRemplaceLaChecklistDeFusion dit ce que la promotion vaut"\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('\tDESC "LeCorpusRemplaceLaChecklistDeFusion dit ce que la promotion vaut"\n');
    });
  });

  describe('When a declaration form is quoted inside a field value', () => {
    it('should leave it untouched, a declaration standing at the first column', () => {
      // Arrange
      const source = '\tREJECTED "DECISION LeCorpusRemplaceLaChecklistDeFusion sans sa garde de promotion"\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('\tREJECTED "DECISION LeCorpusRemplaceLaChecklistDeFusion sans sa garde de promotion"\n');
    });
  });

  describe('When the same entity is referenced several times', () => {
    it('should rewrite every site', () => {
      // Arrange
      const source = [
        '\tBLOCKS @DECISION.LeCorpusRemplaceLaChecklistDeFusion',
        '\t\tREF @DECISION.LeCorpusRemplaceLaChecklistDeFusion',
        ''
      ].join('\n');

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe([
        '\tBLOCKS @PRACTICE.LeCorpusRemplaceLaChecklistDeFusion',
        '\t\tREF @PRACTICE.LeCorpusRemplaceLaChecklistDeFusion',
        ''
      ].join('\n'));
    });
  });

  describe('When the source holds no site of the entity', () => {
    it('should return the source unchanged', () => {
      // Arrange
      const source = 'DECISION LeCorpusVitDansLeDepotPublic\n';

      // Act
      const retyped = retypeEntity(source, CHECKLIST_TO_PRACTICE);

      // Assert
      expect(retyped).toBe('DECISION LeCorpusVitDansLeDepotPublic\n');
    });
  });
});
