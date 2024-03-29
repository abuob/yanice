import { expect } from 'chai';
import { YanicePluginImportBoundariesSkippedImportsOptions } from 'yanice';

import { YaniceImportBoundariesAssertionViolation } from '../../../../api/assertion.interface';
import { FileToImportResolutions, FileToImportResolutionsMap, SkipNextLineStatement } from '../../../../api/import-resolver.interface';
import { MaxSkippedImportsUtil } from '../max-skipped-imports.util';

describe('MaxSkippedImportsUtil', (): void => {
    describe('getRuleViolations', (): void => {
        const defaultFileToImportResolution: FileToImportResolutions = {
            skippedImports: [],
            importResolutions: []
        };
        const dummyImportStatement: SkipNextLineStatement = {
            type: 'skip-next-line',
            raw: 'raw'
        };
        const fileToImportResolutionsMap: FileToImportResolutionsMap = {
            'file-A': { ...defaultFileToImportResolution, skippedImports: [dummyImportStatement, dummyImportStatement] }
        };

        it('should return an error when no configuration is present', (): void => {
            const allActualErrors: YaniceImportBoundariesAssertionViolation[] = MaxSkippedImportsUtil.getRuleViolations(undefined, {});
            expect(allActualErrors).to.have.length(1);
            const actualError: YaniceImportBoundariesAssertionViolation | undefined = allActualErrors[0];
            const expected: YaniceImportBoundariesAssertionViolation['type'] = 'skipped-imports:not-configured';
            expect(actualError?.type).to.equal(expected);
        });

        it('should return an error when in "exact"-mode and configured amount of errors and actual amount is not identical', () => {
            const config: YanicePluginImportBoundariesSkippedImportsOptions = {
                amount: 1,
                mode: 'exact'
            };
            const allActualErrors: YaniceImportBoundariesAssertionViolation[] = MaxSkippedImportsUtil.getRuleViolations(
                config,
                fileToImportResolutionsMap
            );
            expect(allActualErrors).to.have.length(1);
            const actualError: YaniceImportBoundariesAssertionViolation | undefined = allActualErrors[0];
            const expected: YaniceImportBoundariesAssertionViolation['type'] = 'skipped-imports:not-equals-configured';
            expect(actualError?.type).to.equal(expected);
        });

        it('should return no error when rule is not violated in "exact"-mode', () => {
            const config: YanicePluginImportBoundariesSkippedImportsOptions = {
                amount: 2,
                mode: 'exact'
            };
            const allActualErrors: YaniceImportBoundariesAssertionViolation[] = MaxSkippedImportsUtil.getRuleViolations(
                config,
                fileToImportResolutionsMap
            );
            expect(allActualErrors).to.have.length(0);
        });

        it('should return an error when in "max"-mode and configured amount of errors is smaller than actual errors', () => {
            const config: YanicePluginImportBoundariesSkippedImportsOptions = {
                amount: 1,
                mode: 'max'
            };
            const allActualErrors: YaniceImportBoundariesAssertionViolation[] = MaxSkippedImportsUtil.getRuleViolations(
                config,
                fileToImportResolutionsMap
            );
            expect(allActualErrors).to.have.length(1);
            const actualError: YaniceImportBoundariesAssertionViolation | undefined = allActualErrors[0];
            const expected: YaniceImportBoundariesAssertionViolation['type'] = 'skipped-imports:too-many';
            expect(actualError?.type).to.equal(expected);
        });

        it('should return no error when rule is not violated in "max"-mode', () => {
            const config: YanicePluginImportBoundariesSkippedImportsOptions = {
                amount: 3,
                mode: 'max'
            };
            const allActualErrors: YaniceImportBoundariesAssertionViolation[] = MaxSkippedImportsUtil.getRuleViolations(
                config,
                fileToImportResolutionsMap
            );
            expect(allActualErrors).to.have.length(0);
        });
    });
});
