import { LogUtil } from 'yanice';

import { YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';

export class AssertionLogger {
    public static logAssertionViolations(violations: YaniceImportBoundariesAssertionViolation[]): void {
        violations.forEach((violation: YaniceImportBoundariesAssertionViolation) => AssertionLogger.logAssertionViolation(violation));
    }

    private static logAssertionViolation(violation: YaniceImportBoundariesAssertionViolation): null {
        // the "return null" makes the compiler handle us all different violation.types here
        switch (violation.type) {
            case 'unknown-import':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(`    In project:        ${violation.withinProject}`);
                LogUtil.log(`    Unknown import:    ${violation.importStatement}\n`);
                return null;
            case 'import-not-configured':
                const allowedImports: string =
                    violation.allowedProjects.length === 0 ? '(none)' : `[${violation.allowedProjects.join(', ')}]`;
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(`    In project:        ${violation.withinProject}`);
                LogUtil.log(`    Import statement:  ${violation.importStatement}`);
                LogUtil.log(`    Allowed imports:   ${allowedImports}`);
                LogUtil.log(`    Actual import:     ${violation.importedProject}\n`);
                return null;
            case 'configured-import-unused':
                LogUtil.log(`Unused dependency for "${violation.withinProject}":`);
                LogUtil.log(
                    `    As per configuration, "${violation.withinProject}" depends on "${violation.unusedProject}", but no import to "${violation.unusedProject}" exists.`
                );
                LogUtil.log(`    Requirement due to rule: "use-all-declared-dependencies"\n`);
                return null;
            case 'skipped-imports:too-many':
                LogUtil.log(`Too many skipped imports:`);
                LogUtil.log(`    Found ${violation.actualAmount} skipped imports, maximum allowed amount is ${violation.maxAmount}\n`);
                return null;
            case 'skipped-imports:not-configured':
                LogUtil.log(`No configuration found for skipped imports:`);
                LogUtil.log(
                    `    In order to run assertions on skipped imports, please configure the corresponding options in the yanice.json\n`
                );
                return null;
            case 'skipped-imports:not-equals-configured':
                const expectedAmountWarning: string = `Expected ${violation.expectedAmount} skipped imports as per config, but found ${violation.actualAmount} instead.`;
                LogUtil.log(`Amount of skipped imports is not the configured amount:`);
                LogUtil.log(`    ${expectedAmountWarning}`);
                LogUtil.log(`    Did you add or remove an import-exclusion without changing the configured amount in the yanice.json?\n`);
                return null;
            case 'invalid-entrypoint:from-outside':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(
                    `    Invalid entrypoint for project "${violation.importedProject}" when imported to project "${violation.withinProject}":`
                );
                LogUtil.log(`    Expected entrypoints:  ${violation.expectedEntryPoints.join(', ')}`);
                LogUtil.log(`    Import statement:      ${violation.importStatement}`);
                return null;
            case 'invalid-entrypoint:from-same-project':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(
                    `    Import via entrypoint is not allowed from within same project, as this is often a source of cyclic dependencies.`
                );
                LogUtil.log(`    Project:               ${violation.withinProject}`);
                LogUtil.log(`    Import statement:      ${violation.importStatement}`);
                return null;
            case 'custom-assertion-violation':
                LogUtil.log(violation.message);
                return null;
        }
    }
}
