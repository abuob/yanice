import { expect } from 'chai';

import { YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { FileToImportResolutionsMap, ImportResolution, ImportResolutionResolvedImport } from '../../../api/import-resolver.interface';
import { ImportBoundaryUtil } from '../import-boundary.util';

describe('ImportBoundaryUtil', (): void => {
    describe('getRuleViolations', (): void => {
        it('should give back empty array if there are no rule violations', (): void => {
            const fileToProjectsMap: Record<string, string[]> = {
                'file-A': ['project-A'],
                'file-B': ['project-B']
            };
            const fileToImportResolutionsMap: FileToImportResolutionsMap = createImportResolutionsMap({
                'file-A': ['file-B'],
                'file-B': []
            });
            const allowedDependenciesMap: Record<string, string[]> = {
                'project-A': ['project-B'],
                'project-B': []
            };
            const expected: YaniceImportBoundariesAssertionViolation[] = [];
            const actual: YaniceImportBoundariesAssertionViolation[] = ImportBoundaryUtil.getRuleViolations(
                fileToProjectsMap,
                fileToImportResolutionsMap,
                allowedDependenciesMap,
                []
            );
            expect(actual).to.deep.equal(expected);
        });

        it('should catch a rule violation for a simple setup', (): void => {
            const fileToProjectsMap: Record<string, string[]> = {
                'file-A': ['project-A'],
                'file-B': ['project-B']
            };
            const fileToImportResolutionsMap: FileToImportResolutionsMap = createImportResolutionsMap({
                'file-A': ['file-B'],
                'file-B': []
            });
            const allowedDependenciesMap: Record<string, string[]> = {
                'project-A': [],
                'project-B': []
            };
            const expected: YaniceImportBoundariesAssertionViolation[] = [
                {
                    importedProject: 'project-B',
                    allowedProjects: [],
                    filePath: 'file-A',
                    importStatement: 'raw',
                    type: 'import-not-configured',
                    withinProject: 'project-A'
                }
            ];
            const actual: YaniceImportBoundariesAssertionViolation[] = ImportBoundaryUtil.getRuleViolations(
                fileToProjectsMap,
                fileToImportResolutionsMap,
                allowedDependenciesMap,
                []
            );
            expect(actual).to.deep.equal(expected);
        });

        it('should return empty array if there is a rule violation caused by an ignored project', (): void => {
            const fileToProjectsMap: Record<string, string[]> = {
                'file-A': ['project-A'],
                'file-B': ['project-B']
            };
            const fileToImportResolutionsMap: FileToImportResolutionsMap = createImportResolutionsMap({
                'file-A': ['file-B'],
                'file-B': []
            });
            const allowedDependenciesMap: Record<string, string[]> = {
                'project-A': [],
                'project-B': []
            };

            const actual: YaniceImportBoundariesAssertionViolation[] = ImportBoundaryUtil.getRuleViolations(
                fileToProjectsMap,
                fileToImportResolutionsMap,
                allowedDependenciesMap,
                ['project-A']
            );
            expect(actual).to.have.length(0);
        });

        it('should catch rule violations', (): void => {
            const fileToProjectsMap: Record<string, string[]> = {
                'file-A': ['project-A'],
                'file-B': ['project-B'],
                'file-C': ['project-C'],
                'file-D': ['project-D']
            };
            const fileToImportResolutionsMap: FileToImportResolutionsMap = createImportResolutionsMap({
                'file-A': ['file-B', 'file-C'],
                'file-B': ['file-C'],
                'file-C': ['file-D'],
                'file-D': ['file-A']
            });
            const allowedDependenciesMap: Record<string, string[]> = {
                'project-A': ['project-B'],
                'project-B': ['project-C'],
                'project-C': ['project-D'],
                'project-D': []
            };
            const expected: YaniceImportBoundariesAssertionViolation[] = [
                {
                    importedProject: 'project-C',
                    allowedProjects: ['project-B'],
                    filePath: 'file-A',
                    importStatement: 'raw',
                    type: 'import-not-configured',
                    withinProject: 'project-A'
                },
                {
                    importedProject: 'project-A',
                    allowedProjects: [],
                    filePath: 'file-D',
                    importStatement: 'raw',
                    type: 'import-not-configured',
                    withinProject: 'project-D'
                }
            ];
            const actual: YaniceImportBoundariesAssertionViolation[] = ImportBoundaryUtil.getRuleViolations(
                fileToProjectsMap,
                fileToImportResolutionsMap,
                allowedDependenciesMap,
                []
            );
            expect(actual).to.deep.equal(expected);
        });
    });
});

function createImportResolutionsMap(simpleImportMap: Record<string, string[]>): FileToImportResolutionsMap {
    const emptyImportResolution: ImportResolution = {
        createdBy: 'createdBy',
        resolvedImports: [],
        resolvedPackageImports: [],
        unknownImports: []
    };
    const result: FileToImportResolutionsMap = {};
    Object.keys(simpleImportMap).forEach((file: string): void => {
        const importedFiles: string[] = simpleImportMap[file] ?? [];
        result[file] = {
            skippedImports: [],
            importResolutions: [
                {
                    ...emptyImportResolution,
                    resolvedImports: importedFiles.map((importedFile: string): ImportResolutionResolvedImport => {
                        return {
                            parsedImportStatement: {
                                type: 'relative',
                                fromClause: 'fromClause',
                                raw: 'raw'
                            },
                            resolvedAbsoluteFilePath: importedFile
                        };
                    })
                }
            ]
        };
    });
    return result;
}
