import AxeBuilder from '@axe-core/playwright';
import {type Page} from '@playwright/test';

const wcag2LevelAAndAaTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

export const noViolation: readonly unknown[] = [];

export function createAWcag2Audit(page: Page): AxeBuilder {
  return new AxeBuilder({page}).withTags(wcag2LevelAAndAaTags);
}
