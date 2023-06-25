import { Phase3Result } from 'yanice';

import { FileImportMap } from './import-resolver.interface';
import { ProjectImportByFilesMap } from './project-import-map.interface';

export type YaniceImportBoundariesAssertionViolation =
    | AssertionViolationConfiguredImportUnused
    | AssertionViolationImportNotConfigured
    | AssertionViolationUnknownImport;

export interface AssertionViolationUnknownImport {
    type: 'unknown-import';
    withinProject: string;
    filePath: string;
    importStatement: string;
}

export interface AssertionViolationImportNotConfigured {
    type: 'import-not-configured';
    withinProject: string;
    filePath: string;
    allowedProjects: string[];
    importStatement: string;
    actualProject: string;
}

export interface AssertionViolationConfiguredImportUnused {
    type: 'configured-import-unused';
    withinProject: string;
    unusedProject: string;
}

export interface YaniceImportBoundariesAssertion {
    assertBoundaries: (
        phase3Results: Phase3Result,
        fileImportMaps: FileImportMap[],
        projectImportByFilesMap: ProjectImportByFilesMap
    ) => Promise<YaniceImportBoundariesAssertionViolation[]>;
}
