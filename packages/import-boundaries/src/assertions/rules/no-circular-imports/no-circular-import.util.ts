import type { YanicePluginImportBoundariesNoCircularImportsOptions } from 'yanice';

import { AssertionViolationNoCircularImportsCycleViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { FileToImportResolutionsMap } from '../../../api/import-resolver.interface';
import { FileImportGraph } from './file-import-graph';

export class NoCircularImportUtil {
    public static getImportCycleAssertionViolations(
        assertionData: ImportBoundaryAssertionData,
        config: YanicePluginImportBoundariesNoCircularImportsOptions | null
    ): AssertionViolationNoCircularImportsCycleViolation[] {
        const fileToImportResolutionsMapFiltered: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
            assertionData.fileToImportResolutionsMap,
            config?.excludedProjects ?? [],
            assertionData.fileToProjectsMap
        );

        return FileImportGraph.createFileImportGraph(fileToImportResolutionsMapFiltered).getCycles();
    }

    // Only public for testing
    public static getFileToImportResolutionsMapFiltered(
        fileToImportResolutionsMap: FileToImportResolutionsMap,
        excludedProjects: string[],
        fileToProjectsMap: Record<string, string[]>
    ): FileToImportResolutionsMap {
        if (excludedProjects.length === 0) {
            return fileToImportResolutionsMap;
        }

        const fileToImportResolutionsMapFiltered: FileToImportResolutionsMap = {};
        const excludedProjectsSet: Set<string> = new Set(excludedProjects);
        for (const [filePath, importResolutions] of Object.entries(fileToImportResolutionsMap)) {
            const associatedProjects: string[] = fileToProjectsMap[filePath] ?? [];
            const isPartOfExcludedProject: boolean = associatedProjects.some((project: string): boolean =>
                excludedProjectsSet.has(project)
            );
            if (isPartOfExcludedProject) {
                continue;
            }
            fileToImportResolutionsMapFiltered[filePath] = importResolutions;
        }
        return fileToImportResolutionsMapFiltered;
    }
}
