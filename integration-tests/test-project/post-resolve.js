/**
 * @type {import('../../packages/import-boundaries/src/api/post-resolve.interface').YaniceImportBoundariesPostResolver}
 */
const postResolve = {
    /**
     * @returns {Promise<import('../../packages/import-boundaries/src/api/import-resolver.interface.ts').FileImportMap[]>}
     */
    postProcess: async (fileImportMaps) => {
        return fileImportMaps.filter((fileImportMap) => {
            return fileImportMap.createdBy !== 'dummy-resolver';
        });
    }
};

module.exports = postResolve;
