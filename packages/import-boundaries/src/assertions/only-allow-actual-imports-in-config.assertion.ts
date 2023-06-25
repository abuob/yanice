import { Phase3Result, YaniceConfig } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';
import { EnrichedFileImportMap } from '../api/enriched-file-import-map.interface';
import { FileImportMap } from '../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../api/project-import-map.interface';

export const onlyAllowActualImportsInConfigAssertion: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        _fileImportMaps: FileImportMap[],
        projectImportByFilesMap: ProjectImportByFilesMap
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const yaniceConfig: YaniceConfig = phase3Results.phase2Result.phase1Result.yaniceConfig;
        const dependencies: YaniceConfig['dependencies'] = yaniceConfig.dependencies;
        const violations: YaniceImportBoundariesAssertionViolation[] = [];

        Object.keys(projectImportByFilesMap).forEach((projectName: string): void => {
            const declaredImports: string[] = dependencies[projectName] ?? [];
            const enrichedFileImportMaps: EnrichedFileImportMap[] = projectImportByFilesMap[projectName] ?? [];
            const usedImports: string[] = enrichedFileImportMaps
                .flatMap((enrichedFileImportMap) => enrichedFileImportMap.resolvedImports)
                .flatMap((resolvedImport) => resolvedImport.projects);
            declaredImports.forEach((declaredImport: string): void => {
                const isUsed: boolean = usedImports.some((usedImport) => usedImport === declaredImport);
                if (isUsed) {
                    return;
                }
                violations.push({
                    type: 'configured-import-unused',
                    withinProject: projectName,
                    unusedProject: declaredImport
                });
            });
        });
        return Promise.resolve(violations);
    }
};
