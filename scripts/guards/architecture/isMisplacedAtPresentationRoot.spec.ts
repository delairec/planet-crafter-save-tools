import {describe, expect, it} from 'bun:test';
import {isMisplacedAtPresentationRoot} from './isMisplacedAtPresentationRoot.ts';

describe('isMisplacedAtPresentationRoot', () => {

  describe('When a module other than a presenter lies at the root of a presentation folder of a core- package', () => {
    it.each([
      ['a mapper', 'packages/core-mapping/src/display/presentation/formatShare.ts'],
      ['the spec of a mapper', 'packages/core-mapping/src/display/presentation/createPowerChart.spec.ts'],
      ['a JavaScript module', 'packages/core-mapping/src/save/presentation/saveSectionLabels.js'],
      ['a module of a presentation folder laid out without businesses', 'packages/core-other/src/presentation/formatPlayerName.ts']
    ])('should report %s', (_module, filePath) => {
      // Act
      const misplaced = isMisplacedAtPresentationRoot(filePath);

      // Assert
      expect(misplaced).toBe(true);
    });
  });

  describe('When the module is a presenter or lies in a subfolder of the presentation folder', () => {
    it.each([
      ['a presenter', 'packages/core-mapping/src/display/presentation/PowerPagePresenter.ts'],
      ['the spec of a presenter', 'packages/core-mapping/src/display/presentation/PowerPagePresenter.spec.ts'],
      ['a mapper', 'packages/core-mapping/src/display/presentation/mappers/formatShare.ts'],
      ['a mapper of a nested folder', 'packages/core-mapping/src/display/presentation/mappers/formatters/formatNumber/formatNumber.ts'],
      ['a view model', 'packages/core-mapping/src/display/presentation/viewModels/PowerPageViewModel.ts'],
      ['a messages file', 'packages/core-mapping/src/display/presentation/messages/powerPageMessages.js']
    ])('should leave %s alone', (_module, filePath) => {
      // Act
      const misplaced = isMisplacedAtPresentationRoot(filePath);

      // Assert
      expect(misplaced).toBe(false);
    });
  });

  describe('When the module lies outside the presentation folder of a core- package', () => {
    it.each([
      ['a presentation folder of a ui- package', 'packages/ui-save-manager/src/presentation/PlayersView.ts'],
      ['a use case', 'packages/core-mapping/src/display/application/DisplayPowerPage.ts'],
      ['an installed dependency', 'packages/core-mapping/node_modules/x/presentation/formatShare.ts'],
      ['a build output', 'packages/core-mapping/dist/presentation/formatShare.js']
    ])('should leave %s alone', (_module, filePath) => {
      // Act
      const misplaced = isMisplacedAtPresentationRoot(filePath);

      // Assert
      expect(misplaced).toBe(false);
    });
  });
});
