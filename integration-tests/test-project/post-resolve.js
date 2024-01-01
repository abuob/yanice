/**
 * @type {import('../../packages/import-boundaries/src/api/post-resolve.interface').YaniceImportBoundariesPostResolver}
 */
const postResolve = {
    /**
     * @returns {Promise<import('../../packages/import-boundaries/src/api/import-resolver.interface').FileToImportResolutions>}
     */
    postProcess: async (absoluteFilePath, fileToImportResolutions) => {
        return {
            skippedImports: fileToImportResolutions.skippedImports,
            importResolutions: fileToImportResolutions.importResolutions.filter((importResolution) => {
                return importResolution.createdBy !== 'dummy-resolver';
            })
        };
    }
};

module.exports = postResolve;
