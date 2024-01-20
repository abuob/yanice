import { expect } from 'chai';

import {
    AssertionViolationInvalidEntrypoint,
    AssertionViolationInvalidEntrypointFromWithinSameProject,
    YaniceImportBoundariesAssertionViolation
} from '../../../../api/assertion.interface';
import { FileToImportResolutionsMap, ImportResolution, ParsedImportStatement } from '../../../../api/import-resolver.interface';
import { AccessViaEntrypointsUtil } from '../access-via-entrypoints.util';

describe('AccessViaEntrypointsUtil', (): void => {
    const dummyImportResolution: ImportResolution = {
        createdBy: 'createdBy',
        unknownImports: [],
        resolvedImports: [],
        resolvedPackageImports: []
    };
    const dummyParsedImportStatement: ParsedImportStatement = {
        type: 'relative',
        fromClause: 'fromClause',
        raw: 'raw'
    };

    const fileToProjectsMap: Record<string, string[]> = {
        'file-A': ['project-A'],
        'file-B': ['project-B'],
        'project-A/index.ts': ['project-A'],
        'project-B/index.ts': ['project-B'],
        'project-B/some/deep/illegal/path': ['project-B']
    };

    const projectToEntryPointsMap: Record<string, string[]> = {
        'project-A': ['project-A/index.ts'],
        'project-B': ['project-B/index.ts']
    };

    describe('getRuleViolations', (): void => {
        it('should return empty array if all entry-points are honored', (): void => {
            const fileToImportResolutionsMap: FileToImportResolutionsMap = {
                'file-A': {
                    skippedImports: [],
                    importResolutions: [
                        {
                            ...dummyImportResolution,
                            resolvedImports: [
                                {
                                    parsedImportStatement: dummyParsedImportStatement,
                                    resolvedAbsoluteFilePath: 'project-B/index.ts'
                                }
                            ]
                        }
                    ]
                },
                'file-B': {
                    skippedImports: [],
                    importResolutions: []
                }
            };

            const actual: YaniceImportBoundariesAssertionViolation[] = AccessViaEntrypointsUtil.getRuleViolations(
                '',
                projectToEntryPointsMap,
                fileToImportResolutionsMap,
                fileToProjectsMap,
                [],
                false
            );
            expect(actual).to.have.length(0);
        });

        it('should return violations if a project is imported but not via entrypoint', () => {
            const fileToImportResolutionsMap: FileToImportResolutionsMap = {
                'file-A': {
                    skippedImports: [],
                    importResolutions: [
                        {
                            ...dummyImportResolution,
                            resolvedImports: [
                                {
                                    parsedImportStatement: dummyParsedImportStatement,
                                    resolvedAbsoluteFilePath: 'project-B/some/deep/illegal/path'
                                }
                            ]
                        }
                    ]
                },
                'file-B': {
                    skippedImports: [],
                    importResolutions: []
                }
            };

            const actual: YaniceImportBoundariesAssertionViolation[] = AccessViaEntrypointsUtil.getRuleViolations(
                '',
                projectToEntryPointsMap,
                fileToImportResolutionsMap,
                fileToProjectsMap,
                [],
                false
            );
            const expectedViolation: AssertionViolationInvalidEntrypoint = {
                type: 'invalid-entrypoint:from-outside',
                expectedEntryPoints: ['project-B/index.ts'],
                filePath: 'file-A',
                importStatement: 'raw',
                importedProject: 'project-B',
                withinProject: 'project-A'
            };
            expect(actual).to.deep.equal([expectedViolation]);
        });

        describe('using entry-points from within same project', (): void => {
            const fileToImportResolutionsMap: FileToImportResolutionsMap = {
                'file-A': {
                    skippedImports: [],
                    importResolutions: [
                        {
                            ...dummyImportResolution,
                            resolvedImports: [
                                {
                                    parsedImportStatement: dummyParsedImportStatement,
                                    resolvedAbsoluteFilePath: 'project-A/index.ts'
                                }
                            ]
                        }
                    ]
                },
                'file-B': {
                    skippedImports: [],
                    importResolutions: []
                }
            };

            it('should return a violation if a project is imported via entrypoint but from within same project', (): void => {
                const actual: YaniceImportBoundariesAssertionViolation[] = AccessViaEntrypointsUtil.getRuleViolations(
                    '',
                    projectToEntryPointsMap,
                    fileToImportResolutionsMap,
                    fileToProjectsMap,
                    [],
                    false
                );
                const expectedViolation: AssertionViolationInvalidEntrypointFromWithinSameProject = {
                    filePath: 'file-A',
                    importStatement: 'raw',
                    type: 'invalid-entrypoint:from-same-project',
                    withinProject: 'project-A'
                };
                expect(actual).to.deep.equal([expectedViolation]);
            });

            it('should return no violation if a project is imported via entrypoint from within same project, but allowFlag is set', (): void => {
                const actual: YaniceImportBoundariesAssertionViolation[] = AccessViaEntrypointsUtil.getRuleViolations(
                    '',
                    projectToEntryPointsMap,
                    fileToImportResolutionsMap,
                    fileToProjectsMap,
                    [],
                    true
                );
                expect(actual).to.deep.equal([]);
            });
        });
    });
});
