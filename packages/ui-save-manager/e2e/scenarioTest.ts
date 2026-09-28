import {expect, test as playwrightTest} from '@playwright/test';

export const test = playwrightTest.extend<{testIdsStayUnique: void}>({
  testIdsStayUnique: [async ({page}, use) => {
    await use();

    const repeatedTestIds = await page.evaluate(() => {
      const testIds = Array.from(document.querySelectorAll('[data-testid]'), (element) => element.getAttribute('data-testid'));
      return [...new Set(testIds.filter((testId, index) => testIds.indexOf(testId) !== index))];
    });
    expect(repeatedTestIds, 'every data-testid of the page is unique').toEqual([]);
  }, {auto: true}]
});

export {expect};
