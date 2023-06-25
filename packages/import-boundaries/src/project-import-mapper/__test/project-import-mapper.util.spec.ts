import { expect } from 'chai';
import { YaniceProject } from 'yanice';

import { EnrichedFileImportMap } from '../../api/enriched-file-import-map.interface';
import { FileImportMap, ParsedImportStatement } from '../../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../../api/project-import-map.interface';
import { ProjectImportMapperUtil } from '../project-import-mapper.util';

describe('ProjectImportMapperUtil', () => {
    describe('createProjectImportByFilesMap', () => {
        const defaultYaniceProject: YaniceProject = {
            projectName: 'default',
            pathGlob: '**',
            pathRegExp: /.*/,
            responsibles: [],
            commands: {}
        };
        const defaultImportmap: FileImportMap = {
            absoluteFilePath: 'TO-BE-OVERWRITTEN',
            skippedImports: [],
            resolvedPackageImports: [],
            unknownImports: [],
            resolvedImports: [],
            createdBy: 'test'
        };
        const defaultParsedImportStatement: ParsedImportStatement = {
            type: 'relative',
            raw: 'import stuff from "./some/where"',
            fromClause: './some/where'
        };
        const yaniceProjects: YaniceProject[] = [
            { ...defaultYaniceProject, projectName: 'A', pathGlob: 'proj/A/**' },
            { ...defaultYaniceProject, projectName: 'B', pathGlob: 'proj/B/**' },
            { ...defaultYaniceProject, projectName: 'C', pathGlob: 'proj/C/**' }
        ];

        it('should create a project-import-map when all files can be properly matched', () => {
            const fileImportMaps: FileImportMap[] = [
                {
                    ...defaultImportmap,
                    absoluteFilePath: 'root/yanice/dir/proj/A/some.file',
                    resolvedImports: [
                        {
                            parsedImportStatement: defaultParsedImportStatement,
                            resolvedAbsoluteFilePath: 'root/yanice/dir/proj/B/some.file'
                        },
                        {
                            parsedImportStatement: defaultParsedImportStatement,
                            resolvedAbsoluteFilePath: 'root/yanice/dir/proj/A/some.file'
                        }
                    ]
                },
                {
                    ...defaultImportmap,
                    absoluteFilePath: 'root/yanice/dir/proj/B/some.file',
                    resolvedImports: [
                        {
                            parsedImportStatement: defaultParsedImportStatement,
                            resolvedAbsoluteFilePath: 'root/yanice/dir/proj/C/some.file'
                        }
                    ],
                    resolvedPackageImports: ['some-package'],
                    unknownImports: [{ type: 'relative', fromClause: 'somewhere', raw: 'import stuff from "somewhere"' }]
                }
            ];
            const actual: ProjectImportByFilesMap = ProjectImportMapperUtil.createProjectImportByFilesMap(
                fileImportMaps,
                'root/yanice/dir',
                yaniceProjects
            );
            const expected: ProjectImportByFilesMap = {
                A: [
                    {
                        createdByResolver: 'test',
                        filePath: 'proj/A/some.file',
                        resolvedImports: [
                            {
                                filePath: 'proj/B/some.file',
                                importStatement: 'import stuff from "./some/where"',
                                projects: ['B']
                            },
                            {
                                filePath: 'proj/A/some.file',
                                importStatement: 'import stuff from "./some/where"',
                                projects: ['A']
                            }
                        ],
                        resolvedPackageImports: [],
                        skippedImports: [],
                        unknownImports: []
                    }
                ],
                B: [
                    {
                        createdByResolver: 'test',
                        filePath: 'proj/B/some.file',
                        resolvedImports: [
                            {
                                filePath: 'proj/C/some.file',
                                importStatement: 'import stuff from "./some/where"',
                                projects: ['C']
                            }
                        ],
                        resolvedPackageImports: ['some-package'],
                        skippedImports: [],
                        unknownImports: ['import stuff from "somewhere"']
                    }
                ]
            };
            expect(actual).to.deep.equal(expected);
        });

        it('should create a project-import-map when unknown imports are present which cannot be mapped to any project', () => {
            const fileImportMaps: FileImportMap[] = [
                {
                    ...defaultImportmap,
                    absoluteFilePath: 'root/yanice/dir/proj/A/some.file',
                    resolvedImports: [
                        {
                            parsedImportStatement: defaultParsedImportStatement,
                            resolvedAbsoluteFilePath: 'root/yanice/dir/this-does-not-match-anything'
                        }
                    ]
                }
            ];
            const actual: ProjectImportByFilesMap = ProjectImportMapperUtil.createProjectImportByFilesMap(
                fileImportMaps,
                'root/yanice/dir',
                yaniceProjects
            );
            const expected: ProjectImportByFilesMap = {
                A: [
                    {
                        createdByResolver: 'test',
                        filePath: 'proj/A/some.file',
                        resolvedImports: [
                            {
                                filePath: 'this-does-not-match-anything',
                                importStatement: 'import stuff from "./some/where"',
                                projects: []
                            }
                        ],
                        resolvedPackageImports: [],
                        skippedImports: [],
                        unknownImports: []
                    }
                ]
            };
            expect(actual).to.deep.equal(expected);
        });
    });

    describe('createYaniceDependenciesImportMap', () => {
        function createEnrichedFileImportMap(importedProjects: string[][]): EnrichedFileImportMap {
            return {
                createdByResolver: 'test',
                filePath: 'filePath',
                resolvedImports: importedProjects.map((importedProject: string[]): EnrichedFileImportMap['resolvedImports'][number] => {
                    return {
                        importStatement: 'importStatement',
                        projects: importedProject,
                        filePath: 'filePath'
                    };
                }),
                unknownImports: [],
                resolvedPackageImports: [],
                skippedImports: []
            };
        }

        it('should create the dependency-map used in the yanice.json', () => {
            const projectImportByFilesMap: ProjectImportByFilesMap = {
                A: [createEnrichedFileImportMap([['A'], ['A', 'B']]), createEnrichedFileImportMap([['B'], ['C']])],
                B: [createEnrichedFileImportMap([['C', 'B']]), createEnrichedFileImportMap([['B']])],
                C: [createEnrichedFileImportMap([['D', 'C']])],
                D: [createEnrichedFileImportMap([])]
            };
            const expected: Record<string, string[]> = {
                A: ['B', 'C'],
                B: ['C'],
                C: ['D'],
                D: []
            };
            const actual: Record<string, string[] | undefined> =
                ProjectImportMapperUtil.createYaniceDependenciesImportMap(projectImportByFilesMap);
            expect(actual).to.deep.equal(expected);
        });
    });
});
