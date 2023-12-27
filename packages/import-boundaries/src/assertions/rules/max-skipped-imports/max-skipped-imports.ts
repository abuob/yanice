import { Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { MaxSkippedImportsUtil } from './max-skipped-imports.util';

export const maxSkippedImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        _phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        return MaxSkippedImportsUtil.getRuleViolations(config?.assertionOptions?.skippedImports, assertionData.fileToImportResolutionsMap);
    }
};
