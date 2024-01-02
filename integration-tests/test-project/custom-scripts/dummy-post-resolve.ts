import type { FileToImportResolutions, ImportResolution, YaniceImportBoundariesPostResolver } from '@yanice/import-boundaries';

const dummyPostResolve: YaniceImportBoundariesPostResolver = {
    postProcess: async (_absoluteFilePath: string, fileToImportResolutions: FileToImportResolutions): Promise<FileToImportResolutions> => {
        return {
            skippedImports: fileToImportResolutions.skippedImports,
            importResolutions: fileToImportResolutions.importResolutions.filter((importResolution: ImportResolution): boolean => {
                return importResolution.createdBy !== 'dummy-resolver';
            })
        };
    }
};

module.exports = dummyPostResolve;
