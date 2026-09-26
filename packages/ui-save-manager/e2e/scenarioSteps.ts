import {join} from 'node:path';
import {type Locator, type Page} from '@playwright/test';

const revealMessagesLabel = 'Show details';

export function locateTheFixture(fileName: string): string {
  return join(import.meta.dirname, 'fixtures', fileName);
}

export async function chooseTheSaveToVisualize(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Save file:').setInputFiles(saveFixturePath);
}

export async function visualizeTheSave(page: Page, saveFixturePath: string): Promise<void> {
  await chooseTheSaveToVisualize(page, saveFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
}

export async function chooseTheTwoSavesToMerge(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
  await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);
}

export async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string): Promise<void> {
  await page.getByLabel('Save file:').setInputFiles(saveFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
  await page.getByText(revealMessagesLabel).click();
}

export async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await chooseTheTwoSavesToMerge(page, saveAFixturePath, saveBFixturePath);
  await page.getByRole('button', {name: 'Merge'}).click();
  await page.getByText(revealMessagesLabel).first().click();
}

export function findTheMenu(page: Page): Locator {
  return page.getByRole('navigation', {name: 'Menu'});
}

export async function openThePageOfTheMenu(page: Page, pageName: string): Promise<void> {
  await findTheMenu(page).getByRole('link', {name: pageName, exact: true}).click();
}

export function findTheBreadcrumbSteps(page: Page): Locator {
  return page.getByRole('navigation', {name: 'Breadcrumb'}).getByRole('listitem');
}
