import { ImportResolutions } from '../../packages/import-boundaries/src/api/import-resolver.interface';
import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureImportResolutionsMap: Record<string, ImportResolutions[]> = {
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/empty.txt')]: [
        {
            createdBy: 'dummy-resolver',
            resolvedImports: [
                {
                    parsedImportStatement: {
                        fromClause: 'somewhere',
                        raw: 'import stuff from "somewhere"',
                        type: 'relative'
                    },
                    resolvedAbsoluteFilePath: IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')
                }
            ],
            resolvedPackageImports: [],
            skippedImports: [],
            unknownImports: []
        }
    ],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts')]: [
        {
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
        }
    ],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')]: [
        {
            createdBy: 'import-resolver-es6',
            resolvedImports: [],
            resolvedPackageImports: [],
            skippedImports: [],
            unknownImports: []
        }
    ],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')]: [],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')]: [
        {
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
    ],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/empty.txt')]: [],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')]: [
        {
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
        }
    ]
};

export const fixtureFileImportMapWithoutDummyResolver: Record<string, ImportResolutions[]> = Object.keys(
    fixtureImportResolutionsMap
).reduce((prev: Record<string, ImportResolutions[]>, curr: string): Record<string, ImportResolutions[]> => {
    prev[curr] = (fixtureImportResolutionsMap[curr] ?? []).filter(
        (importResolution: ImportResolutions) => importResolution.createdBy !== 'dummy-resolver'
    );
    return prev;
}, {});
