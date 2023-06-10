import { ExtractImportStatementsJavascript } from '../extract-import-statements.javascript';
import { expect } from 'chai';

describe('ExtractImportStatementsJavascript', () => {
    describe('extractImportStatements', () => {
        it('should extract all import statements in single-line files', () => {
            expect(ExtractImportStatementsJavascript.extractImportStatements('')).to.have.same.members([]);

            const actual1: string[] = ExtractImportStatementsJavascript.extractImportStatements('import blah from "somewhere"; blah();');
            const expected1: string[] = ['import blah from "somewhere"'];
            expect(actual1).to.have.same.members(expected1);
            expect(actual1).to.have.length(expected1.length);

            const actual2: string[] = ExtractImportStatementsJavascript.extractImportStatements(
                "import blah from 'somewhere'; blah(); import * as stuff from 'there';"
            );
            const expected2: string[] = ["import blah from 'somewhere'", "import * as stuff from 'there'"];
            expect(actual2).to.have.same.members(expected2);
            expect(actual2).to.have.length(expected2.length);
        });

        it('should extract all import statements in multi-line files, with tabs present', () => {
            const actual1: string[] = ExtractImportStatementsJavascript.extractImportStatements(
                '\timport blah\t\nfrom \n"somewhere";\n blah();'
            );
            const expected1: string[] = ['import blah from "somewhere"'];
            expect(actual1).to.have.same.members(expected1);
            expect(actual1).to.have.length(expected1.length);

            const input2: string = `
            import {something} from 'somewhere';
            // some comment
            import * as t from 'barrel';import def from 'default-export';
            someCode();
            importfromsomewhere();
            import_from();
            import a\t from "b";
            `;
            const actual2: string[] = ExtractImportStatementsJavascript.extractImportStatements(input2);
            const expected2: string[] = [
                "import {something} from 'somewhere'",
                "import * as t from 'barrel'",
                "import def from 'default-export'",
                'import a from "b"'
            ];
            expect(actual2).to.have.same.members(expected2);
            expect(actual2).to.have.length(expected2.length);
        });
    });

    describe('stripBlockComments', () => {
        it('should properly strip out block-comments', () => {
            // @ts-expect-error private; access for testing
            const stripBlockComments: (fileContent: string) => string = ExtractImportStatementsJavascript.stripBlockComments;
            expect(stripBlockComments('/* some comment */things')).to.equal('things');
            expect(stripBlockComments('/* some comment */non-comment/*comment*/')).to.equal('non-comment');
            expect(stripBlockComments('/* multi\nline\ncomment\n */non-comment/*\n*/')).to.equal('non-comment');
        });
    });

    describe('normalizeImportStatement', () => {
        it('should remove unnecessary whitespace', () => {
            const normalizeImportStatement: (importStatement: string) => string =
                // @ts-expect-error private; access for testing
                ExtractImportStatementsJavascript.normalizeImportStatement;
            expect(normalizeImportStatement('import   something  from   "somewhere"')).to.equal('import something from "somewhere"');
            expect(normalizeImportStatement('import \t something  \n\rfrom \t "somewhere"')).to.equal('import something from "somewhere"');
            expect(normalizeImportStatement('import \t { something}  \n\rfrom \t "somewhere"')).to.equal(
                'import { something} from "somewhere"'
            );
        });
    });
});