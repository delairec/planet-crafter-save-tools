import AxeBuilder from '@axe-core/playwright';
import {type Page} from '@playwright/test';

const colorRules = ['color-contrast', 'link-in-text-block'];

export function createAColorRulesAudit(page: Page): AxeBuilder {
  return new AxeBuilder({page}).withRules(colorRules);
}
