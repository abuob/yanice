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
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [
            {
                parsedImportStatement: {
                    fromClause: '../project-B/project-b',
                    raw: "import { dummyB } from '../project-B/project-b'",
                    type: 'relative'
                },
                resolvedAbsoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')
            }
        ],
        resolvedPackageImports: [],
        skippedImports: [],
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
    },
    {
        absoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts'),
        createdBy: 'import-resolver-es6',
        resolvedImports: [],
        resolvedPackageImports: [],
        skippedImports: [],
        unknownImports: []
    }
];
