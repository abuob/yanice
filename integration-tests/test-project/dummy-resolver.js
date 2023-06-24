const path = require('node:path');

function absolutePath(relativePath) {
    return path.join(__dirname, relativePath);
}

/**
 * @type {import('../../packages/import-boundaries/src/api/import-resolver.interface.ts').YaniceImportBoundariesImportResolver}
 */
const dummyResolver = {
    name: 'dummy-resolver',

    /**
     * @returns {import('../../packages/import-boundaries/src/api/import-resolver.interface.ts').FileImportMap[]}
     */
    getFileImportMaps: () => {
        return [
            {
                absoluteFilePath: absolutePath('project-A/empty.txt'),
                unknownImports: [],
                resolvedImports: [
                    {
                        resolvedAbsoluteFilePath: absolutePath('project-B/empty.txt'),
                        parsedImportStatement: 'import stuff from "somewhere"'
                    }
                ],
                resolvedPackageImports: [],
                createdBy: 'dummy-resolver',
                skippedImports: []
            }
        ];
    }
};
module.exports = dummyResolver;
