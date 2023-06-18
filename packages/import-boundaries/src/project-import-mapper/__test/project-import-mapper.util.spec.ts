import { expect } from 'chai';
import { YaniceProject } from 'yanice';

import { ProjectImportMap } from '../../api/project-import-map.interface';
import { ProjectImportMapperUtil } from '../project-import-mapper.util';

describe('ProjectImportMapperUtil', () => {
    describe('createProjectImportMap', () => {
        const defaultYaniceProject: YaniceProject = {
            projectName: 'default',
            pathGlob: '**',
            pathRegExp: /.*/,
            responsibles: [],
            commands: {}
        };
        const yaniceProjects: YaniceProject[] = [
            { ...defaultYaniceProject, projectName: 'A', pathGlob: 'proj/A/**' },
            { ...defaultYaniceProject, projectName: 'B', pathGlob: 'proj/B/**' },
            { ...defaultYaniceProject, projectName: 'C', pathGlob: 'proj/C/**' }
        ];

        it('should create a project-import-map when all files can be properly matched', () => {
            const importMap: Record<string, string[]> = {
                'proj/A/some.file': ['proj/B/some.file', 'proj/C/some.file'],
                'proj/B/some.file': ['proj/C/some.file']
            };
            const actual: ProjectImportMap = ProjectImportMapperUtil.createProjectImportMap(yaniceProjects, importMap);
            const expected: ProjectImportMap = {
                A: {
                    'proj/A/some.file': {
                        resolvedImports: {
                            B: ['proj/B/some.file'],
                            C: ['proj/C/some.file']
                        },
                        unknownImports: []
                    }
                },
                B: {
                    'proj/B/some.file': {
                        resolvedImports: {
                            C: ['proj/C/some.file']
                        },
                        unknownImports: []
                    }
                }
            };
            expect(actual).to.deep.equal(expected);
        });

        it('should create a project-import-map when unknown imports are present which cannot be mapped to any project', () => {
            const importMap: Record<string, string[]> = {
                'proj/A/some.file': ['proj/B/some.file', 'this-does-not-match-anything'],
                'proj/B/some.file': ['proj/B/some.file', 'this-does-not-match-anything'] // cycle, does not make much sense, but valid here!
            };
            const actual: ProjectImportMap = ProjectImportMapperUtil.createProjectImportMap(yaniceProjects, importMap);
            const expected: ProjectImportMap = {
                A: {
                    'proj/A/some.file': {
                        resolvedImports: {
                            B: ['proj/B/some.file']
                        },
                        unknownImports: ['this-does-not-match-anything']
                    }
                },
                B: {
                    'proj/B/some.file': {
                        resolvedImports: {
                            B: ['proj/B/some.file']
                        },
                        unknownImports: ['this-does-not-match-anything']
                    }
                }
            };
            expect(actual).to.deep.equal(expected);
        });
    });
});
