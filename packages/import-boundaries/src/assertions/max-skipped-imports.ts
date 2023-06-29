import { Phase3Result } from 'yanice';

import {
    AssertionViolationAmountOfSkippedImportsNotConfigured,
    AssertionViolationTooManySkippedImports,
    YaniceImportBoundariesAssertion,
    YaniceImportBoundariesAssertionViolation
} from '../api/assertion.interface';
import { EnrichedFileImportMap } from '../api/enriched-file-import-map.interface';
import { FileImportMap } from '../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../api/project-import-map.interface';

export const maxSkippedImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        _fileImportMaps: FileImportMap[],
        projectImportByFilesMap: ProjectImportByFilesMap
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const maxAmountOfSkippedImports: number | null =
            phase3Results.phase2Result.phase1Result.yaniceConfig.plugins.officiallySupported['import-boundaries']?.assertionOptions
                ?.maximumSkippedImports ?? null;
        if (maxAmountOfSkippedImports === null) {
            const notConfigured: AssertionViolationAmountOfSkippedImportsNotConfigured = {
                type: 'amount-of-skipped-imports-not-configured'
            };
            return [notConfigured];
        }
        let amountOfSkippedImports: number = 0;
        Object.keys(projectImportByFilesMap).forEach((projectName: string): void => {
            projectImportByFilesMap[projectName]?.forEach((enrichedFileImportMap: EnrichedFileImportMap): void => {
                amountOfSkippedImports = amountOfSkippedImports + enrichedFileImportMap.skippedImports.length;
            });
        });
        if (amountOfSkippedImports > maxAmountOfSkippedImports) {
            const tooManySkips: AssertionViolationTooManySkippedImports = {
                type: 'too-many-skipped-imports',
                maxAmount: maxAmountOfSkippedImports,
                actualAmount: amountOfSkippedImports
            };
            return [tooManySkips];
        }
        return [];
    }
};
