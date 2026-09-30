import {UnreadableLineResponse} from "../application/responses/UnreadableLineResponse";
import {describe, expect, it} from 'bun:test';
import {ConfigurationPagePresenter} from "./ConfigurationPagePresenter";
import {ConfigurationPageViewModel} from "./viewModels/ConfigurationPageViewModel";
import {AssessedSaveConfigurationResponse} from "../application/responses/ConfigurationPageResponse";

function createAssessedSaveConfiguration(): AssessedSaveConfigurationResponse {
  return {
    modifiers: {terraformationPace: 2, powerConsumption: 1, gaugeDrain: 0.5, meteoOccurrence: 0.25, multiplayerFactor: 1},
    modifierEffects: {
      terraformationPace: 'penalisesThePlayer',
      powerConsumption: 'gameDefault',
      gaugeDrain: 'penalisesThePlayer',
      meteoOccurrence: 'helpsThePlayer',
      multiplayerFactor: 'gameDefault'
    },
    unlocks: {
      freeCraft: true,
      everythingUnlocked: false,
      spaceTrading: true,
      oreExtractors: false,
      teleporters: false,
      drones: true,
      autocrafter: false,
      randomizedMineables: true
    }
  };
}

describe('ConfigurationPagePresenter', () => {
  it('should show the progression, the modifiers in their tones and the unlock flags', () => {
    // Arrange
    const presenter = new ConfigurationPagePresenter();

    // Act
    presenter.displayConfigurationPage({
      globalProgression: {allTimeTerraTokens: 1_234_567},
      statistics: {totalCraftedObjects: 10},
      assessedSaveConfiguration: createAssessedSaveConfiguration()
    });

    // Assert
    expect(presenter.viewModel).toEqual<ConfigurationPageViewModel>({
      progression: {
        fields: [
          {label: 'All time Terra Tokens', value: '1,234,567 =tt='},
          {label: 'Total crafted objects', value: '10'}
        ]
      },
      modifiers: {
        modifiers: [
          {label: 'Terraformation Pace', badge: {value: '200 %', tone: 'danger', toneLabel: 'penalises the player'}},
          {label: 'Gauge Drain', badge: {value: '× 0.5', tone: 'danger', toneLabel: 'penalises the player'}},
          {label: 'Meteo Occurrence', badge: {value: '25 %', tone: 'positive', toneLabel: 'helps the player'}},
          {label: 'Multiplayer Factor', badge: {value: '× 1', tone: 'neutral', toneLabel: 'game default'}},
          {label: 'Power Consumption', badge: {value: '100 %', tone: 'neutral', toneLabel: 'game default'}}
        ]
      },
      unlocks: {
        flags: [
          {label: 'Free craft', state: 'on', stateLabel: 'on'},
          {label: 'Everything unlocked', state: 'off', stateLabel: 'off'},
          {label: 'Space trading', state: 'on', stateLabel: 'on'},
          {label: 'Ore extractors', state: 'off', stateLabel: 'off'},
          {label: 'Teleporters', state: 'off', stateLabel: 'off'},
          {label: 'Drones', state: 'on', stateLabel: 'on'},
          {label: 'Autocrafter', state: 'off', stateLabel: 'off'},
          {label: 'Randomized mineables', state: 'on', stateLabel: 'on'}
        ]
      }
    });
  });

  describe('When the save has no statistics', () => {
    it('should show the progression with no crafted object counted', () => {
      // Arrange
      const presenter = new ConfigurationPagePresenter();
      const noStatistics = undefined;
      const noSaveConfiguration = undefined;

      // Act
      presenter.displayConfigurationPage({
        globalProgression: {allTimeTerraTokens: 500},
        statistics: noStatistics,
        assessedSaveConfiguration: noSaveConfiguration
      });

      // Assert
      expect(presenter.viewModel).toEqual<ConfigurationPageViewModel>({
        progression: {
          fields: [
            {label: 'All time Terra Tokens', value: '500 =tt='},
            {label: 'Total crafted objects', value: '0'}
          ]
        }
      });
    });
  });

  describe('When the drone logistics is paused', () => {
    it('should show the drone logistics as a badge in the danger tone', () => {
      // Arrange
      const presenter = new ConfigurationPagePresenter();

      // Act
      presenter.displayConfigurationPage({globalProgression: {allTimeTerraTokens: 500, logisticsPaused: true}});

      // Assert
      expect(presenter.viewModel.progression.droneLogistics).toEqual({
        label: 'Drone logistics',
        badge: {value: 'Paused', tone: 'danger', toneLabel: 'penalises the player'}
      });
    });
  });

  describe('When the drone logistics is running', () => {
    it('should show the drone logistics as a badge in the positive tone', () => {
      // Arrange
      const presenter = new ConfigurationPagePresenter();

      // Act
      presenter.displayConfigurationPage({globalProgression: {allTimeTerraTokens: 500, logisticsPaused: false}});

      // Assert
      expect(presenter.viewModel.progression.droneLogistics).toEqual({
        label: 'Drone logistics',
        badge: {value: 'Running', tone: 'positive', toneLabel: 'helps the player'}
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the configuration page', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = new ConfigurationPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<ConfigurationPageViewModel>({progression: {fields: []}, unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
