import { expect } from 'chai';
import type { YanicePluginImportBoundariesRestrictPackageImportsOptions } from 'yanice';

import type { YaniceImportBoundariesAssertionViolation } from '../../../../api/assertion.interface';
import { RestrictPackageImportsUtil } from '../restrict-package-imports.util';

describe('RestrictPackageImportsUtil', (): void => {
    describe('getConfigurationViolations', (): void => {
        it('should return empty arrays if all keys are project-names', (): void => {
            const projectNames: string[] = ['a', 'b', 'c'];
            const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                allowConfiguration: {
                    allowByDefault: [],
                    exceptions: {
                        a: [],
                        b: []
                    }
                },
                blockConfiguration: {
                    blockByDefault: []
                }
            };
            const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getConfigurationViolations(
                projectNames,
                options
            );
            const expected: YaniceImportBoundariesAssertionViolation[] = [];
            expect(result).to.deep.equal(expected);
        });

        it('should return a missing-config-violation if no configuration is provided', (): void => {
            const projectNames: string[] = ['a', 'b', 'c'];
            const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getConfigurationViolations(
                projectNames,
                undefined
            );
            const expected: YaniceImportBoundariesAssertionViolation[] = [
                {
                    type: 'restrict-package-import::missing-config'
                }
            ];
            expect(result).to.deep.equal(expected);
        });

        it('should return offending exception-keys if the configuration contains exception-keys which are not project-names', (): void => {
            const projectNames: string[] = ['a', 'b', 'c'];
            const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                allowConfiguration: {
                    allowByDefault: [],
                    exceptions: {
                        a: [],
                        'this-does-not-exist': [],
                        'this-as-well': []
                    }
                },
                blockConfiguration: {
                    blockByDefault: [],
                    exceptions: {
                        something: []
                    }
                }
            };
            const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getConfigurationViolations(
                projectNames,
                options
            );
            const expected: YaniceImportBoundariesAssertionViolation[] = [
                {
                    type: 'restrict-package-import::invalid-configuration-keys',
                    list: 'allowlist',
                    notAProjectName: 'this-does-not-exist'
                },
                {
                    type: 'restrict-package-import::invalid-configuration-keys',
                    list: 'allowlist',
                    notAProjectName: 'this-as-well'
                },
                {
                    type: 'restrict-package-import::invalid-configuration-keys',
                    list: 'blocklist',
                    notAProjectName: 'something'
                }
            ];
            expect(result).to.deep.equal(expected);
        });
    });
});
