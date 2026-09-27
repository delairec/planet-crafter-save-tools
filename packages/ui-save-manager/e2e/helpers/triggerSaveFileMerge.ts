import {Page} from "@playwright/test";
export async function triggerSaveFileMerge(page: Page, fileA:string, fileB:string) {
  await page.getByTestId('save-a-input').setInputFiles(fileA);
  await page.getByTestId('save-b-input').setInputFiles(fileB);
  await page.getByTestId('merge-button').click();
}