import { FileToImportResolutionsMap } from './import-resolver.interface';

export interface ImportBoundaryAssertionData {
    fileToProjectsMap: Record<string, string[]>;
    fileToImportResolutionsMap: FileToImportResolutionsMap;
    projectDependencyGraph: Record<string, string[]>;
}
