import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkSolidIdioms, findIdiomViolations, isSolidComponentFile} from './check-solid-idioms.ts';

const DESTRUCTURED_PROPS_REASON = 'a component reads its props through the props object, never destructured in its signature';
const ASSERTED_ACCESSOR_REASON = 'an accessor is bound by the callback form of Show, never asserted non-null';

describe('isSolidComponentFile', () => {

  describe('When the file is a component of a package', () => {
    it('should recognise it wherever that component sits', () => {
      // Act
      const isNestedComponent = isSolidComponentFile('packages/ui-save-manager/src/components/structure/FieldsGroup.tsx');
      const isServerEntry = isSolidComponentFile('packages/ui-save-manager/src/entry-server.tsx');

      // Assert
      expect(isNestedComponent).toBe(true);
      expect(isServerEntry).toBe(true);
    });
  });

  describe('When the file carries no JSX', () => {
    it('should leave it alone', () => {
      // Act
      const isTypeScriptModule = isSolidComponentFile('packages/ui-save-manager/src/lib/useLoadSaveFile.ts');
      const isJavaScriptModule = isSolidComponentFile('packages/ui-save-manager/src/messages/appMessages.js');

      // Assert
      expect(isTypeScriptModule).toBe(false);
      expect(isJavaScriptModule).toBe(false);
    });
  });

  describe('When the file is generated', () => {
    it('should leave it alone even with the component extension', () => {
      // Act
      const isInstalledDependency = isSolidComponentFile('packages/ui-save-manager/node_modules/solid/Thing.tsx');
      const isBuildOutput = isSolidComponentFile('packages/ui-save-manager/.output/server/Thing.tsx');

      // Assert
      expect(isInstalledDependency).toBe(false);
      expect(isBuildOutput).toBe(false);
    });
  });
});

describe('findIdiomViolations', () => {

  describe('When a component destructures its props in its signature', () => {
    it('should report a function declaration', () => {
      // Arrange
      const source = 'export default function FieldsGroup({columns}: FieldsGroupProps) {';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: DESTRUCTURED_PROPS_REASON}]);
    });

    it('should report a generic function declaration', () => {
      // Arrange
      const source = 'export default function FieldsGroupGrid<T>({title, items}: FieldsGroupGridProps<T>) {';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: DESTRUCTURED_PROPS_REASON}]);
    });

    it('should report an arrow held by a capitalised name', () => {
      // Arrange
      const source = 'const Spinner = ({label}: SpinnerProps) => <span>{label}</span>;';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: DESTRUCTURED_PROPS_REASON}]);
    });
  });

  describe('When a component reads its props through the props object', () => {
    it('should report nothing', () => {
      // Arrange
      const source = [
        'export default function FieldsGroup(props: FieldsGroupProps) {',
        '  return <For each={props.columns()}>{(column) => <div>{column.header}</div>}</For>;',
        '}'
      ].join('\n');

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a callback destructures the item it receives', () => {
    it('should report nothing, the item being a value and not a props object', () => {
      // Arrange
      const source = '      {({header, values}) => <div class="field">{header}</div>}';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When an anonymous arrow destructures the props of a component slot', () => {
    it('should report nothing, the accepted limit of a line reading being that it cannot tell that arrow from a callback', () => {
      // Arrange
      const source = '    document={({assets, children, scripts}) => (';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When an accessor is asserted non-null', () => {
    it('should report the line', () => {
      // Arrange
      const source = [
        '<Show when={props.result()}>',
        '  <p>{props.result()!.fileName}</p>',
        '</Show>'
      ].join('\n');

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([{line: 2, reason: ASSERTED_ACCESSOR_REASON}]);
    });
  });

  describe('When a non-null assertion applies to something other than an accessor call', () => {
    it('should report nothing', () => {
      // Arrange
      const source = 'mount(() => <StartClient />, document.getElementById("app")!);';

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the shape of a violation is quoted inside a string', () => {
    it('should report nothing, a quoted form not being code', () => {
      // Arrange
      const source = "const example = 'function Component({a}: P) reads its props once';";

      // Act
      const violations = findIdiomViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });
});

describe('checkSolidIdioms', () => {

  describe('When every component reads its props through the props object', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/src/components/FieldsGroup.tsx': 'export default function FieldsGroup(props: FieldsGroupProps) {'
        }
      });

      // Act
      await checkSolidIdioms(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:idioms: no component breaks a Solid idiom a line reading can tell apart.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a component destructures its props in its signature', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/src/components/FieldsGroup.tsx': 'export default function FieldsGroup({columns}: FieldsGroupProps) {'
        }
      });

      // Act
      await checkSolidIdioms(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/ui-save-manager/src/components/FieldsGroup.tsx:1\n  a component reads its props through the props object, never destructured in its signature',
          'check:idioms: 1 line(s) breaking a Solid idiom.'
        ],
        exitCodes: [1]
      });
    });
  });
});
