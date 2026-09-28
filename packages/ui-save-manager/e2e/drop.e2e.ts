import {readFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {type Locator, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {chooseTheTwoSavesToMerge, locateTheFixture} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');

interface DroppedFile {
  name: string;
  content: string;
}

async function readTheFixture(fixturePath: string): Promise<DroppedFile> {
  return {name: basename(fixturePath), content: await readFile(fixturePath, 'utf8')};
}

async function readTheFixturesAndOpenThePage(page: Page, fixturePaths: string[]): Promise<DroppedFile[]> {
  const droppedFiles = await Promise.all(fixturePaths.map(readTheFixture));
  await page.goto('/');

  return droppedFiles;
}

async function dropTheFiles(page: Page, area: Locator, droppedFiles: DroppedFile[]): Promise<void> {
  const dataTransfer = await page.evaluateHandle((files) => {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(new File([file.content], file.name)));
    return transfer;
  }, droppedFiles);
  await area.dispatchEvent('drop', {dataTransfer});
}

/** A file manager proposes to move what it drags; the browser starts every drag event from that effect. */
const effectProposedByTheFileManager = 'move';

type DragEventType = 'dragenter' | 'dragover';

async function dispatchTheDrag(page: Page, element: Locator, type: DragEventType, droppedFiles: DroppedFile[]) {
  const dataTransfer = await page.evaluateHandle(([files, proposedEffect]) => {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(new File([file.content], file.name)));
    transfer.dropEffect = proposedEffect;
    return transfer;
  }, [droppedFiles, effectProposedByTheFileManager] as const);
  return element.evaluate((target, [eventType, transfer]) => {
    const event = new DragEvent(eventType, {bubbles: true, cancelable: true, dataTransfer: transfer});
    target.dispatchEvent(event);
    return {isTaken: event.defaultPrevented, announcedEffect: transfer.dropEffect};
  }, [type, dataTransfer] as const);
}

async function isTakenByThePage(page: Page, element: Locator, type: DragEventType, droppedFiles: DroppedFile[]): Promise<boolean> {
  return (await dispatchTheDrag(page, element, type, droppedFiles)).isTaken;
}

async function openThePageAndReadTheEffectAnnouncedOver(page: Page, findTheElement: (openedPage: Page) => Locator): Promise<string> {
  const [baselineSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath]);

  return (await dispatchTheDrag(page, findTheElement(page), 'dragover', [baselineSave])).announcedEffect;
}

async function expectTheSavesChosenForTheMerge(page: Page, chosenSaves: {saveA: RegExp; saveB: RegExp}): Promise<void> {
  await expect(page.getByTestId('save-a')).toHaveValue(chosenSaves.saveA);
  await expect(page.getByTestId('save-b')).toHaveValue(chosenSaves.saveB);
}

const scriptBuiltTransferKeepsNoEffect = 'Chromium and WebKit ignore a drop effect set on a script-built DataTransfer';

test.describe('Save file drop', () => {
  test.describe('When a save file is dropped on the display area', () => {
    test('should display that file as if it had been picked', async ({page}) => {
      // Arrange
      const [baselineSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath]);
      await dropTheFiles(page, page.getByTestId('display-area'), [baselineSave]);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('save-file')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
    });
  });

  test.describe('When a save file is dropped on the save B area', () => {
    test('should select it as save B only', async ({page}) => {
      // Arrange
      const [baselineSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath]);

      // Act
      await dropTheFiles(page, page.getByTestId('save-b-area'), [baselineSave]);

      // Assert
      await expect(page.getByTestId('save-b')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('save-a')).toHaveValue('');
    });
  });

  test.describe('When two save files are dropped together on the merge section', () => {
    test('should select them as save A and save B in the alphabetical order of their names', async ({page}) => {
      // Arrange
      const [otherPlayerSave, baselineSave] = await readTheFixturesAndOpenThePage(page, [otherPlayerSaveFixturePath, baselineSaveFixturePath]);

      // Act
      await dropTheFiles(page, page.getByTestId('merge-area'), [otherPlayerSave, baselineSave]);

      // Assert
      await expectTheSavesChosenForTheMerge(page, {saveA: /baseline_valid\.json$/, saveB: /other-player_valid\.json$/});
      await expect(page.getByTestId('merge')).toBeEnabled();
    });
  });

  test.describe('When the two selected saves are swapped', () => {
    test('should select save A as save B and save B as save A', async ({page}) => {
      // Arrange
      await page.goto('/');
      await chooseTheTwoSavesToMerge(page, baselineSaveFixturePath, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('swap-saves').click();

      // Assert
      await expectTheSavesChosenForTheMerge(page, {saveA: /other-player_valid\.json$/, saveB: /baseline_valid\.json$/});
    });
  });

  test.describe('When the pointer rests on the swap button', () => {
    test('should show its label as a tooltip', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-a').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('swap-saves').hover();

      // Assert
      await expect(page.getByTestId('swap-saves-description')).toHaveText('Swap save A and save B');
    });
  });

  test.describe('When save files enter a save area', () => {
    test('should take them, so that the browser lets them be dropped without a further move', async ({page}) => {
      // Arrange
      const [baselineSave, otherPlayerSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath, otherPlayerSaveFixturePath]);

      // Act
      const isTaken = await isTakenByThePage(page, page.getByTestId('save-a'), 'dragenter', [baselineSave, otherPlayerSave]);

      // Assert
      expect<boolean>(isTaken).toBe(true);
    });
  });

  test.describe('When save files move over a save area', () => {
    test('should announce a copy to the browser', async ({page, browserName}) => {
      test.skip(browserName !== 'firefox', scriptBuiltTransferKeepsNoEffect);
      // Act
      const effect = await openThePageAndReadTheEffectAnnouncedOver(page, (openedPage) => openedPage.getByTestId('save-file'));

      // Assert
      expect<string>(effect).toBe('copy');
    });
  });

  test.describe('When save files move over the page outside every area', () => {
    test('should announce to the browser that nothing can be dropped there', async ({page, browserName}) => {
      test.skip(browserName !== 'firefox', scriptBuiltTransferKeepsNoEffect);
      // Act
      const effect = await openThePageAndReadTheEffectAnnouncedOver(page, (openedPage) => openedPage.getByTestId('visualization-title'));

      // Assert
      expect<string>(effect).toBe('none');
    });

    test('should keep the browser from opening them', async ({page}) => {
      // Arrange
      const [baselineSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath]);

      // Act
      const isTaken = await isTakenByThePage(page, page.getByTestId('visualization-title'), 'dragover', [baselineSave]);

      // Assert
      expect<boolean>(isTaken).toBe(true);
    });
  });

  test.describe('When two save files are dropped on the save A area', () => {
    test('should hand them to the merge section, which selects them as save A and save B', async ({page}) => {
      // Arrange
      const [otherPlayerSave, baselineSave] = await readTheFixturesAndOpenThePage(page, [otherPlayerSaveFixturePath, baselineSaveFixturePath]);

      // Act
      await dropTheFiles(page, page.getByTestId('save-a-area'), [otherPlayerSave, baselineSave]);

      // Assert
      await expectTheSavesChosenForTheMerge(page, {saveA: /baseline_valid\.json$/, saveB: /other-player_valid\.json$/});
    });
  });

  test.describe('When a file that is not JSON is dropped on a save area', () => {
    test('should select nothing and say why next to the area', async ({page}) => {
      // Arrange
      const textFile = {name: 'notes.txt', content: 'not a save'};
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('save-a-area'), [textFile]);

      // Assert
      await expect(page.getByTestId('save-a-area')).toContainText('notes.txt is not a JSON save file.');
      await expect(page.getByTestId('save-a')).toHaveValue('');
    });
  });

  test.describe('When two save files are dropped on a single-file area', () => {
    test('should select nothing and say why next to the area', async ({page}) => {
      // Arrange
      const [baselineSave, otherPlayerSave] = await readTheFixturesAndOpenThePage(page, [baselineSaveFixturePath, otherPlayerSaveFixturePath]);

      // Act
      await dropTheFiles(page, page.getByTestId('display-area'), [baselineSave, otherPlayerSave]);

      // Assert
      await expect(page.getByTestId('display-area')).toContainText('Drop a single save file here.');
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });

  test.describe('When three save files are dropped on the merge section', () => {
    test('should select nothing and say why next to the section', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      const otherPlayerSave = await readTheFixture(otherPlayerSaveFixturePath);
      const thirdSave = {name: 'third_valid.json', content: baselineSave.content};
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('merge-area'), [baselineSave, otherPlayerSave, thirdSave]);

      // Assert
      await expect(page.getByTestId('merge-area')).toContainText('Drop two save files at most here.');
      await expect(page.getByTestId('save-a')).toHaveValue('');
    });
  });
});
