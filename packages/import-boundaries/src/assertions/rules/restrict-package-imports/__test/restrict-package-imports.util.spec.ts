import { expect } from 'chai';
import type { YanicePluginImportBoundariesRestrictPackageImportsOptions } from 'yanice';

import type { YaniceImportBoundariesAssertionViolation } from '../../../../api/assertion.interface';
import type { ImportBoundaryAssertionData } from '../../../../api/import-boundary-assertion-data';
import type {
    FileToImportResolutionsMap,
    ImportResolution,
    ImportResolutionResolvedPackageImport
} from '../../../../api/import-resolver.interface';
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

    describe('getRuleViolations', (): void => {
        describe('simple cases (1:1 file-to-project relationships)', () => {
            const projectNames: string[] = ['a', 'b', 'c'];
            const fileToProjectsMap: Record<string, string[]> = {
                'file-a': ['a'],
                'file-b': ['b'],
                'file-c': ['c']
            };
            const fileToImportResolutionsMap: FileToImportResolutionsMap = createFileToImportResolutionsMap({
                'file-a': ['package-A1', 'package-A2'],
                'file-b': ['package-B1', 'package-B2'],
                'file-c': ['package-C1', 'package-C2']
            });
            const assertionData: ImportBoundaryAssertionData = {
                fileToProjectsMap,
                fileToImportResolutionsMap,
                projectDependencyGraph: {}
            };

            describe('blocklist', (): void => {
                it('should not return any violation if all package-imports are allowed', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            allowByDefault: []
                        },
                        blockConfiguration: {
                            blockByDefault: ['package-A1', 'package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2'],
                            exceptions: {
                                a: ['package-A1', 'package-A2'],
                                b: ['package-B1', 'package-B2'],
                                c: ['package-C1', 'package-C2']
                            }
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    expect(result).to.deep.equal([]);
                });

                it('should not return an "all packages must be listed" error if a package is not handled but the corresponding flag is set to false', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        // flag is set to false
                        allPackagesMustBeListed: false,
                        allowConfiguration: {
                            allowByDefault: []
                        },
                        blockConfiguration: {
                            // "package-A1" is not explicitly listed
                            blockByDefault: ['package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2'],
                            exceptions: {
                                a: ['package-A2'],
                                b: ['package-B1', 'package-B2'],
                                c: ['package-C1', 'package-C2']
                            }
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    expect(result).to.deep.equal([]);
                });

                it('should return an "all packages must be listed" error if a package is not handled and the corresponding flag is set to true', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        // flag is set to true
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            allowByDefault: []
                        },
                        blockConfiguration: {
                            // "package-A1" is not explicitly listed
                            blockByDefault: ['package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2'],
                            exceptions: {
                                a: ['package-A2'],
                                b: ['package-B1', 'package-B2'],
                                c: ['package-C1', 'package-C2']
                            }
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    const expected: YaniceImportBoundariesAssertionViolation[] = [
                        {
                            filePath: 'file-a',
                            importStatement: "import { something } from 'package-A1'",
                            type: 'restrict-package-import::all-packages-must-be-listed',
                            withinProject: 'a'
                        }
                    ];
                    expect(result).to.deep.equal(expected);
                });

                it('should return an import-violation if a blocked package is imported', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            allowByDefault: []
                        },
                        blockConfiguration: {
                            blockByDefault: ['package-A1', 'package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2'],
                            exceptions: {
                                // "package-A1" is not allowed
                                a: ['package-A2'],
                                b: ['package-B1', 'package-B2'],
                                c: ['package-C1', 'package-C2']
                            }
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    const expected: YaniceImportBoundariesAssertionViolation[] = [
                        {
                            filePath: 'file-a',
                            importStatement: "import { something } from 'package-A1'",
                            type: 'restrict-package-import::blocked-package',
                            withinProject: 'a'
                        }
                    ];
                    expect(result).to.deep.equal(expected);
                });
            });

            describe('allowlist', (): void => {
                it('should not return any violation if all package-imports are allowed', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            allowByDefault: ['package-A1', 'package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2']
                        },
                        blockConfiguration: {
                            blockByDefault: []
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    expect(result).to.deep.equal([]);
                });

                it('should not return an "all packages must be listed" error if a package is not handled but the corresponding flag is set to false', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        // flag is set to false
                        allPackagesMustBeListed: false,
                        allowConfiguration: {
                            // "package-A1" is not explicitly listed
                            allowByDefault: ['package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2']
                        },
                        blockConfiguration: {
                            blockByDefault: []
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    expect(result).to.deep.equal([]);
                });

                it('should return an "all packages must be listed" error if a package is not handled and the corresponding flag is set to true', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        // flag is set to true
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            // "package-A1" is not explicitly listed
                            allowByDefault: ['package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2']
                        },
                        blockConfiguration: {
                            blockByDefault: []
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    const expected: YaniceImportBoundariesAssertionViolation[] = [
                        {
                            filePath: 'file-a',
                            importStatement: "import { something } from 'package-A1'",
                            type: 'restrict-package-import::all-packages-must-be-listed',
                            withinProject: 'a'
                        }
                    ];
                    expect(result).to.deep.equal(expected);
                });

                it('should return an import-violation if an allowed package is imported in a project which has it listed as exception', (): void => {
                    const options: YanicePluginImportBoundariesRestrictPackageImportsOptions = {
                        allPackagesMustBeListed: true,
                        allowConfiguration: {
                            allowByDefault: ['package-A1', 'package-A2', 'package-B1', 'package-B2', 'package-C1', 'package-C2'],
                            exceptions: {
                                // "package-A1" is not allowed
                                a: ['package-A1']
                            }
                        },
                        blockConfiguration: {
                            blockByDefault: []
                        }
                    };

                    const result: YaniceImportBoundariesAssertionViolation[] = RestrictPackageImportsUtil.getRuleViolations(
                        projectNames,
                        assertionData,
                        options,
                        []
                    );
                    const expected: YaniceImportBoundariesAssertionViolation[] = [
                        {
                            filePath: 'file-a',
                            importStatement: "import { something } from 'package-A1'",
                            type: 'restrict-package-import::blocked-package',
                            withinProject: 'a'
                        }
                    ];
                    expect(result).to.deep.equal(expected);
                });
            });
        });
    });
});

function createFileToImportResolutionsMap(fileToPackageImportsMap: Record<string, string[]>): FileToImportResolutionsMap {
    const emptyImportResolution: ImportResolution = {
        createdBy: 'irrelevant-for-test',
        unknownImports: [],
        resolvedPackageImports: [],
        resolvedImports: []
    };
    return Object.keys(fileToPackageImportsMap).reduce((prev: FileToImportResolutionsMap, curr: string): FileToImportResolutionsMap => {
        const resolvedPackageImports: ImportResolutionResolvedPackageImport[] | undefined = fileToPackageImportsMap[curr]?.map(
            (packageName: string): ImportResolutionResolvedPackageImport => {
                return {
                    package: packageName,
                    resolvedAbsoluteFilePath: 'irrelevant-for-test',
                    importStatement: `import { something } from '${packageName}'`
                };
            }
        );

        return {
            ...prev,
            [curr]: {
                importResolutions: [
                    {
                        ...emptyImportResolution,
                        resolvedPackageImports: resolvedPackageImports ?? []
                    }
                ],
                skippedImports: []
            }
        };
    }, {});
}
