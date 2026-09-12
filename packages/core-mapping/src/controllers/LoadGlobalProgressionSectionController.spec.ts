import {describe, expect, it} from 'bun:test';
import {createSaveSectionsParser} from '../composition/compositionRoot';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadGlobalProgressionSectionController} from './LoadGlobalProgressionSectionController';
import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';

describe('LoadGlobalProgressionSectionController', () => {
  it('should present global progression from the parsed save', async () => {
    // Arrange
    const {sections} = createSaveSectionsParser().parse(createFakeSaveContent());

    // Act
    const viewModel = await LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections);

    // Assert
    expect(viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          }
        ]
      },
    });
  });
});

