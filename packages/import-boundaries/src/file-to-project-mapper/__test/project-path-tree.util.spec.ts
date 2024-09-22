import { expect } from 'chai';

import { ProjectFolderTreeNode, ProjectFolderTreeUtil } from '../project-folder-tree.util';

describe('ProjectPathTreeUtil', () => {
    describe('create tree', () => {
        describe('createProjectFolderDecisionTree', () => {
            it('should create the project-path-tree for a given set of projectPaths', () => {
                const result: ProjectFolderTreeNode = ProjectFolderTreeUtil.createProjectFolderDecisionTree({
                    A: 'path/to/a',
                    B: 'path/to/b',
                    C: 'some-path/c',
                    PATH: 'path',
                    ROOT: '.'
                });
                const expectedResult: ProjectFolderTreeNode = {
                    projects: ['ROOT'],
                    paths: {
                        path: {
                            paths: {
                                to: {
                                    paths: {
                                        a: {
                                            paths: {},
                                            projects: ['A']
                                        },
                                        b: {
                                            paths: {},
                                            projects: ['B']
                                        }
                                    },
                                    projects: []
                                }
                            },
                            projects: ['PATH']
                        },
                        'some-path': {
                            paths: {
                                c: {
                                    paths: {},
                                    projects: ['C']
                                }
                            },
                            projects: []
                        }
                    }
                };
                expect(result).to.deep.equal(expectedResult);
            });
        });
    });

    describe('consume tree', () => {
        const givenProjectFolderTree: ProjectFolderTreeNode = {
            projects: ['ROOT'],
            paths: {
                path: {
                    paths: {
                        to: {
                            paths: {
                                a: {
                                    paths: {},
                                    projects: ['A']
                                },
                                b: {
                                    paths: {},
                                    projects: ['B']
                                }
                            },
                            projects: []
                        }
                    },
                    projects: ['PATH']
                },
                'some-path': {
                    paths: {
                        c: {
                            paths: {},
                            projects: ['C']
                        }
                    },
                    projects: []
                }
            }
        };

        describe('getProjectsOfGivenPath', () => {
            const testData: Record<string, string[]> = {
                'path/to/a/some-file.txt': ['ROOT', 'PATH', 'A'],
                'some-file.txt': ['ROOT'],
                'path/something/else.txt': ['ROOT', 'PATH'],
                'path/to/b/some-file': ['ROOT', 'PATH', 'B'],
                'not/tracked/at/all': ['ROOT'],

                // these inputs aren't valid (directories), just to make sure it doesn't crash
                'path/to/a': ['ROOT', 'PATH'],
                'path/to/a/': ['ROOT', 'PATH'],
                '': [],
                '.': [],
                './': []
            };

            Object.keys(testData).forEach((filePath: string): void => {
                it(`should calculate the correct projects for given file path "${filePath}"`, () => {
                    const result: string[] = ProjectFolderTreeUtil.getProjectsOfGivenPath(filePath, givenProjectFolderTree);
                    expect(result).to.deep.equal(testData[filePath]);
                    expect(result).to.have.length(testData[filePath]?.length ?? -1);
                });
            });
        });

        describe('isPartOfProject', () => {
            function isPartOfProject(filePath: string, projectName: string, projectPathTree: ProjectFolderTreeNode): boolean {
                const splitPath: string[] = ProjectFolderTreeUtil.splitPath(filePath);
                return ProjectFolderTreeUtil.isPartOfProject(splitPath, projectName, projectPathTree);
            }

            it('should return true for projects that the file is part of', () => {
                expect(isPartOfProject('path/to/a/some-file.txt', 'ROOT', givenProjectFolderTree)).to.equal(true);
                expect(isPartOfProject('path/to/a/some-file.txt', 'PATH', givenProjectFolderTree)).to.equal(true);
                expect(isPartOfProject('path/to/a/some-file.txt', 'A', givenProjectFolderTree)).to.equal(true);

                expect(isPartOfProject('some-file.txt', 'ROOT', givenProjectFolderTree)).to.equal(true);

                expect(isPartOfProject('path/something/else.txt', 'ROOT', givenProjectFolderTree)).to.equal(true);
                expect(isPartOfProject('path/something/else.txt', 'PATH', givenProjectFolderTree)).to.equal(true);

                expect(isPartOfProject('path/to/b/some-file', 'ROOT', givenProjectFolderTree)).to.equal(true);
                expect(isPartOfProject('path/to/b/some-file', 'PATH', givenProjectFolderTree)).to.equal(true);
                expect(isPartOfProject('path/to/b/some-file', 'B', givenProjectFolderTree)).to.equal(true);
            });

            it('should return false for projects that the file is not part of', () => {
                expect(isPartOfProject('path/to/a/some-file.txt', 'B', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('path/to/a/some-file.txt', 'C', givenProjectFolderTree)).to.equal(false);

                expect(isPartOfProject('some-file.txt', 'PATH', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('some-file.txt', 'A', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('some-file.txt', 'B', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('some-file.txt', 'C', givenProjectFolderTree)).to.equal(false);

                expect(isPartOfProject('path/to/b/some-file', 'A', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('path/to/b/some-file', 'C', givenProjectFolderTree)).to.equal(false);
            });

            it('should return false for projects which do not exist', () => {
                expect(isPartOfProject('path/to/a/some-file.txt', 'DOES-NOT-EXIST', givenProjectFolderTree)).to.equal(false);
                expect(isPartOfProject('some-file.txt', 'DOES-NOT-EXIST', givenProjectFolderTree)).to.equal(false);
            });
        });

        describe('getProjectsToFilePathsMap', () => {
            it('should create a map from projects to file-paths', () => {
                const filePaths: string[] = [
                    'path/to/a/some-file.txt',
                    'some-file.txt',
                    'path/something/else.txt',
                    'path/to/b/some-file',
                    'not/tracked/at/all'
                ];

                const expectedResult: Record<string, string[]> = {
                    A: ['path/to/a/some-file.txt'],
                    B: ['path/to/b/some-file'],
                    C: [],
                    PATH: ['path/to/a/some-file.txt', 'path/something/else.txt', 'path/to/b/some-file'],
                    ROOT: [
                        'path/to/a/some-file.txt',
                        'some-file.txt',
                        'path/something/else.txt',
                        'path/to/b/some-file',
                        'not/tracked/at/all'
                    ]
                };

                const result: Record<string, string[] | undefined> = ProjectFolderTreeUtil.getProjectToFilePathsMap(
                    filePaths,
                    ['A', 'B', 'C', 'ROOT', 'PATH'],
                    givenProjectFolderTree
                );
                expect(result).to.deep.equal(expectedResult);
            });
        });
    });

    describe('splitPath', () => {
        it('should split a relative file-path into its individual parts', () => {
            expect(ProjectFolderTreeUtil.splitPath('some/path/to/somewhere')).to.deep.equal(['some', 'path', 'to', 'somewhere']);
            expect(ProjectFolderTreeUtil.splitPath('path/to/stuff')).to.deep.equal(['path', 'to', 'stuff']);
        });
        it('should return empty array when relative path points to current directory', () => {
            expect(ProjectFolderTreeUtil.splitPath('.')).to.deep.equal([]);
            expect(ProjectFolderTreeUtil.splitPath('./')).to.deep.equal([]);
        });
    });
});
