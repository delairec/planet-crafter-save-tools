import {describe, expect, it} from 'bun:test';
import {findIdiomViolations, isSolidComponentFile} from './check-solid-idioms.ts';

const DESTRUCTURED_PROPS_REASON = 'a component reads its props through the props object, never destructured in its signature';
const ASSERTED_ACCESSOR_REASON = 'an accessor is bound by the callback form of Show, never asserted non-null';

describe('isSolidComponentFile', () => {

  describe('When the file is a component of a package', () => {
    it('should recognise it wherever that component sits', () => {
      // Act & Assert
      expect(isSolidComponentFile('packages/ui-save-manager/src/components/structure/FieldsGroup.tsx')).toBe(true);
      expect(isSolidComponentFile('packages/ui-save-manager/src/entry-server.tsx')).toBe(true);
    });
  });

  describe('When the file carries no JSX', () => {
    it('should leave it alone', () => {
      // Act & Assert
      expect(isSolidComponentFile('packages/ui-save-manager/src/lib/useLoadSaveFile.ts')).toBe(false);
      expect(isSolidComponentFile('packages/ui-save-manager/src/messages/appMessages.js')).toBe(false);
    });
  });

  describe('When the file is generated', () => {
    it('should leave it alone even with the component extension', () => {
      // Act & Assert
      expect(isSolidComponentFile('packages/ui-save-manager/node_modules/solid/Thing.tsx')).toBe(false);
      expect(isSolidComponentFile('packages/ui-save-manager/.output/server/Thing.tsx')).toBe(false);
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
