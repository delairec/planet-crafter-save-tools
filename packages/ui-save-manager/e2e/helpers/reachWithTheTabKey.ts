import {type Locator, type Page} from '@playwright/test';

const maximumTabPresses = 60;

export async function reachWithTheTabKey(page: Page, target: Locator): Promise<void> {
  for (let tabPresses = 0; tabPresses < maximumTabPresses; tabPresses++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }
  throw new Error(`the Tab key did not reach the element within ${maximumTabPresses} presses`);
}
