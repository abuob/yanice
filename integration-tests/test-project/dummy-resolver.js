const path = require('node:path');

/**
 * @param relativePath
 * @returns {string}
 */
function absolutePath(relativePath) {
    return path.join(__dirname, relativePath);
}

/**
 * @type {import('../../packages/import-boundaries/src/api/import-resolver.interface.ts').YaniceImportBoundariesImportResolver}
 */
const dummyResolver = {
    name: 'dummy-resolver',

    /**
     * @returns {Promise<import("../../packages/import-boundaries/src/api/import-resolver.interface").ImportResolutions | null>}
     */
    getFileImportMap: async (absoluteFilePath, fileContent) => {
        const projectAPath = absolutePath('project-A/empty.txt');
        if (absoluteFilePath !== projectAPath) {
            return Promise.resolve(null);
        }
        /**
         * @type {import("../../packages/import-boundaries/src/api/import-resolver.interface").ImportResolutions}
         */
        const result = {
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
            createdBy: 'dummy-resolver',
            skippedImports: []
        };
        return Promise.resolve(result);
    }
};
module.exports = dummyResolver;
