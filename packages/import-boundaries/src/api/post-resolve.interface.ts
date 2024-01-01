import { FileToImportResolutions } from './import-resolver.interface';

export interface YaniceImportBoundariesPostResolver {
    postProcess: (absoluteFilePath: string, fileToImportResolutions: FileToImportResolutions) => Promise<FileToImportResolutions>;
}
