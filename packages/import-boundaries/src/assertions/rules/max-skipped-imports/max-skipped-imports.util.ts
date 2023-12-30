import { YanicePluginImportBoundariesSkippedImportsOptions } from 'yanice';

import {
    AssertionViolationSkippedImportOptionsNotConfigured,
    AssertionViolationSkippedImportsNotEqualsConfiguredAmount,
    AssertionViolationSkippedImportsTooMany,
    YaniceImportBoundariesAssertionViolation
} from '../../../api/assertion.interface';
import { FileToImportResolutionsMap, SkipNextLineStatement } from '../../../api/import-resolver.interface';

export class MaxSkippedImportsUtil {
    public static getRuleViolations(
        skippedImportsConfig: YanicePluginImportBoundariesSkippedImportsOptions | undefined,
        fileToImportResolutionsMap: FileToImportResolutionsMap
    ): YaniceImportBoundariesAssertionViolation[] {
        if (!skippedImportsConfig) {
            const notConfigured: AssertionViolationSkippedImportOptionsNotConfigured = {
                type: 'skipped-imports:not-configured'
            };
            return [notConfigured];
        }
        const allSkippedImports: SkipNextLineStatement[] = Object.keys(fileToImportResolutionsMap).flatMap(
            (filePath: string): SkipNextLineStatement[] => fileToImportResolutionsMap[filePath]?.skippedImports ?? []
        );
        const amountOfSkippedImports: number = allSkippedImports.length;
        switch (skippedImportsConfig.mode) {
            case 'max':
                return MaxSkippedImportsUtil.handleMaxMode(amountOfSkippedImports, skippedImportsConfig.amount);
            case 'exact':
                return MaxSkippedImportsUtil.handleExactMode(amountOfSkippedImports, skippedImportsConfig.amount);
        }
    }
    public static handleMaxMode(amountOfSkippedImports: number, allowedAmount: number): YaniceImportBoundariesAssertionViolation[] {
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

    public static handleExactMode(amountOfSkippedImports: number, allowedAmount: number): YaniceImportBoundariesAssertionViolation[] {
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
}
