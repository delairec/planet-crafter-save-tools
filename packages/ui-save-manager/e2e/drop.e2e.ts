import {readFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {expect, test, type Locator, type Page} from '@playwright/test';

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const otherPlayerSaveFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;

interface DroppedFile {
  name: string;
  content: string;
}

async function readTheFixture(fixturePath: string): Promise<DroppedFile> {
  return {name: basename(fixturePath), content: await readFile(fixturePath, 'utf8')};
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

async function effectAnnouncedByThePage(page: Page, element: Locator, droppedFiles: DroppedFile[]): Promise<string> {
  return (await dispatchTheDrag(page, element, 'dragover', droppedFiles)).announcedEffect;
}

const scriptBuiltTransferKeepsNoEffect = 'Chromium and WebKit ignore a drop effect set on a script-built DataTransfer';

test.describe('Save file drop', () => {
  test.describe('When a save file is dropped on the display area', () => {
    test('should display that file as if it had been picked', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');
      await dropTheFiles(page, page.getByTestId('display-area'), [baselineSave]);

      // Act
      await page.getByTestId('visualize-button').click();

      // Assert
      await expect(page.getByTestId('save-file-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
    });
  });

  test.describe('When a save file is dropped on the save B area', () => {
    test('should select it as save B only', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('save-b-area'), [baselineSave]);

      // Assert
      await expect(page.getByTestId('save-b-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('save-a-input')).toHaveValue('');
    });
  });

  test.describe('When two save files are dropped together on the merge section', () => {
    test('should select them as save A and save B in the alphabetical order of their names', async ({page}) => {
      // Arrange
      const otherPlayerSave = await readTheFixture(otherPlayerSaveFixturePath);
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('merge-area'), [otherPlayerSave, baselineSave]);

      // Assert
      await expect(page.getByTestId('save-a-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('save-b-input')).toHaveValue(/other-player_valid\.json$/);
      await expect(page.getByTestId('merge-button')).toBeEnabled();
    });
  });

  test.describe('When the two selected saves are swapped', () => {
    test('should select save A as save B and save B as save A', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-a-input').setInputFiles(baselineSaveFixturePath);
      await page.getByTestId('save-b-input').setInputFiles(otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('swap-button').click();

      // Assert
      await expect(page.getByTestId('save-a-input')).toHaveValue(/other-player_valid\.json$/);
      await expect(page.getByTestId('save-b-input')).toHaveValue(/baseline_valid\.json$/);
    });
  });

  test.describe('When the pointer rests on the swap button', () => {
    test('should show its label as a tooltip', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-a-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('swap-button').hover();

      // Assert
      await expect(page.getByTestId('swap-button-tooltip')).toHaveText('Swap save A and save B');
    });
  });

  test.describe('When save files enter a save area', () => {
    test('should take them, so that the browser lets them be dropped without a further move', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      const otherPlayerSave = await readTheFixture(otherPlayerSaveFixturePath);
      await page.goto('/');

      // Act
      const isTaken = await isTakenByThePage(page, page.getByTestId('save-a-input'), 'dragenter', [baselineSave, otherPlayerSave]);

      // Assert
      expect<boolean>(isTaken).toBe(true);
    });
  });

  test.describe('When save files move over a save area', () => {
    test('should announce a copy to the browser', async ({page, browserName}) => {
      test.skip(browserName !== 'firefox', scriptBuiltTransferKeepsNoEffect);
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      const effect = await effectAnnouncedByThePage(page, page.getByTestId('save-file-input'), [baselineSave]);

      // Assert
      expect<string>(effect).toBe('copy');
    });
  });

  test.describe('When save files move over the page outside every area', () => {
    test('should announce to the browser that nothing can be dropped there', async ({page, browserName}) => {
      test.skip(browserName !== 'firefox', scriptBuiltTransferKeepsNoEffect);
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      const effect = await effectAnnouncedByThePage(page, page.getByTestId('visualization-title'), [baselineSave]);

      // Assert
      expect<string>(effect).toBe('none');
    });

    test('should keep the browser from opening them', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      const isTaken = await isTakenByThePage(page, page.getByTestId('visualization-title'), 'dragover', [baselineSave]);

      // Assert
      expect<boolean>(isTaken).toBe(true);
    });
  });

  test.describe('When two save files are dropped on the save A area', () => {
    test('should hand them to the merge section, which selects them as save A and save B', async ({page}) => {
      // Arrange
      const otherPlayerSave = await readTheFixture(otherPlayerSaveFixturePath);
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('save-a-area'), [otherPlayerSave, baselineSave]);

      // Assert
      await expect(page.getByTestId('save-a-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('save-b-input')).toHaveValue(/other-player_valid\.json$/);
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
      await expect(page.getByTestId('save-a-input')).toHaveValue('');
    });
  });

  test.describe('When two save files are dropped on a single-file area', () => {
    test('should select nothing and say why next to the area', async ({page}) => {
      // Arrange
      const baselineSave = await readTheFixture(baselineSaveFixturePath);
      const otherPlayerSave = await readTheFixture(otherPlayerSaveFixturePath);
      await page.goto('/');

      // Act
      await dropTheFiles(page, page.getByTestId('display-area'), [baselineSave, otherPlayerSave]);

      // Assert
      await expect(page.getByTestId('display-area')).toContainText('Drop a single save file here.');
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
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
      await expect(page.getByTestId('save-a-input')).toHaveValue('');
    });
  });
});
