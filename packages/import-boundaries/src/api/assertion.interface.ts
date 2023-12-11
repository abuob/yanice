import { Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { ImportBoundaryAssertionData } from './import-boundary-assertion-data';

export type YaniceImportBoundariesAssertionViolation =
    | AssertionViolationConfiguredImportUnused
    | AssertionViolationImportNotConfigured
    | AssertionViolationSkippedImportOptionsNotConfigured
    | AssertionViolationSkippedImportsNotEqualsConfiguredAmount
    | AssertionViolationSkippedImportsTooMany
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

export interface AssertionViolationSkippedImportsTooMany {
    type: 'skipped-imports:too-many';
    maxAmount: number;
    actualAmount: number;
}

export interface AssertionViolationSkippedImportsNotEqualsConfiguredAmount {
    type: 'skipped-imports:not-equals-configured';
    expectedAmount: number;
    actualAmount: number;
}
export interface AssertionViolationSkippedImportOptionsNotConfigured {
    type: 'skipped-imports:not-configured';
}

export interface YaniceImportBoundariesAssertion {
    assertBoundaries: (
        phase3Results: Phase3Result,
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ) => Promise<YaniceImportBoundariesAssertionViolation[]>;
}
