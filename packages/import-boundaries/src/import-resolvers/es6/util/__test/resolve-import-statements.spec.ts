import path from 'node:path';

import { expect } from 'chai';

import { ImportResolutions, PackageLikeImportStatement, RelativeImportStatement } from '../../../../api/import-resolver.interface';
import { ResolveImportStatements } from '../resolve-import-statements';

describe('ResolveImportStatements', () => {
    describe('resolveImportStatements', () => {
        it('should resolve import statements', async () => {
            const packageImportStatement: PackageLikeImportStatement = {
                type: 'package-like',
                raw: "import { expect } from 'chai';",
                fromClause: 'chai'
            };
            const relativeImportStatement1: RelativeImportStatement = {
                type: 'relative',
                raw: 'import { ResolveImportStatements } from "../resolve-import-statements";',
                fromClause: '../resolve-import-statements'
            };
            const relativeImportStatement2: RelativeImportStatement = {
                type: 'relative',
                raw: 'import { PackageLikeImportStatement } from "../../../../api/import-resolver.interface";',
                fromClause: '../../../../api/import-resolver.interface'
            };
            const actual: ImportResolutions = await ResolveImportStatements.resolveImportStatements(
                __filename,
                [packageImportStatement, relativeImportStatement1, relativeImportStatement2],
                'import-resolver-name'
            );
            const expected: ImportResolutions = {
                createdBy: 'import-resolver-name',
                resolvedImports: [
                    {
                        parsedImportStatement: relativeImportStatement1,
                        resolvedAbsoluteFilePath: path.join(__dirname, '../resolve-import-statements.ts')
                    },
                    {
                        parsedImportStatement: relativeImportStatement2,
                        resolvedAbsoluteFilePath: path.join(__dirname, '../../../../api/import-resolver.interface.ts')
                    }
                ],
                resolvedPackageImports: [
                    {
                        package: 'chai',
                        resolvedAbsoluteFilePath: require.resolve('chai')
                    }
                ],
                skippedImports: [],
                unknownImports: []
            };
            expect(actual).to.deep.equal(expected);
        });
    });
});
