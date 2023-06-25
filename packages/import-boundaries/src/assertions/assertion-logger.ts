import { LogUtil } from 'yanice';

import { YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';

export class AssertionLogger {
    public static logAssertionViolations(violations: YaniceImportBoundariesAssertionViolation[]): void {
        violations.forEach((violation: YaniceImportBoundariesAssertionViolation) => AssertionLogger.logAssertionViolation(violation));
    }

    private static logAssertionViolation(violation: YaniceImportBoundariesAssertionViolation): void {
        switch (violation.type) {
            case 'unknown-import':
                AssertionLogger.logInFile(violation.filePath, violation.withinProject);
                LogUtil.log(`    Unknown import: ${violation.importStatement}`);
                return;
            case 'import-not-configured':
                AssertionLogger.logInFile(violation.filePath, violation.withinProject);
                LogUtil.log(`    Import to project "${violation.actualProject}" which is not configured in yanice.json:`);
                LogUtil.log(`        ${violation.importStatement}`);
                return;
            case 'configured-import-unused':
                LogUtil.log(`For project "${violation.withinProject}":`);
                LogUtil.log(`    Imports to "${violation.unusedProject}" are allowed and configured but do not exist`);
                return;
        }
    }
    private static logInFile(filePath: string, project: string): void {
        LogUtil.log(`${filePath} (project: ${project}):`);
    }
}
