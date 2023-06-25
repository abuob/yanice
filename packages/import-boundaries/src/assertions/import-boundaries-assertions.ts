import path from 'node:path';

import { Phase3Result } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';
import { FileImportMap } from '../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../api/project-import-map.interface';
import { onlyAllowActualImportsInConfigAssertion } from './only-allow-actual-imports-in-config.assertion';
import { onlyAllowConfiguredImportsAssertion } from './only-allow-configured-imports.assertion';

export class ImportBoundariesAssertions {
    public static async assertImportBoundaries(
        yaniceJsonDirectoryPath: string,
        assertionScriptLocations: string[],
        phase3Results: Phase3Result,
        fileImportMaps: FileImportMap[],
        projectImportByFilesMap: ProjectImportByFilesMap
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
                fileImportMaps,
                projectImportByFilesMap
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
            case 'only-allow-actual-imports-in-config':
                return onlyAllowActualImportsInConfigAssertion;
            case 'only-allow-configured-imports':
                return onlyAllowConfiguredImportsAssertion;
            default: {
                return require(path.join(yaniceJsonDirectoryPath, resolverNameOrLocation));
            }
        }
    }
}
