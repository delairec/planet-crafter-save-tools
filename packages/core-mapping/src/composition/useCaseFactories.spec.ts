import {describe, expect, it, mock} from 'bun:test';
import {createFakeSaveContent} from '../infrastructure/testing/createFakeSaveContent';
import {ConfigurationPagePresenterPort} from '../application/ports/ConfigurationPagePresenterPort';
import {EnergyLevelsPresenterPort} from '../application/ports/EnergyLevelsPresenterPort';
import {PlayersMenuPresenterPort} from '../application/ports/PlayersMenuPresenterPort';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {SaveIdentityPresenterPort} from '../application/ports/SaveIdentityPresenterPort';
import {TerraformationLevelsPresenterPort} from '../application/ports/TerraformationLevelsPresenterPort';
import {
  createLoadConfigurationPage,
  createLoadEnergyLevelsSection,
  createLoadPlayersMenu,
  createLoadPlayersSection,
  createLoadSaveIdentity,
  createLoadTerraformationLevelsSection
} from './useCaseFactories';

describe('useCaseFactories', () => {
  describe('When the save manager loads the configuration page', () => {
    it('should present the progression read from the save', async () => {
      // Arrange
      const presenter = {displayConfigurationPage: mock(), displaySaveWithUnreadableLines: mock()} satisfies ConfigurationPagePresenterPort;
      const useCase = createLoadConfigurationPage(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent()});

      // Assert
      expect(presenter.displayConfigurationPage).toHaveBeenCalledWith(expect.objectContaining({globalProgression: {allTimeTerraTokens: 200345}}));
    });
  });

  describe('When the save manager loads the energy levels', () => {
    it('should present the production computed from the energy levels of the declared game release', async () => {
      // Arrange
      const presenter = {displayEnergyLevels: mock(), displaySaveWithUnreadableLines: mock()} satisfies EnergyLevelsPresenterPort;
      const useCase = createLoadEnergyLevelsSection(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent()});

      // Assert
      expect(presenter.displayEnergyLevels).toHaveBeenCalledWith(expect.objectContaining({
        gameRelease: '2.004',
        planets: [expect.objectContaining({planetId: 1, production: 2220.2})]
      }));
    });
  });

  describe('When the save manager loads the players menu', () => {
    it('should present the players of the save', async () => {
      // Arrange
      const presenter = {displayPlayersMenu: mock(), displaySaveWithUnreadableLines: mock()} satisfies PlayersMenuPresenterPort;
      const useCase = createLoadPlayersMenu(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent()});

      // Assert
      expect(presenter.displayPlayersMenu).toHaveBeenCalledWith([{name: 'Nikowa', planet: 'Toxicity', isHost: true}]);
    });
  });

  describe('When the save manager loads the players section', () => {
    it('should present the inventory and the equipment each player carries', async () => {
      // Arrange
      const presenter = {displayPlayers: mock(), displaySaveWithUnreadableLines: mock()} satisfies PlayersPresenterPort;
      const useCase = createLoadPlayersSection(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent()});

      // Assert
      expect(presenter.displayPlayers).toHaveBeenCalledWith(expect.objectContaining({
        players: [{name: 'Nikowa', inventory: ['Phytoplankton3', 'MagnetarQuartz'], equipment: ['Backpack4', 'OxygenTank5']}]
      }));
    });
  });

  describe('When the save manager loads the save identity', () => {
    it('should present the game release the save declares', async () => {
      // Arrange
      const presenter = {
        displaySaveIdentity: mock(),
        displayUnconfiguredSaveIdentity: mock(),
        displaySaveWithUnreadableLines: mock()
      } satisfies SaveIdentityPresenterPort;
      const useCase = createLoadSaveIdentity(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent(), fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displaySaveIdentity).toHaveBeenCalledWith(expect.objectContaining({gameRelease: '2.004'}));
    });
  });

  describe('When the save manager loads the terraformation levels', () => {
    it('should present the terraformation index of each planet', async () => {
      // Arrange
      const presenter = {displayTerraformationLevels: mock(), displaySaveWithUnreadableLines: mock()} satisfies TerraformationLevelsPresenterPort;
      const useCase = createLoadTerraformationLevelsSection(presenter);

      // Act
      await useCase.execute({content: createFakeSaveContent()});

      // Assert
      expect(presenter.displayTerraformationLevels).toHaveBeenCalledWith([expect.objectContaining({planetId: 'Toxicity', terraformationIndex: 2800})]);
    });
  });
});
