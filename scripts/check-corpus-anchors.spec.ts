import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {
  type AnchorFields,
  type CorpusAnchor,
  findCorpusAnchors,
  findUntrackedCorpusAnchors,
  readAnchorFields,
  type UntrackedAnchor
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

describe('findUntrackedCorpusAnchors', () => {
  let workspaceRoot: string;

  const writeWorkspaceFile = async (path: string, content: string) => {
    await mkdir(dirname(join(workspaceRoot, path)), {recursive: true});
    await writeFile(join(workspaceRoot, path), content);
  };

  const trackInGit = (...paths: string[]) => {
    Bun.spawnSync(['git', 'add', '--', ...paths], {cwd: workspaceRoot});
  };

  beforeEach(async () => {
    workspaceRoot = await mkdtemp(join(tmpdir(), 'check-corpus-anchors-'));
    Bun.spawnSync(['git', 'init', '--quiet'], {cwd: workspaceRoot});
    await writeWorkspaceFile('docs/_schema.awawa', TASK_SCHEMA);
    await writeWorkspaceFile('src/merge.spec.ts', 'export {};');
    await writeWorkspaceFile('input/Test/save.json', '{}');
  });

  afterEach(async () => {
    await rm(workspaceRoot, {recursive: true, force: true});
  });

  describe('When every anchor names a file or a directory git tracks', () => {
    it('should report nothing', async () => {
      // Arrange
      await writeWorkspaceFile('docs/tasks.awawa', [
        'TASK FIX45',
        '\tSPEC "a criterion"',
        '\t\tIMPL "src/merge.spec.ts::describe"',
        '\t\tIMPL "src"'
      ].join('\n'));
      trackInGit('docs', 'src');

      // Act
      const untrackedAnchors = await findUntrackedCorpusAnchors(workspaceRoot);

      // Assert
      expect<UntrackedAnchor[]>(untrackedAnchors).toEqual([]);
    });
  });

  describe('When an anchor names a file that exists on disk but that git does not track', () => {
    it('should report it with its file, its entity, its field and its path', async () => {
      // Arrange
      await writeWorkspaceFile('docs/tasks.awawa', [
        'TASK FIX45',
        '\tSPEC "a criterion"',
        '\t\tIMPL "input/Test/save.json"'
      ].join('\n'));
      trackInGit('docs', 'src');

      // Act
      const untrackedAnchors = await findUntrackedCorpusAnchors(workspaceRoot);

      // Assert
      expect<UntrackedAnchor[]>(untrackedAnchors).toEqual([
        {file: 'docs/tasks.awawa', entity: '@TASK.FIX45', field: 'SPEC > IMPL', path: 'input/Test/save.json', line: 3}
      ]);
    });
  });

  describe('When an anchor names a path that does not exist at all', () => {
    it('should report it the same way', async () => {
      // Arrange
      await writeWorkspaceFile('docs/tasks.awawa', ['TASK FIX45', '\tMANIFEST "missing/package.json"'].join('\n'));
      trackInGit('docs', 'src');

      // Act
      const untrackedAnchors = await findUntrackedCorpusAnchors(workspaceRoot);

      // Assert
      expect<UntrackedAnchor[]>(untrackedAnchors).toEqual([
        {file: 'docs/tasks.awawa', entity: '@TASK.FIX45', field: 'MANIFEST', path: 'missing/package.json', line: 2}
      ]);
    });
  });
});
