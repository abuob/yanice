import { expect } from 'chai';

import { ParsedImportStatement } from '../../../api/import-resolver.interface';
import { ImportStatementParser } from '../parse-import-statements';

describe('ImportStatementParser', () => {
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
                expect(ImportStatementParser.parseImportStatement(input)).to.deep.equal(inputOutputMap[input]);
            });
        });
    });

    describe('extractFromClause', () => {
        it('should extract the from clause', () => {
            expect(ImportStatementParser.extractFromClause("import {something} from 'somewhere'")).to.equal('somewhere');
            expect(ImportStatementParser.extractFromClause("import * as t from 'barrel'")).to.equal('barrel');
            expect(ImportStatementParser.extractFromClause("import deffrom from 'default-export'")).to.equal('default-export');
            expect(ImportStatementParser.extractFromClause("import importimportfrom from 'default-export'")).to.equal('default-export');
            expect(ImportStatementParser.extractFromClause('import a from "b"')).to.equal('b');
        });
    });
});
