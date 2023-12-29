import { Phase3Result, YanicePluginImportBoundariesOptions, YaniceProject } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { AccessViaEntrypointsUtil } from './access-via-entrypoints.util';

export const accessViaEntryPoints: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const yaniceProjects: YaniceProject[] = phase3Results.phase2Result.phase1Result.yaniceConfig.projects;
        const yaniceJsonDirectoryPath: string = phase3Results.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const projectToEntryPointsMap: Record<string, string[]> = AccessViaEntrypointsUtil.createProjectToEntryPointsMap(
            yaniceProjects,
            yaniceJsonDirectoryPath
        );
        const ignoredProjects: string[] = config.assertionOptions?.ignoredProjects ?? [];
        return AccessViaEntrypointsUtil.getRuleViolations(
            projectToEntryPointsMap,
            assertionData.fileToImportResolutionsMap,
            assertionData.fileToProjectsMap,
            ignoredProjects
        );
    }
};
