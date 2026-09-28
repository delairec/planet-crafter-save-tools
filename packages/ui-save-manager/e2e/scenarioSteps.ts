import {join} from 'node:path';
import {type Locator, type Page} from '@playwright/test';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {visualizeSave} from './helpers/visualizeSave';

export function locateTheFixture(fileName: string): string {
  return join(import.meta.dirname, 'fixtures', fileName);
}

export async function chooseTheSaveToVisualize(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/');
  await page.getByTestId('save-file-input').setInputFiles(saveFixturePath);
}

export async function visualizeTheSave(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/');
  await visualizeSave(page, saveFixturePath);
}

export async function chooseTheTwoSavesToMerge(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await page.getByTestId('save-a-input').setInputFiles(saveAFixturePath);
  await page.getByTestId('save-b-input').setInputFiles(saveBFixturePath);
}

export async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string, messagesTestId: string): Promise<void> {
  await visualizeSave(page, saveFixturePath);
  await page.getByTestId(`${messagesTestId}-details-toggle`).click();
}

export async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string, messagesTestId: string): Promise<void> {
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await page.getByTestId(`${messagesTestId}-details-toggle`).click();
}

export function findTheMenu(page: Page): Locator {
  return page.getByTestId('menu');
}

export function findTheMenuGroupTitles(page: Page): Locator {
  return findTheMenu(page).getByTestId(/^[a-z]+-menu-group-title$/);
}

export async function openThePageOfTheMenu(page: Page, pageName: string): Promise<void> {
  await findTheMenu(page).getByTestId(/-menu-link$/).filter({hasText: new RegExp(`^${pageName}$`)}).click();
}

export function findTheBreadcrumbSteps(page: Page): Locator {
  return page.getByTestId(/^breadcrumb-(?:group|page)$/);
}
