import {describe, expect, it} from 'bun:test';
import {findUnpinnedActions} from './check-action-pins.ts';

const WORKFLOW_PATH = '.github/workflows/quality.yml';

describe('findUnpinnedActions', () => {

  describe('When every action is pinned on a commit SHA followed by its version', () => {
    it('should find none', () => {
      // Arrange
      const source = [
        'jobs:',
        '  lint:',
        '    steps:',
        '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
        '      - name: Set up Bun',
        '        uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2.2.0'
      ].join('\n');

      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a pinned reference is quoted', () => {
    it('should find none', () => {
      // Arrange
      const source = '      - uses: "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1" # v7.0.1';

      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the action is local to the repository', () => {
    it('should find none', () => {
      // Arrange
      const source = '      - uses: ./.github/actions/set-up-workspace';

      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a uses: line is commented out', () => {
    it('should find none', () => {
      // Arrange
      const source = '      # - uses: actions/checkout@v7';

      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a uses: names something other than a full commit SHA', () => {
    it.each([
      ['a moving major tag', '      - uses: actions/checkout@v7', 'actions/checkout@v7'],
      ['an exact version tag', '      - uses: actions/checkout@v7.0.1', 'actions/checkout@v7.0.1'],
      ['a branch', '        uses: anthropics/claude-code-action@main # v1.0.233', 'anthropics/claude-code-action@main'],
      ['an abbreviated SHA', '      - uses: actions/checkout@3d3c42e # v7.0.1', 'actions/checkout@3d3c42e'],
      ['a container image tag', '      - uses: docker://alpine:3.20', 'docker://alpine:3.20']
    ])('should report %s', (_kind, source, reference) => {
      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([`${WORKFLOW_PATH}:1 uses ${reference}, which names no commit SHA`]);
    });
  });

  describe('When a commit SHA carries no version comment', () => {
    it('should report the missing version', () => {
      // Arrange
      const source = '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1';

      // Act
      const violations = findUnpinnedActions([{filePath: WORKFLOW_PATH, source}]);

      // Assert
      expect(violations).toEqual([
        `${WORKFLOW_PATH}:1 uses actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 with no comment giving the version it resolves to`
      ]);
    });
  });

  describe('When several workflows hold unpinned actions', () => {
    it('should report each one at its file and line', () => {
      // Arrange
      const qualityWorkflow = {
        filePath: WORKFLOW_PATH,
        source: [
          'jobs:',
          '  fallow:',
          '    steps:',
          '      - uses: fallow-rs/fallow@v3'
        ].join('\n')
      };
      const reviewWorkflow = {
        filePath: '.github/workflows/claude-code-review.yml',
        source: [
          'jobs:',
          '  review:',
          '    steps:',
          '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
          '      - name: Run the review',
          '        uses: anthropics/claude-code-action@v1'
        ].join('\n')
      };

      // Act
      const violations = findUnpinnedActions([qualityWorkflow, reviewWorkflow]);

      // Assert
      expect(violations).toEqual([
        '.github/workflows/quality.yml:4 uses fallow-rs/fallow@v3, which names no commit SHA',
        '.github/workflows/claude-code-review.yml:6 uses anthropics/claude-code-action@v1, which names no commit SHA'
      ]);
    });
  });
});
