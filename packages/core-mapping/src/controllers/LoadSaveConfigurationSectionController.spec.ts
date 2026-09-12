import {describe, expect, it} from 'bun:test';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadSaveConfigurationSectionController} from "./LoadSaveConfigurationSectionController";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";

describe('LoadSaveConfigurationSectionController', () => {
  it('should present save configuration from the parsed save', async () => {
    // Arrange
    const validatedContent = createFakeSaveContent();

    // Act
    const viewModel = await LoadSaveConfigurationSectionController.loadSaveConfigurationSection(validatedContent);

    // Assert
      expect(viewModel).toEqual<SaveConfigurationViewModel>({
        mode: 'Standard',
        title: 'Merged Save',
        modifiers: {
          columns: [
            {
              header: 'Terraformation Pace',
              values: ['10%']
            },
            {
              header: 'Gauge Drain',
              values: ['30%']
            },
            {
              header: 'Meteo Occurrence',
              values: ['40%']
            },
            {
              header: 'Multiplayer Factor',
              values: ['50%']
            },
            {
              header: 'Power Consumption',
              values: ['20%']
            }
          ]
        }
      });
  });
});
