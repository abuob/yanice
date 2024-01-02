import type { FileToImportResolutionsMap, ImportResolution } from '@yanice/import-boundaries';

import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureFileToImportResolutions: FileToImportResolutionsMap = {
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-plugin.ts')]: {
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [
                    {
                        package: 'yanice',
                        resolvedAbsoluteFilePath: require.resolve('yanice')
                    }
                ],
                unknownImports: []
            }
        ],
        skippedImports: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-assertion.ts')]: {
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [
                    {
                        package: '@yanice/import-boundaries',
                        resolvedAbsoluteFilePath: require.resolve('@yanice/import-boundaries')
                    },
                    {
                        package: 'yanice',
                        resolvedAbsoluteFilePath: require.resolve('yanice')
                    }
                ],
                unknownImports: []
            }
        ],
        skippedImports: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-resolver.ts')]: {
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [
                    {
                        package: 'node:path',
                        resolvedAbsoluteFilePath: 'node:path'
                    },
                    {
                        package: '@yanice/import-boundaries',
                        resolvedAbsoluteFilePath: require.resolve('@yanice/import-boundaries')
                    }
                ],
                unknownImports: []
            }
        ],
        skippedImports: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-post-resolve.ts')]: {
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [
                    {
                        package: '@yanice/import-boundaries',
                        resolvedAbsoluteFilePath: require.resolve('@yanice/import-boundaries')
                    }
                ],
                unknownImports: []
            }
        ],
        skippedImports: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/empty.txt')]: {
        skippedImports: [],
        importResolutions: [
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
                unknownImports: []
            }
        ]
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts')]: {
        skippedImports: [
            {
                type: 'skip-next-line',
                raw: "@yanice:import-boundaries ignore-next-line\nimport { dummyC } from '../project-C/project-c';\n"
            }
        ],
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
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
                unknownImports: []
            }
        ]
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')]: {
        skippedImports: [],
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [],
                unknownImports: []
            }
        ]
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')]: {
        skippedImports: [],
        importResolutions: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')]: {
        skippedImports: [],
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
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
                unknownImports: []
            }
        ]
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/empty.txt')]: {
        skippedImports: [],
        importResolutions: []
    },
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')]: {
        skippedImports: [
            {
                type: 'skip-next-line',
                raw: "@yanice:import-boundaries ignore-next-line\nimport { dummyB } from '../project-B/project-b';\n"
            }
        ],
        importResolutions: [
            {
                createdBy: 'es6-declarative-import-resolver',
                resolvedImports: [],
                resolvedPackageImports: [],
                unknownImports: []
            }
        ]
    }
};

export const fixtureFileImportMapWithoutDummyResolver: FileToImportResolutionsMap = Object.keys(fixtureFileToImportResolutions).reduce(
    (prev: FileToImportResolutionsMap, curr: string): FileToImportResolutionsMap => {
        prev[curr] = {
            skippedImports: fixtureFileToImportResolutions[curr].skippedImports ?? [],
            importResolutions: (fixtureFileToImportResolutions[curr].importResolutions ?? []).filter(
                (importResolution: ImportResolution): boolean => importResolution.createdBy !== 'dummy-resolver'
            )
        };
        return prev;
    },
    {}
);
