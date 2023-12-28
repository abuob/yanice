import { DirectedGraph, Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { UseAllDeclaredDependenciesUtil } from './use-all-declared-dependencies.util';

export const useAllDeclaredDependencies: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const dependencyGraph: DirectedGraph = phase3Results.phase2Result.phase1Result.depGraph;
        const ignoredProjects: string[] = config.assertionOptions?.ignoredProjects ?? [];
        const requiredDependenciesMap: Record<string, string[]> =
            UseAllDeclaredDependenciesUtil.getAllDeclaredDependencies(dependencyGraph) ?? [];
        const projectDependencyGraph: Record<string, string[]> = assertionData.projectDependencyGraph;
        return UseAllDeclaredDependenciesUtil.getRuleViolations(requiredDependenciesMap, projectDependencyGraph, ignoredProjects);
    }
};
