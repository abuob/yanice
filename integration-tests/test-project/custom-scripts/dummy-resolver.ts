import path from 'node:path';

import type { ImportResolution, YaniceImportBoundariesImportResolver } from '@yanice/import-boundaries';

function absolutePath(relativePathToYaniceJson: string): string {
    const pathToRepoRoot: string = require.resolve('yanice').replace('/dist/index.js', '');
    const pathToIntegrationTestDirectory: string = 'integration-tests/test-project';
    return path.join(pathToRepoRoot, pathToIntegrationTestDirectory, relativePathToYaniceJson);
}

const dummyResolver: YaniceImportBoundariesImportResolver = {
    name: 'dummy-resolver',

    getFileImportMap: async (absoluteFilePath: string, _fileContent: string): Promise<ImportResolution | null> => {
        const absolutePathToProjectA: string = absolutePath('project-A/empty.txt');
        if (absoluteFilePath !== absolutePathToProjectA) {
            return Promise.resolve(null);
        }
        const result: ImportResolution = {
            unknownImports: [],
            resolvedImports: [
                {
                    resolvedAbsoluteFilePath: absolutePath('project-B/empty.txt'),
                    parsedImportStatement: {
                        type: 'relative',
                        raw: 'import stuff from "somewhere"',
                        fromClause: 'somewhere'
                    }
                }
            ],
            resolvedPackageImports: [],
            createdBy: 'dummy-resolver'
        };
        return Promise.resolve(result);
    }
};

module.exports = dummyResolver;
