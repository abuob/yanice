import { Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { ImportBoundaryAssertionData } from './import-boundary-assertion-data';

export type YaniceImportBoundariesAssertionViolation =
    | AssertionViolationConfiguredImportUnused
    | AssertionViolationCustomAssertion
    | AssertionViolationImportNotConfigured
    | AssertionViolationInvalidEntrypoint
    | AssertionViolationInvalidEntrypointFromWithinSameProject
    | AssertionViolationRestrictPackageImportAllPackagesMustBeListed
    | AssertionViolationRestrictPackageImportBlockedPackage
    | AssertionViolationRestrictPackageImportInvalidConfigurationKeys
    | AssertionViolationRestrictPackageImportMissingConfig
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
    importedProject: string;
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

export interface AssertionViolationInvalidEntrypoint {
    type: 'invalid-entrypoint:from-outside';
    withinProject: string;
    filePath: string;
    importStatement: string;
    importedProject: string;
    expectedEntryPoints: string[];
}

export interface AssertionViolationInvalidEntrypointFromWithinSameProject {
    type: 'invalid-entrypoint:from-same-project';
    withinProject: string;
    filePath: string;
    importStatement: string;
}

export interface AssertionViolationRestrictPackageImportMissingConfig {
    type: 'restrict-package-import::missing-config';
}

export interface AssertionViolationRestrictPackageImportInvalidConfigurationKeys {
    type: 'restrict-package-import::invalid-configuration-keys';
    list: 'allowlist' | 'blocklist';
    notAProjectName: string;
}

export interface AssertionViolationRestrictPackageImportBlockedPackage {
    type: 'restrict-package-import::blocked-package';
    importStatement: string;
    filePath: string;
    withinProject: string;
}

export interface AssertionViolationRestrictPackageImportAllPackagesMustBeListed {
    type: 'restrict-package-import::all-packages-must-be-listed';
    importStatement: string;
    filePath: string;
    withinProject: string;
}

export interface AssertionViolationCustomAssertion {
    type: 'custom-assertion-violation';
    message: string;
}

export interface YaniceImportBoundariesAssertion {
    assertBoundaries: (
        phase3Results: Phase3Result,
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ) => Promise<YaniceImportBoundariesAssertionViolation[]>;
}
