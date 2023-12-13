import { DirectedGraph, Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { OnlyDirectImportsUtil } from './only-direct-imports.util';

export const onlyDirectImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        _config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const dependencyGraph: DirectedGraph = phase3Results.phase2Result.phase1Result.depGraph;
        return OnlyDirectImportsUtil.getRuleViolations(
            assertionData.fileToProjectsMap,
            assertionData.importResolutionsMap,
            dependencyGraph
        );
    }
};
