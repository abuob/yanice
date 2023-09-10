import { FileImportMap } from '../../packages/import-boundaries/src/api/import-resolver.interface';
import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureFileImportMap: FileImportMap[] = [
    {
        absoluteFilePath: IntegrationTestUtil.mapProjectNameToEmptyTxt('project-A'),
        createdBy: 'dummy-resolver',
        resolvedImports: [
            {
                parsedImportStatement: {
                    type: 'relative',
                    fromClause: 'somewhere',
                    raw: 'import stuff from "somewhere"'
                },
                resolvedAbsoluteFilePath: IntegrationTestUtil.mapProjectNameToEmptyTxt('project-B')
            }
        ],
        resolvedPackageImports: [],
        skippedImports: [],
        unknownImports: []
    },
    {
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [],
        resolvedPackageImports: [],
        skippedImports: [],
        unknownImports: []
    },
    {
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [],
        resolvedPackageImports: [],
        skippedImports: [
            {
                fromClause: '../project-B/project-b',
                raw: "import { dummyB } from '../project-B/project-b'",
                type: 'relative'
            }
        ],
        unknownImports: []
    },
    {
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [
            {
                parsedImportStatement: {
                    fromClause: '../project-B/project-b',
                    raw: "import { dummyB } from '../project-B/project-b'",
                    type: 'relative'
                },
                resolvedAbsoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')
            },
            {
                parsedImportStatement: {
                    fromClause: './project-a-2',
                    raw: "import { dummyA2 } from './project-a-2'",
                    type: 'relative'
                },
                resolvedAbsoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')
            }
        ],
        resolvedPackageImports: [],
        skippedImports: [
            {
                fromClause: '../project-C/project-c',
                raw: "import { dummyC } from '../project-C/project-c'",
                type: 'relative'
            }
        ],
        unknownImports: []
    },
    {
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [
            {
                parsedImportStatement: {
                    fromClause: '../project-C/project-c',
                    raw: "import { dummyC } from '../project-C/project-c'",
                    type: 'relative'
                },
                resolvedAbsoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')
            }
        ],
        resolvedPackageImports: [],
        skippedImports: [],
        unknownImports: []
    }
];

export const fixtureFileImportMapWithoutDummyResolver: FileImportMap[] = fixtureFileImportMap.filter(
    (fileImportMap: FileImportMap) => fileImportMap.createdBy !== 'dummy-resolver'
);
