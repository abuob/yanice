import path from 'node:path';

import { Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../api/import-boundary-assertion-data';
import { maxSkippedImports } from './rules/max-skipped-imports/max-skipped-imports';
import { onlyDirectImports } from './rules/only-direct-dependencies/only-direct-imports';

export class ImportBoundariesAssertions {
    public static async assertImportBoundaries(
        yaniceJsonDirectoryPath: string,
        assertionScriptLocations: string[],
        phase3Results: Phase3Result,
        assertionData: ImportBoundaryAssertionData,
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions
    ): Promise<YaniceImportBoundariesAssertionViolation[]> {
        const assertions: YaniceImportBoundariesAssertion[] = assertionScriptLocations.map(
            (assertionScriptLocation: string): YaniceImportBoundariesAssertion => {
                return ImportBoundariesAssertions.getImportBoundariesAssertion(yaniceJsonDirectoryPath, assertionScriptLocation);
            }
        );
        const assertionViolations: YaniceImportBoundariesAssertionViolation[][] = [];
        for (const assertion of assertions) {
            const violations: YaniceImportBoundariesAssertionViolation[] = await assertion.assertBoundaries(
                phase3Results,
                importBoundariesPluginConfig,
                assertionData
            );
            assertionViolations.push(violations);
        }
        return assertionViolations.flat();
    }

    private static getImportBoundariesAssertion(
        yaniceJsonDirectoryPath: string,
        resolverNameOrLocation: string
    ): YaniceImportBoundariesAssertion {
        switch (resolverNameOrLocation) {
            case 'only-direct-imports':
                return onlyDirectImports;
            case 'only-allow-configured-imports':
                // TODO: Refactor/fix
                return maxSkippedImports;
            case 'max-skipped-imports':
                return maxSkippedImports;
            default: {
                return require(path.join(yaniceJsonDirectoryPath, resolverNameOrLocation));
            }
        }
    }
}
