import { Phase3Result, YanicePluginImportBoundariesOptions, YanicePluginImportBoundariesSkippedImportsOptions } from 'yanice';

import {
    AssertionViolationSkippedImportOptionsNotConfigured,
    AssertionViolationSkippedImportsNotEqualsConfiguredAmount,
    AssertionViolationSkippedImportsTooMany,
    YaniceImportBoundariesAssertion,
    YaniceImportBoundariesAssertionViolation
} from '../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../api/import-boundary-assertion-data';
import { ImportResolutions } from '../../api/import-resolver.interface';

export const maxSkippedImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        _phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const skippedImportsConfig: YanicePluginImportBoundariesSkippedImportsOptions | undefined =
            config?.assertionOptions?.skippedImports;
        if (!skippedImportsConfig) {
            const notConfigured: AssertionViolationSkippedImportOptionsNotConfigured = {
                type: 'skipped-imports:not-configured'
            };
            return [notConfigured];
        }
        const amountOfSkippedImports: number = Object.values(assertionData.importResolutionsMap)
            .flat()
            .reduce((prev: number, curr: ImportResolutions): number => {
                return prev + curr.skippedImports.length;
            }, 0);
        switch (skippedImportsConfig.mode) {
            case 'max':
                return handleMaxMode(amountOfSkippedImports, skippedImportsConfig.amount);
            case 'exact':
                return handleExactMode(amountOfSkippedImports, skippedImportsConfig.amount);
        }
    }
};

function handleMaxMode(amountOfSkippedImports: number, allowedAmount: number): YaniceImportBoundariesAssertionViolation[] {
    if (amountOfSkippedImports <= allowedAmount) {
        return [];
    }
    const violation: AssertionViolationSkippedImportsTooMany = {
        type: 'skipped-imports:too-many',
        maxAmount: allowedAmount,
        actualAmount: amountOfSkippedImports
    };
    return [violation];
}

function handleExactMode(amountOfSkippedImports: number, allowedAmount: number): YaniceImportBoundariesAssertionViolation[] {
    if (amountOfSkippedImports === allowedAmount) {
        return [];
    }
    const violation: AssertionViolationSkippedImportsNotEqualsConfiguredAmount = {
        type: 'skipped-imports:not-equals-configured',
        expectedAmount: allowedAmount,
        actualAmount: amountOfSkippedImports
    };
    return [violation];
}
