import type { Phase3Result, YanicePluginImportBoundariesNoCircularImportsOptions, YanicePluginImportBoundariesOptions } from 'yanice';

import type { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { NoCircularImportUtil } from './no-circular-import.util';

export const noCircularImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        _phase3Results: Phase3Result,
        config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const noCircularImportConfig: YanicePluginImportBoundariesNoCircularImportsOptions | null =
            config.assertionOptions?.noCircularImports ?? null;
        return NoCircularImportUtil.getImportCycleAssertionViolations(assertionData, noCircularImportConfig);
    }
};
