import {join} from 'node:path';
import {type Locator, type Page} from '@playwright/test';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {visualizeSave} from './helpers/visualizeSave';

export function locateTheFixture(fileName: string): string {
  return join(import.meta.dirname, 'fixtures', fileName);
}

export async function chooseTheSaveToVisualize(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/load-save');
  await page.getByTestId('save-file').setInputFiles(saveFixturePath);
}

export async function visualizeTheSave(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/load-save');
  await visualizeSave(page, saveFixturePath);
}

export async function chooseTheTwoSavesToMerge(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await page.getByTestId('save-a').setInputFiles(saveAFixturePath);
  await page.getByTestId('save-b').setInputFiles(saveBFixturePath);
}

export async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string, messagesTestId: string): Promise<void> {
  await visualizeSave(page, saveFixturePath);
  await page.getByTestId(`${messagesTestId}-details`).click();
}

export async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string, messagesTestId: string): Promise<void> {
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await page.getByTestId(`${messagesTestId}-details`).click();
}

export function findTheMenu(page: Page): Locator {
  return page.getByTestId('page-navigation');
}

export function findTheMenuGroupTitles(page: Page): Locator {
  return findTheMenu(page).getByTestId(/^[a-z]+-pages-title$/);
}

export async function openThePageOfTheMenu(page: Page, pageName: string): Promise<void> {
  await findTheMenu(page).getByTestId(/-page-link$/).filter({hasText: new RegExp(`^${pageName}$`)}).click();
}

export function findTheBreadcrumbSteps(page: Page): Locator {
  return page.getByTestId(/^current-page-(?:group|name)$/);
}
