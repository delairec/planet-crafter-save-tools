import {Page} from "@playwright/test";
export async function triggerSaveFileMerge(page: Page, fileA:string, fileB:string) {
  await page.getByTestId('save-a').setInputFiles(fileA);
  await page.getByTestId('save-b').setInputFiles(fileB);
  await page.getByTestId('merge').click();
}
