import path from 'node:path';

import { importBoundaryAssertionIdentifierType, Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../api/import-boundary-assertion-data';
import { accessViaEntryPoints } from './rules/access-via-entrypoints/access-via-entrypoints';
import { maxSkippedImports } from './rules/max-skipped-imports/max-skipped-imports';
import { onlyDirectImports } from './rules/only-direct-dependencies/only-direct-imports';
import { onlyTransitiveImports } from './rules/only-transitive-dependencies/only-transitive-imports';
import { useAllDeclaredDependencies } from './rules/use-all-declared-dependencies/use-all-declared-dependencies';

export class ImportBoundariesAssertions {
    public static async assertImportBoundaries(
        yaniceJsonDirectoryPath: string,
        officiallySupportedAssertionsIdentifiers: importBoundaryAssertionIdentifierType[],
        customAssertionScriptPaths: string[],
        phase3Results: Phase3Result,
        assertionData: ImportBoundaryAssertionData,
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions
    ): Promise<YaniceImportBoundariesAssertionViolation[]> {
        const officiallySupportedAssertions: YaniceImportBoundariesAssertion[] = officiallySupportedAssertionsIdentifiers.map(
            (assertionIdentifier: importBoundaryAssertionIdentifierType): YaniceImportBoundariesAssertion => {
                return ImportBoundariesAssertions.getOfficiallySupportedAssertions(assertionIdentifier);
            }
        );
        const customAssertions: YaniceImportBoundariesAssertion[] = customAssertionScriptPaths.map(
            (customAssertionScriptPath: string): YaniceImportBoundariesAssertion => {
                return ImportBoundariesAssertions.getCustomAssertions(yaniceJsonDirectoryPath, customAssertionScriptPath);
            }
        );
        const allAssertions: YaniceImportBoundariesAssertion[] = officiallySupportedAssertions.concat(customAssertions);
        const assertionViolations: YaniceImportBoundariesAssertionViolation[][] = [];
        for (const assertion of allAssertions) {
            const violations: YaniceImportBoundariesAssertionViolation[] = await assertion.assertBoundaries(
                phase3Results,
                importBoundariesPluginConfig,
                assertionData
            );
            assertionViolations.push(violations);
        }
        return assertionViolations.flat();
    }

    private static getOfficiallySupportedAssertions(assertionType: importBoundaryAssertionIdentifierType): YaniceImportBoundariesAssertion {
        switch (assertionType) {
            case 'only-direct-imports':
                return onlyDirectImports;
            case 'only-transitive-dependencies':
                return onlyTransitiveImports;
            case 'use-all-declared-dependencies':
                return useAllDeclaredDependencies;
            case 'max-skipped-imports':
                return maxSkippedImports;
            case 'access-via-entrypoints':
                return accessViaEntryPoints;
        }
    }

    private static getCustomAssertions(
        yaniceJsonDirectoryPath: string,
        relativePathToAssertionScript: string
    ): YaniceImportBoundariesAssertion {
        return require(path.join(yaniceJsonDirectoryPath, relativePathToAssertionScript));
    }
}
