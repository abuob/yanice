/**
 * @type {import('../../packages/import-boundaries/src/api/post-resolve.interface').YaniceImportBoundariesPostResolverV2}
 */
const postResolve = {
    /**
     * @returns {Promise<import('../../packages/import-boundaries/src/api/import-resolver.interface').ImportResolutions[]>}
     */
    postProcess: async (absoluteFilePath, resolvedImports) => {
        return resolvedImports.filter((fileImportMap) => {
            return fileImportMap.createdBy !== 'dummy-resolver';
        });
    }
};

module.exports = postResolve;
