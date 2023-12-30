import { expect } from 'chai';

import { AssertionViolationInvalidEntrypoint } from '../../../../api/assertion.interface';
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
        'project-B/some/deep/illegal/path': ['project-B']
    };

    describe('getRuleViolations', (): void => {
        it('should return empty array if all entry-points are honored', (): void => {
            const projectToEntryPointsMap: Record<string, string[]> = {
                'project-A': ['project-A/index.ts'],
                'project-B': ['project-B/index.ts']
            };
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

            const actual: AssertionViolationInvalidEntrypoint[] = AccessViaEntrypointsUtil.getRuleViolations(
                '',
                projectToEntryPointsMap,
                fileToImportResolutionsMap,
                fileToProjectsMap,
                []
            );
            expect(actual).to.have.length(0);
        });

        it('should return violations if a project is imported but not via entrypoint', () => {
            const projectToEntryPointsMap: Record<string, string[]> = {
                'project-A': ['project-A/index.ts'],
                'project-B': ['project-B/index.ts']
            };
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

            const actual: AssertionViolationInvalidEntrypoint[] = AccessViaEntrypointsUtil.getRuleViolations(
                '',
                projectToEntryPointsMap,
                fileToImportResolutionsMap,
                fileToProjectsMap,
                []
            );
            const expectedViolation: AssertionViolationInvalidEntrypoint = {
                expectedEntryPoints: ['project-B/index.ts'],
                filePath: 'file-A',
                importStatement: 'raw',
                importedProject: 'project-B',
                type: 'invalid-entrypoint',
                withinProject: 'project-A'
            };
            expect(actual).to.deep.equal([expectedViolation]);
        });
    });
});
