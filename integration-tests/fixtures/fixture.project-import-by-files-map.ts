import type { ProjectImportByFilesMap } from '../../packages/import-boundaries/src/api/project-import-map.interface';

export const fixtureProjectImportByFilesMap: ProjectImportByFilesMap = {
    A: [
        {
            createdByResolver: 'dummy-resolver',
            filePath: 'project-A/empty.txt',
            resolvedImports: [
                {
                    filePath: 'project-B/empty.txt',
                    importStatement: 'import stuff from "somewhere"',
                    projects: ['B']
                }
            ],
            resolvedPackageImports: [],
            skippedImports: [],
            unknownImports: []
        },
        {
            createdByResolver: 'import-resolver-es6',
            filePath: 'project-A/project-a-1.ts',
            resolvedImports: [
                {
                    filePath: 'project-B/project-b.ts',
                    importStatement: "import { dummyB } from '../project-B/project-b'",
                    projects: ['B']
                },
                {
                    filePath: 'project-A/project-a-2.ts',
                    importStatement: "import { dummyA2 } from './project-a-2'",
                    projects: ['A']
                }
            ],
            resolvedPackageImports: [],
            skippedImports: ["import { dummyC } from '../project-C/project-c'"],
            unknownImports: []
        },
        {
            createdByResolver: 'import-resolver-es6',
            filePath: 'project-A/project-a-2.ts',
            resolvedImports: [],
            resolvedPackageImports: [],
            skippedImports: [],
            unknownImports: []
        }
    ],
    B: [
        {
            createdByResolver: 'import-resolver-es6',
            filePath: 'project-B/project-b.ts',
            resolvedImports: [
                {
                    filePath: 'project-C/project-c.ts',
                    importStatement: "import { dummyC } from '../project-C/project-c'",
                    projects: ['C']
                }
            ],
            resolvedPackageImports: [],
            skippedImports: [],
            unknownImports: []
        }
    ],
    C: [
        {
            createdByResolver: 'import-resolver-es6',
            filePath: 'project-C/project-c.ts',
            resolvedImports: [],
            resolvedPackageImports: [],
            skippedImports: ["import { dummyB } from '../project-B/project-b'"],
            unknownImports: []
        }
    ]
};
