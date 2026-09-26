import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkActionPins, findUnpinnedActions} from './check-action-pins.ts';

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

describe('checkActionPins', () => {

  describe('When every workflow pins its actions on a commit SHA with its version', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          '.github/workflows/quality.yml': '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1'
        }
      });

      // Act
      await checkActionPins(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:action-pins: every action the workflows use is pinned on a commit SHA with its version.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a workflow names an action by its tag', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          '.github/workflows/quality.yml': '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
          '.github/workflows/release.yaml': '      - uses: actions/checkout@v7'
        }
      });

      // Act
      await checkActionPins(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          '.github/workflows/release.yaml:1 uses actions/checkout@v7, which names no commit SHA',
          'check:action-pins: 1 action reference(s) not pinned on a commit SHA with its version.'
        ],
        exitCodes: [1]
      });
    });
  });
});
