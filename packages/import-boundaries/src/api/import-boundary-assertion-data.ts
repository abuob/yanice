import { ImportResolutions } from './import-resolver.interface';

export interface ImportBoundaryAssertionData {
    fileToProjectsMap: Record<string, string[]>;
    importResolutionsMap: Record<string, ImportResolutions[]>;
    projectDependencyGraph: Record<string, string[]>;
}
