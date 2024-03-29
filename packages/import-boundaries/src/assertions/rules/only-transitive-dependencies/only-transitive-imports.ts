import { DirectedGraph, Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { ImportBoundaryUtil } from '../../rule-utils/import-boundary.util';
import { OnlyTransitiveImportsUtil } from './only-transitive-imports.util';

export const onlyTransitiveImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const dependencyGraph: DirectedGraph = phase3Results.phase2Result.phase1Result.depGraph;
        const ignoredProjects: string[] = config.assertionOptions?.ignoredProjects ?? [];
        const allowedDependenciesMap: Record<string, string[]> = OnlyTransitiveImportsUtil.getAllowedDependenciesMap(dependencyGraph) ?? [];
        return ImportBoundaryUtil.getRuleViolations(
            assertionData.fileToProjectsMap,
            assertionData.fileToImportResolutionsMap,
            allowedDependenciesMap,
            ignoredProjects
        );
    }
};
