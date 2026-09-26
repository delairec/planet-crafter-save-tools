import {type Locator, type Page} from '@playwright/test';

export async function visualizeTheSave(page: Page, saveFixturePath: string): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Save file:').setInputFiles(saveFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
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
