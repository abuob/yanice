import { expect } from 'chai';

import { AssertionViolationNoCircularImportsCycleViolation, CycleViolationNode } from '../../../../api/assertion.interface';
import { FileToImportResolutionsMap, ImportResolution, ImportResolutionResolvedImport } from '../../../../api/import-resolver.interface';
import { FileImportGraph } from '../file-import-graph';

describe('FileImportGraph', () => {
    describe('getCycles', () => {
        describe('no cycles', () => {
            it('it should return empty array if there are no cycles (single file)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': []
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                expect(actual).to.deep.equal([]);
            });

            it('it should return empty array if there are no cycles (three files)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-B'],
                    'file-B': ['file-C'],
                    'file-C': []
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                expect(actual).to.deep.equal([]);
            });

            it('it should not throw when an unknown file is imported somewhere', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-B'],
                    'file-B': ['file-C'],
                    'file-C': ['file-NOT-KNOWN']
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                expect(actual).to.deep.equal([]);
            });
        });

        describe('with cycles', () => {
            it('should return the cycle (single file referencing itself)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-A']
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                const expected: AssertionViolationNoCircularImportsCycleViolation[] = [createCycleViolation([['file-A', 'file-A']])];
                expect(actual).to.have.length(1);
                expect(actual).to.deep.equal(expected);
            });

            it('should return the cycle (single cycle, three files)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-B'],
                    'file-B': ['file-C'],
                    'file-C': ['file-A']
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                const expected: AssertionViolationNoCircularImportsCycleViolation[] = [
                    createCycleViolation([
                        ['file-A', 'file-B'],
                        ['file-B', 'file-C'],
                        ['file-C', 'file-A']
                    ])
                ];
                expect(actual).to.have.length(1);
                expect(actual).to.deep.equal(expected);
            });

            it('should return all cycles (two cycle, two files each, independent)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-B'],
                    'file-B': ['file-A'],
                    'file-C': ['file-D'],
                    'file-D': ['file-C']
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                const expected: AssertionViolationNoCircularImportsCycleViolation[] = [
                    createCycleViolation([
                        ['file-A', 'file-B'],
                        ['file-B', 'file-A']
                    ]),
                    createCycleViolation([
                        ['file-C', 'file-D'],
                        ['file-D', 'file-C']
                    ])
                ];
                expect(actual).to.have.length(2);
                expect(actual).to.deep.equal(expected);
            });

            it('should return all cycles (single cycle, y-shaped dependencies)', () => {
                const fileToImportResolutionsMap = createFileToImportResolutionsMap({
                    'file-A': ['file-B'],
                    'file-B': ['file-C', 'file-D'],
                    'file-C': [],
                    'file-D': ['file-A']
                });
                const actual = FileImportGraph.createFileImportGraph(fileToImportResolutionsMap).getCycles();
                const expected: AssertionViolationNoCircularImportsCycleViolation[] = [
                    createCycleViolation([
                        ['file-A', 'file-B'],
                        ['file-B', 'file-D'],
                        ['file-D', 'file-A']
                    ])
                ];
                expect(actual).to.have.length(1);
                expect(actual).to.deep.equal(expected);
            });
        });
    });
});

function createFileToImportResolutionsMap(fileToImportedFilePaths: Record<string, string[]>): FileToImportResolutionsMap {
    const emptyImportResolution: ImportResolution = {
        createdBy: 'irrelevant-for-test',
        unknownImports: [],
        resolvedPackageImports: [],
        resolvedImports: []
    };
    return Object.keys(fileToImportedFilePaths).reduce((prev: FileToImportResolutionsMap, curr: string): FileToImportResolutionsMap => {
        const resolvedRelativeImports: ImportResolutionResolvedImport[] | undefined = fileToImportedFilePaths[curr]?.map(
            (importedPath: string): ImportResolutionResolvedImport => {
                return {
                    resolvedAbsoluteFilePath: importedPath,
                    parsedImportStatement: {
                        type: 'relative',
                        raw: `import {something} from "./${importedPath}"`,
                        fromClause: `"./${importedPath}"`
                    }
                };
            }
        );

        return {
            ...prev,
            [curr]: {
                importResolutions: [
                    {
                        ...emptyImportResolution,
                        resolvedImports: resolvedRelativeImports ?? []
                    }
                ],
                skippedImports: []
            }
        };
    }, {});
}

function createCycleViolation(cycle: [string, string][]): AssertionViolationNoCircularImportsCycleViolation {
    return {
        cycle: cycle.map(([file, importedFile]: [string, string]): CycleViolationNode => {
            return {
                absoluteFilePath: file,
                importStatement: `import {something} from "./${importedFile}"`
            };
        }),
        type: 'no-circular-imports::cycle-violation'
    };
}
