import {describe, expect, it} from 'bun:test';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadConfigurationPageController} from './LoadConfigurationPageController';
import {ModifierViewModel} from '../presentation/viewModels/ConfigurationPageViewModel';

describe('LoadConfigurationPageController', () => {
  it('should present the modifiers of the parsed save in their tones', async () => {
    // Arrange
    const validatedContent = createFakeSaveContent();

    // Act
    const viewModel = await LoadConfigurationPageController.loadConfigurationPage(validatedContent);

    // Assert
    expect<ModifierViewModel[] | undefined>(viewModel.modifiers?.modifiers).toEqual([
      {label: 'Terraformation Pace', badge: {value: '10 %', tone: 'positive', toneLabel: 'helps the player'}},
      {label: 'Gauge Drain', badge: {value: '× 0.3', tone: 'danger', toneLabel: 'penalises the player'}},
      {label: 'Meteo Occurrence', badge: {value: '40 %', tone: 'positive', toneLabel: 'helps the player'}},
      {label: 'Multiplayer Factor', badge: {value: '× 0.5', tone: 'danger', toneLabel: 'penalises the player'}},
      {label: 'Power Consumption', badge: {value: '20 %', tone: 'positive', toneLabel: 'helps the player'}}
    ]);
  });
});
