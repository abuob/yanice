import type { Phase3Result, YanicePluginImportBoundariesOptions } from 'yanice';

import type { YaniceImportBoundariesAssertion, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { NoCircularImportUtil } from './no-circular-import.util';

export const noCircularImports: YaniceImportBoundariesAssertion = {
    assertBoundaries: async (
        _phase3Results: Phase3Result,
        _config: YanicePluginImportBoundariesOptions,
        assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        return NoCircularImportUtil.getImportCycleAssertionViolations(assertionData);
    }
};
