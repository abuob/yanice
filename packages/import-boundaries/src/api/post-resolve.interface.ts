import { FileToImportResolutions } from './import-resolver.interface';

export interface YaniceImportBoundariesPostResolverV2 {
    postProcess: (absoluteFilePath: string, fileToImportResolutions: FileToImportResolutions) => Promise<FileToImportResolutions>;
}
