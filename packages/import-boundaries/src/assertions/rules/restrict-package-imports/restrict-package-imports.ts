import type {
    Phase3Result,
    YanicePluginImportBoundariesOptions,
    YanicePluginImportBoundariesRestrictPackageImportsOptions,
    YaniceProject
} from 'yanice';

import type { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { RestrictPackageImportsUtil } from './restrict-package-imports.util';

export const restrictPackageImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const projectNames: string[] = phase3Results.phase2Result.phase1Result.yaniceConfig.projects.map(
            (project: YaniceProject): string => project.projectName
        );
        const options: YanicePluginImportBoundariesRestrictPackageImportsOptions | undefined =
            config.assertionOptions?.restrictPackageImports;
        const configurationViolations: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getConfigurationViolations(
            projectNames,
            options
        );
        if (configurationViolations.length > 0) {
            return configurationViolations;
        }
        if (!options) {
            return [];
        }
        const ignoredProjects: string[] = config.assertionOptions?.ignoredProjects ?? [];
        return RestrictPackageImportsUtil.getRuleViolations(projectNames, assertionData, options, ignoredProjects);
    }
};
