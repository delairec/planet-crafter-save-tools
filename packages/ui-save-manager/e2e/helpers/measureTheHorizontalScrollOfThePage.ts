import {type Page} from '@playwright/test';

export async function measureTheHorizontalScrollOfThePage(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
