import {beforeEach, describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {
  type AnchorFields,
  checkCorpusAnchors,
  type CorpusAnchor,
  findCorpusAnchors,
  readAnchorFields
} from './check-corpus-anchors.ts';

const TASK_SCHEMA = [
  'SCHEMA TASK',
  '\tNAME task_id',
  '\tFIELD TITLE string',
  '\t\tREQUIRED',
  '\tFIELD SPEC string',
  '\t\tREPEATABLE',
  '\t\tFIELD IMPL anchor',
  '\t\t\tREPEATABLE',
  '\tFIELD MANIFEST anchor'
].join('\n');

describe('readAnchorFields', () => {

  describe('When a type declares an anchor field at its top and another under a field', () => {
    it('should give the path of both, and of no field of another type', () => {
      // Act
      const anchorFields = readAnchorFields(TASK_SCHEMA);

      // Assert
      expect(anchorFields).toEqual(new Map([['TASK', new Set(['MANIFEST', 'SPEC > IMPL'])]]));
    });
  });

  describe('When the anchor field is declared in a fieldset the type includes', () => {
    it('should give it to the including type, under the field the inclusion sits in', () => {
      // Arrange
      const schema = [
        'FIELDSET Era',
        '\tFIELD ATTESTED_BY anchor',
        '',
        'SCHEMA SECTION',
        '\tINCLUDE @FIELDSET.Era',
        '\tFIELD SPEC string',
        '\t\tINCLUDE @FIELDSET.Era'
      ].join('\n');

      // Act
      const anchorFields = readAnchorFields(schema);

      // Assert
      expect(anchorFields).toEqual(new Map([['SECTION', new Set(['ATTESTED_BY', 'SPEC > ATTESTED_BY'])]]));
    });
  });

  describe('When a type includes a fieldset the corpus does not declare', () => {
    it('should give the anchor fields the type declares itself, the inclusion adding none', () => {
      // Arrange
      const schema = [
        'SCHEMA SECTION',
        '\tINCLUDE @FIELDSET.Era',
        '\tFIELD WITNESS anchor'
      ].join('\n');

      // Act
      const anchorFields = readAnchorFields(schema);

      // Assert
      expect(anchorFields).toEqual(new Map([['SECTION', new Set(['WITNESS'])]]));
    });
  });

  describe('When the anchor field is declared inside a WHEN block', () => {
    it('should give it as if the block were not there', () => {
      // Arrange
      const schema = [
        'SCHEMA SECTION',
        '\tFIELD HOLDS_FOR current|legacy',
        '\tWHEN HOLDS_FOR current',
        '\t\tFIELD WITNESS anchor',
        '\t\t\tREQUIRED'
      ].join('\n');

      // Act
      const anchorFields = readAnchorFields(schema);

      // Assert
      expect(anchorFields).toEqual(new Map([['SECTION', new Set(['WITNESS'])]]));
    });
  });

  describe('When the anchor field is declared on every entity', () => {
    it('should give it under the wildcard type', () => {
      // Arrange
      const schema = [
        'SCHEMA *',
        '\tFIELD DESC string',
        '\tFIELD SEEN_IN anchor'
      ].join('\n');

      // Act
      const anchorFields = readAnchorFields(schema);

      // Assert
      expect(anchorFields).toEqual(new Map([['*', new Set(['SEEN_IN'])]]));
    });
  });
});

describe('findCorpusAnchors', () => {
  let anchorFields: AnchorFields;

  beforeEach(() => {
    anchorFields = readAnchorFields(TASK_SCHEMA);
  });

  describe('When an entity writes anchors at its top and under a field', () => {
    it('should give each one with its entity, its field, its path and its line', () => {
      // Arrange
      const source = [
        'TASK FIX45',
        '\tTITLE "a title naming src/not-an-anchor.ts"',
        '\tSPEC "a criterion"',
        '\t\tIMPL "src/merge.spec.ts"',
        '\tMANIFEST "package.json"'
      ].join('\n');

      // Act
      const anchors = findCorpusAnchors(source, anchorFields);

      // Assert
      expect<CorpusAnchor[]>(anchors).toEqual([
        {entity: '@TASK.FIX45', field: 'SPEC > IMPL', path: 'src/merge.spec.ts', line: 4},
        {entity: '@TASK.FIX45', field: 'MANIFEST', path: 'package.json', line: 5}
      ]);
    });
  });

  describe('When an anchor carries a fragment continued on the next line', () => {
    it('should give the path alone, on the line the field starts', () => {
      // Arrange
      const source = [
        'TASK FIX45',
        '\tSPEC "a criterion"',
        '\t\tIMPL "AGENTS.md::a sentence long enough to be"',
        '\t\t\t+ "wrapped"'
      ].join('\n');

      // Act
      const anchors = findCorpusAnchors(source, anchorFields);

      // Assert
      expect<CorpusAnchor[]>(anchors).toEqual([
        {entity: '@TASK.FIX45', field: 'SPEC > IMPL', path: 'AGENTS.md', line: 3}
      ]);
    });
  });

  describe('When an entity writes a field declared as an anchor on every entity', () => {
    it('should give that anchor too', () => {
      // Arrange
      const schemaWithWildcard = [TASK_SCHEMA, '', 'SCHEMA *', '\tFIELD SEEN_IN anchor'].join('\n');
      const source = ['TASK FIX45', '\tSEEN_IN "docs/save-format.md::Players"'].join('\n');

      // Act
      const anchors = findCorpusAnchors(source, readAnchorFields(schemaWithWildcard));

      // Assert
      expect<CorpusAnchor[]>(anchors).toEqual([
        {entity: '@TASK.FIX45', field: 'SEEN_IN', path: 'docs/save-format.md', line: 2}
      ]);
    });
  });

  describe('When an entity is archived after the anchors it writes', () => {
    it('should give only the anchors of the entity that still binds', () => {
      // Arrange
      const source = [
        'TASK FIX45',
        '\tSPEC "a criterion"',
        '\t\tIMPL "src/deleted-module.ts"',
        '\tSTATUS archived',
        '\tARCHIVED_ON "2026-09-24"',
        'TASK FIX46',
        '\tMANIFEST "package.json"'
      ].join('\n');

      // Act
      const anchors = findCorpusAnchors(source, anchorFields);

      // Assert
      expect<CorpusAnchor[]>(anchors).toEqual([
        {entity: '@TASK.FIX46', field: 'MANIFEST', path: 'package.json', line: 7}
      ]);
    });
  });

  describe('When an entity has a type the schema gives no anchor field', () => {
    it('should give nothing, a same-named field of that type not being an anchor', () => {
      // Arrange
      const source = ['DECISION SomeRuling', '\tMANIFEST "package.json"'].join('\n');

      // Act
      const anchors = findCorpusAnchors(source, anchorFields);

      // Assert
      expect<CorpusAnchor[]>(anchors).toEqual([]);
    });
  });
});

describe('checkCorpusAnchors', () => {

  describe('When every anchor names a file or a directory git tracks', () => {
    it('should print that every anchor names a tracked path and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'docs/_schema.awawa': TASK_SCHEMA,
          'docs/tasks.awawa': 'TASK FIX45\n\tSPEC "a criterion"\n\t\tIMPL "src/merge.spec.ts::describe"\n\t\tIMPL "src"'
        },
        trackedFiles: ['docs/_schema.awawa', 'docs/tasks.awawa', 'src/merge.spec.ts']
      });

      // Act
      await checkCorpusAnchors(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:anchors: every anchor of the corpus names a path git tracks.'],
        exitCodes: [0]
      });
    });
  });

  describe('When an anchor names a file that exists on disk but that git does not track', () => {
    it('should print its file, its line, its entity, its field and its path, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'docs/_schema.awawa': TASK_SCHEMA,
          'docs/tasks.awawa': 'TASK FIX45\n\tSPEC "a criterion"\n\t\tIMPL "input/Test/save.json"',
          'input/Test/save.json': '{}'
        },
        trackedFiles: ['docs/_schema.awawa', 'docs/tasks.awawa']
      });

      // Act
      await checkCorpusAnchors(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'docs/tasks.awawa:3\n  @TASK.FIX45 SPEC > IMPL names input/Test/save.json, a path git does not track',
          'check:anchors: 1 anchor(s) naming a path git does not track.'
        ],
        exitCodes: [1]
      });
    });
  });

  describe('When an anchor names a path that does not exist at all', () => {
    it('should print it the same way', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'docs/_schema.awawa': TASK_SCHEMA,
          'docs/tasks.awawa': 'TASK FIX45\n\tMANIFEST "missing/package.json"'
        },
        trackedFiles: ['docs/_schema.awawa', 'docs/tasks.awawa']
      });

      // Act
      await checkCorpusAnchors(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'docs/tasks.awawa:2\n  @TASK.FIX45 MANIFEST names missing/package.json, a path git does not track',
          'check:anchors: 1 anchor(s) naming a path git does not track.'
        ],
        exitCodes: [1]
      });
    });
  });
});
