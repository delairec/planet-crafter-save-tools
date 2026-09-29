import {type Page} from '@playwright/test';
import {expect, test} from '../scenarioTest';
import {createAColorRulesAudit} from './createAColorRulesAudit';
import {noViolation} from './createAWcag2Audit';

export function describeTheColorRulesAuditInTheDarkColorScheme(reachTheAuditedState: (page: Page) => Promise<void>): void {
  test.describe('When the dark color scheme is preferred', () => {
    test.use({colorScheme: 'dark'});

    test('should conform to the color rules of WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await reachTheAuditedState(page);

      // Act
      const {violations} = await createAColorRulesAudit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });
  });
}
