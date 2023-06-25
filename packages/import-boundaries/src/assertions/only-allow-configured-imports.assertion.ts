import { Phase3Result, YaniceConfig } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';
import { EnrichedFileImportMap } from '../api/enriched-file-import-map.interface';
import { FileImportMap } from '../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../api/project-import-map.interface';

export const onlyAllowConfiguredImportsAssertion: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        _fileImportMaps: FileImportMap[],
        projectImportByFilesMap: ProjectImportByFilesMap
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const yaniceConfig: YaniceConfig = phase3Results.phase2Result.phase1Result.yaniceConfig;
        const dependencies: YaniceConfig['dependencies'] = yaniceConfig.dependencies;
        const violations: YaniceImportBoundariesAssertionViolation[] = [];
        Object.keys(projectImportByFilesMap).forEach((projectName: string): void => {
            const allowedImports: string[] = dependencies[projectName] ?? [];
            const enrichedFileImportMaps: EnrichedFileImportMap[] = projectImportByFilesMap[projectName] ?? [];
            enrichedFileImportMaps.forEach((enrichedFileImportMap: EnrichedFileImportMap): void => {
                enrichedFileImportMap.resolvedImports.forEach((resolvedImport: EnrichedFileImportMap['resolvedImports'][number]): void => {
                    const illegallyImportedProject: string | undefined = resolvedImport.projects.find((project: string) => {
                        return !allowedImports.some((allowedImport: string) => {
                            return allowedImport === project;
                        });
                    });
                    if (!illegallyImportedProject) {
                        return;
                    }
                    violations.push({
                        type: 'import-not-configured',
                        withinProject: projectName,
                        filePath: enrichedFileImportMap.filePath,
                        importStatement: resolvedImport.importStatement,
                        allowedProjects: allowedImports,
                        actualProject: illegallyImportedProject
                    });
                });
            });
        });
        return Promise.resolve(violations);
    }
};
