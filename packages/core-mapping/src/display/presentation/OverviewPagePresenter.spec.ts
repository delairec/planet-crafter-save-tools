import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {OverviewPagePresenter} from "./OverviewPagePresenter";
import {OverviewPageViewModel} from "./viewModels/OverviewPageViewModel";

const nbsp = '\u00A0';

describe('OverviewPagePresenter', () => {
  it('should name the save in the identity and show the progression tiles', () => {
    // Arrange
    const presenter = new OverviewPagePresenter();

    // Act
    presenter.displayOverviewPage({
      saveFile: {name: 'Standard-1.json', size: 2_540},
      saveConfiguration: {displayName: 'Six Planets', mode: 'Custom', gameRelease: '2.103'},
      progression: {allTimeTerraTokens: 42_000, totalCraftedObjects: 1_310, droneLogistics: {paused: true, effect: 'penalisesThePlayer'}}
    });

    // Assert
    expect(presenter.viewModel).toEqual<OverviewPageViewModel>({
      identity: {title: 'Six Planets', hint: `Custom · Game release 2.103 · 2.48${nbsp}KB`},
      tiles: {
        allTimeTerraTokens: {label: 'All time Terra Tokens', value: '42,000', unit: '=tt='},
        totalCraftedObjects: {label: 'Total crafted objects', value: '1,310'},
        droneLogistics: {label: 'Drone logistics', badge: {value: 'Paused', tone: 'danger', toneLabel: 'penalises the player'}}
      }
    });
  });

  describe('When the save has neither statistics nor drone logistics', () => {
    it('should show the Terra Tokens tile alone', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Six Planets', mode: 'Custom', gameRelease: '2.103'},
        progression: {allTimeTerraTokens: 42_000}
      });

      // Assert
      expect(presenter.viewModel.tiles).toEqual({
        allTimeTerraTokens: {label: 'All time Terra Tokens', value: '42,000', unit: '=tt='}
      });
    });
  });

  describe('When the save has no configuration', () => {
    it('should name the save after its file and give its size alone', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({
        saveFile: {name: 'Standard-1.json', size: 2_097_152},
        progression: {allTimeTerraTokens: 42_000}
      });

      // Assert
      expect(presenter.viewModel.identity).toEqual({title: 'Standard-1.json', hint: `2${nbsp}MB`});
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should expose the unreadable lines instead of the overview', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<OverviewPageViewModel>({
        identity: {title: '', hint: ''},
        tiles: {},
        unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]
      });
    });
  });
});
