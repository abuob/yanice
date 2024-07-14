import { LogUtil } from 'yanice';

import { CycleViolationNode, YaniceImportBoundariesAssertionViolation } from '../api/assertion.interface';

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
                LogUtil.log(`    Import statement:      ${violation.importStatement}\n`);
                return null;
            case 'invalid-entrypoint:from-same-project':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(
                    `    Import via entrypoint is not allowed from within same project, as this is often a source of cyclic dependencies.`
                );
                LogUtil.log(`    Project:               ${violation.withinProject}`);
                LogUtil.log(`    Import statement:      ${violation.importStatement}\n`);
                return null;
            case 'restrict-package-import::missing-config':
                LogUtil.log('restrict-package-import:');
                LogUtil.log(
                    '    This rule requires its assertionOptions to be configured, to know which package-imports are allowed and which not.\n'
                );
                return null;
            case 'restrict-package-import::invalid-configuration-keys':
                LogUtil.log('restrict-package-import:');
                LogUtil.log(`    For the exceptions of ${violation.list}, found key: "${violation.notAProjectName}"`);
                LogUtil.log('    All keys must be project-names, which does not seem to be the case here. Was this a typo?\n');
                return null;
            case 'restrict-package-import::all-packages-must-be-listed':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(
                    `    The option "allPackagesMustBeListed" for 'restrict-package-imports' is enabled, all package-imports must be allowed or blocked.`
                );
                LogUtil.log(`    The import "${violation.importStatement}" is neither allowed nor blocked.\n`);
                return null;
            case 'restrict-package-import::blocked-package':
                LogUtil.log(`${violation.filePath}:`);
                LogUtil.log(`    Within project:        ${violation.withinProject}`);
                LogUtil.log(`    Found blocked import:  ${violation.importStatement}\n`);
                return null;
            case 'no-circular-imports::cycle-violation':
                LogUtil.log(`Found illegal import cycle (length: ${violation.cycle.length}):`);
                violation.cycle.forEach((cycleNode: CycleViolationNode): void => {
                    LogUtil.log(`   ${cycleNode.absoluteFilePath}:`);
                    LogUtil.log(`      ${cycleNode.importStatement}`);
                });
                const firstElement: CycleViolationNode | undefined = violation.cycle[0];
                if (firstElement) {
                    LogUtil.log(`   ${firstElement.absoluteFilePath}\n`);
                }
                return null;
            case 'custom-assertion-violation':
                LogUtil.log(violation.message);
                return null;
        }
    }
}
