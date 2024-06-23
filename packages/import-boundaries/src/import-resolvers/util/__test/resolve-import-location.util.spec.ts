import path from 'node:path';

import { expect } from 'chai';

import { ImportResolution, PackageLikeImportStatement, RelativeImportStatement } from '../../../api/import-resolver.interface';
import { ResolveImportLocationUtil } from '../resolve-import-location.util';

describe('ResolveImportLocationUtil', () => {
    describe('resolveImportStatements', () => {
        /**
         * NOTE: Moving or renaming the imports used above will break this test!
         * The setup is a bit crude but does the job.
         * We use the imports in this test (from above) to see if we can resolve the corresponding files.
         * If anything is moved or renamed, make sure to keep everything in sync below.
         */
        it('should resolve import statements', async () => {
            const packageImportStatement: PackageLikeImportStatement = {
                type: 'package-like',
                raw: "import { expect } from 'chai';",
                fromClause: 'chai'
            };
            const relativeImportStatement1: RelativeImportStatement = {
                type: 'relative',
                raw: 'import { ResolveImportLocationUtil } from "../resolve-import-location.util";',
                fromClause: '../resolve-import-location.util'
            };
            const relativeImportStatement2: RelativeImportStatement = {
                type: 'relative',
                raw: "import { PackageLikeImportStatement } from '../../../api/import-resolver.interface'",
                fromClause: '../../../api/import-resolver.interface'
            };
            const actual: ImportResolution = await ResolveImportLocationUtil.resolveImportStatements(
                __filename,
                [packageImportStatement, relativeImportStatement1, relativeImportStatement2],
                'import-resolver-name'
            );
            const expected: ImportResolution = {
                createdBy: 'import-resolver-name',
                resolvedImports: [
                    {
                        parsedImportStatement: relativeImportStatement1,
                        resolvedAbsoluteFilePath: path.join(__dirname, '../resolve-import-location.util.ts')
                    },
                    {
                        parsedImportStatement: relativeImportStatement2,
                        resolvedAbsoluteFilePath: path.join(__dirname, '../../../api/import-resolver.interface.ts')
                    }
                ],
                resolvedPackageImports: [
                    {
                        package: 'chai',
                        importStatement: "import { expect } from 'chai';",
                        resolvedAbsoluteFilePath: require.resolve('chai')
                    }
                ],
                unknownImports: []
            };
            expect(actual).to.deep.equal(expected);
        });
    });
});
