import { FileToImportResolutions } from './import-resolver.interface';

export interface ImportBoundaryAssertionData {
    fileToProjectsMap: Record<string, string[]>;
    fileToImportResolutionsMap: Record<string, FileToImportResolutions>;
    projectDependencyGraph: Record<string, string[]>;
}
