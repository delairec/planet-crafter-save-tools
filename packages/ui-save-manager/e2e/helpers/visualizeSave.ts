import {Page} from "@playwright/test";

export async function visualizeSave(page: Page, saveFixturePath: string): Promise<void> {
  await page.getByTestId('save-file-input').setInputFiles(saveFixturePath);
  await page.getByTestId('visualize-button').click();
}
