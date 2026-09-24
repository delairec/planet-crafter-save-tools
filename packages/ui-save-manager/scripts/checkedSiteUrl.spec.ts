import {describe, expect, it} from 'bun:test';
import {resolveCheckedSiteUrl} from './checkedSiteUrl.ts';

describe('resolveCheckedSiteUrl', () => {

  describe('When the requested URL is the production site', () => {
    it('should check the production site', () => {
      // Arrange
      const requestedUrl = 'https://planet-crafter-save-manager.netlify.app/';

      // Act
      const checkedSiteUrl = resolveCheckedSiteUrl(requestedUrl);

      // Assert
      expect(checkedSiteUrl).toBe('https://planet-crafter-save-manager.netlify.app/');
    });
  });

  describe('When the requested URL is the production site without its trailing slash', () => {
    it('should check the production site', () => {
      // Arrange
      const requestedUrl = 'https://planet-crafter-save-manager.netlify.app';

      // Act
      const checkedSiteUrl = resolveCheckedSiteUrl(requestedUrl);

      // Assert
      expect(checkedSiteUrl).toBe('https://planet-crafter-save-manager.netlify.app/');
    });
  });

  describe('When the requested URL is a deploy preview of the production site', () => {
    it('should check that deploy preview', () => {
      // Arrange
      const requestedUrl = 'https://deploy-preview-134--planet-crafter-save-manager.netlify.app/';

      // Act
      const checkedSiteUrl = resolveCheckedSiteUrl(requestedUrl);

      // Assert
      expect(checkedSiteUrl).toBe('https://deploy-preview-134--planet-crafter-save-manager.netlify.app/');
    });
  });

  describe('When the requested URL is refused', () => {
    it.each([
      ['it is not a URL', 'planet-crafter-save-manager.netlify.app'],
      ['its scheme is http', 'http://planet-crafter-save-manager.netlify.app/'],
      ['its host is another site', 'https://example.com/'],
      ['its host only starts with the production host', 'https://planet-crafter-save-manager.netlify.app.evil.com/'],
      ['its host only ends with the production host', 'https://evil-planet-crafter-save-manager.netlify.app/'],
      ['its host is a subdomain of the production host', 'https://evil.planet-crafter-save-manager.netlify.app/'],
      ['its deploy preview carries no number', 'https://deploy-preview---planet-crafter-save-manager.netlify.app/'],
      ['its deploy preview belongs to another site', 'https://deploy-preview-134--another-site.netlify.app/'],
      ['it names the production host as userinfo', 'https://planet-crafter-save-manager.netlify.app@evil.com/'],
      ['it carries userinfo before the production host', 'https://user:password@planet-crafter-save-manager.netlify.app/'],
      ['it names another port', 'https://planet-crafter-save-manager.netlify.app:8443/'],
      ['it names a path', 'https://planet-crafter-save-manager.netlify.app/admin'],
      ['it carries a query', 'https://planet-crafter-save-manager.netlify.app/?page=1'],
      ['it carries a fragment', 'https://planet-crafter-save-manager.netlify.app/#top']
    ])('should refuse it, since %s', (_reason, requestedUrl) => {
      // Act
      const checkedSiteUrl = resolveCheckedSiteUrl(requestedUrl);

      // Assert
      expect(checkedSiteUrl).toBeUndefined();
    });
  });
});
