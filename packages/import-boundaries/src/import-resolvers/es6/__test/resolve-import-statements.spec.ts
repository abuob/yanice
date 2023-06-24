import path from 'node:path';

import { expect } from 'chai';

import { ParsedImportStatement } from '../../../api/import-resolver.interface';
import { ResolveImportStatements } from '../resolve-import-statements';

describe('ResolveImportStatements', () => {
    describe('resolveImportStatements', () => {
        it('should resolve import statements', async () => {
            const parsedImportStatements: ParsedImportStatement[] = [
                { type: 'package-like', raw: "import { expect } from 'chai';", fromClause: 'chai' },
                {
                    type: 'relative',
                    raw: 'import { ResolveImportStatements } from "../resolve-import-statements";',
                    fromClause: '../resolve-import-statements'
                },
                {
                    type: 'relative',
                    raw: 'import { ParsedImportStatement } from "../../../api/import-resolver.interface";',
                    fromClause: '../../../api/import-resolver.interface'
                }
            ];
            const actual = await ResolveImportStatements.resolveImportStatements(__dirname, parsedImportStatements);
            const expected = {
                absoluteFilePath: __dirname,
                createdBy: 'es6-import-resolver',
                resolvedImports: [
                    {
                        parsedImportStatement: {
                            fromClause: '../resolve-import-statements',
                            raw: 'import { ResolveImportStatements } from "../resolve-import-statements";',
                            type: 'relative'
                        },
                        resolvedAbsoluteFilePath: path.join(__dirname, '../resolve-import-statements.ts')
                    },
                    {
                        parsedImportStatement: {
                            fromClause: '../../../api/import-resolver.interface',
                            raw: 'import { ParsedImportStatement } from "../../../api/import-resolver.interface";',
                            type: 'relative'
                        },
                        resolvedAbsoluteFilePath: path.join(__dirname, '../../../api/import-resolver.interface.ts')
                    }
                ],
                resolvedPackageImports: [require.resolve('chai')],
                skippedImports: [],
                unknownImports: []
            };
            expect(actual).to.deep.equal(expected);
        });
    });
});
