import { expect } from 'chai';

import { ParsedImportStatement } from '../../../api/import-resolver.interface';
import { Es6DeclarativeImportResolverUtil } from '../es6-declarative-import-resolver.util';

describe('Es6DeclarativeImportResolverUtil', () => {
    describe('parseImportStatement', () => {
        it('should parse import statements', () => {
            const inputOutputMap: Record<string, ParsedImportStatement> = {
                "import {something} from 'somewhere'": {
                    type: 'package-like',
                    fromClause: 'somewhere',
                    raw: "import {something} from 'somewhere'"
                },
                "import * as t from 'barrel'": {
                    type: 'package-like',
                    fromClause: 'barrel',
                    raw: "import * as t from 'barrel'"
                },
                "import deffrom from 'default-export'": {
                    type: 'package-like',
                    fromClause: 'default-export',
                    raw: "import deffrom from 'default-export'"
                },
                "import importimportfrom from 'default-export'": {
                    type: 'package-like',
                    fromClause: 'default-export',
                    raw: "import importimportfrom from 'default-export'"
                },
                'import a from "b"': {
                    type: 'package-like',
                    fromClause: 'b',
                    raw: 'import a from "b"'
                },
                'import a from "fromfrom"': {
                    type: 'package-like',
                    fromClause: 'fromfrom',
                    raw: 'import a from "fromfrom"'
                },
                "import a from './somewhere'": {
                    type: 'relative',
                    fromClause: './somewhere',
                    raw: "import a from './somewhere'"
                },
                "import a from '../somewhere'": {
                    type: 'relative',
                    fromClause: '../somewhere',
                    raw: "import a from '../somewhere'"
                },
                "import a from '../../somewhere'": {
                    type: 'relative',
                    fromClause: '../../somewhere',
                    raw: "import a from '../../somewhere'"
                }
            };
            Object.keys(inputOutputMap).forEach((input: string) => {
                expect(Es6DeclarativeImportResolverUtil.parseImportStatement(input)).to.deep.equal(inputOutputMap[input]);
            });
        });
    });

    describe('extractFromClause', () => {
        it('should extract the from clause', () => {
            expect(Es6DeclarativeImportResolverUtil.extractFromClause("import {something} from 'somewhere'")).to.equal('somewhere');
            expect(Es6DeclarativeImportResolverUtil.extractFromClause("import * as t from 'barrel'")).to.equal('barrel');
            expect(Es6DeclarativeImportResolverUtil.extractFromClause("import deffrom from 'default-export'")).to.equal('default-export');
            expect(Es6DeclarativeImportResolverUtil.extractFromClause("import importimportfrom from 'default-export'")).to.equal(
                'default-export'
            );
            expect(Es6DeclarativeImportResolverUtil.extractFromClause('import a from "b"')).to.equal('b');
        });
    });

    describe('extractImportStatements', () => {
        it('should extract all import statements in single-line files', () => {
            expect(Es6DeclarativeImportResolverUtil.extractImportStatements('')).to.have.same.members([]);

            const actual1: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements('import blah from "somewhere"; blah();');
            const expected1: string[] = ['import blah from "somewhere"'];
            expect(actual1).to.have.same.members(expected1);
            expect(actual1).to.have.length(expected1.length);

            const actual2: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(
                "import blah from 'somewhere'; blah(); import * as stuff from 'there';"
            );
            const expected2: string[] = ["import blah from 'somewhere'", "import * as stuff from 'there'"];
            expect(actual2).to.have.same.members(expected2);
            expect(actual2).to.have.length(expected2.length);
        });

        it('should extract all import statements in multi-line files, with tabs present', () => {
            const actual1: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(
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
            const actual2: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(input2);
            const expected2: string[] = [
                "import {something} from 'somewhere'",
                "import * as t from 'barrel'",
                "import def from 'default-export'",
                'import a from "b"'
            ];
            expect(actual2).to.have.same.members(expected2);
            expect(actual2).to.have.length(expected2.length);
        });

        it('should not consider skip-statements', () => {
            const fileInput: string = `
            import {something} from 'somewhere';
            // some comment
            import * as t from 'barrel';import def from 'default-export';
            import * as t from 'barrel';import def from 'default-export';
            //@yanice:import-boundaries ignore-next-line
            // @yanice:import-boundaries ignore-next-line\n\n \t
            //  @yanice:import-boundaries ignore-next-line
            someCode();
            importfromsomewhere();
            import_from();
            import a\t from "b";
            `;
            const actual: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(fileInput);
            const expected: string[] = [
                "import {something} from 'somewhere'",
                "import * as t from 'barrel'",
                "import def from 'default-export'",
                "import * as t from 'barrel'",
                "import def from 'default-export'",
                'import a from "b"'
            ];
            expect(actual).to.have.same.members(expected);
            expect(actual).to.have.length(expected.length);
        });

        it('should not catch import-statements that are made within a string', () => {
            const importStatementWithinString = "console.log('import * from 'somewhere')";
            const actual: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(importStatementWithinString);
            expect(actual).to.have.length(0);
        });
    });

    describe('stripBlockComments', () => {
        it('should properly strip out block-comments', () => {
            // @ts-expect-error private; access for testing
            const stripBlockComments: (fileContent: string) => string = Es6DeclarativeImportResolverUtil.stripBlockComments;
            expect(stripBlockComments('/* some comment */things')).to.equal('things');
            expect(stripBlockComments('/* some comment */non-comment/*comment*/')).to.equal('non-comment');
            expect(stripBlockComments('/* multi\nline\ncomment\n */non-comment/*\n*/')).to.equal('non-comment');
        });
    });

    describe('normalizeImportStatement', () => {
        it('should remove unnecessary whitespace', () => {
            const normalizeImportStatement: (importStatement: string) => string =
                // @ts-expect-error private; access for testing
                Es6DeclarativeImportResolverUtil.normalizeImportStatement;
            expect(normalizeImportStatement('import   something  from   "somewhere"')).to.equal('import something from "somewhere"');
            expect(normalizeImportStatement('import \t something  \n\rfrom \t "somewhere"')).to.equal('import something from "somewhere"');
            expect(normalizeImportStatement('import \t { something}  \n\rfrom \t "somewhere"')).to.equal(
                'import { something} from "somewhere"'
            );
        });
    });
});
