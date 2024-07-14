import { AssertionViolationNoCircularImportsCycleViolation } from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { FileImportGraph } from './file-import-graph';

export class NoCircularImportUtil {
    public static getImportCycleAssertionViolations(
        assertionData: ImportBoundaryAssertionData
    ): AssertionViolationNoCircularImportsCycleViolation[] {
        return FileImportGraph.createFileImportGraph(assertionData.fileToImportResolutionsMap).getCycles();
    }
}
