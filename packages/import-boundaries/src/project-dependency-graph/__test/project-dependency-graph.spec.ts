import { expect } from 'chai';

import { ImportResolutions, ParsedImportStatement } from '../../api/import-resolver.interface';
import { ProjectDependencyGraph } from '../project-dependency-graph';

describe('ProjectDependencyGraph', () => {
    describe('getImportedProjectsOfFile', () => {
        const defaultParsedImportStatement: ParsedImportStatement = {
            type: 'unknown',
            raw: 'raw'
        };
        const defaultResolvedImport: ImportResolutions['resolvedImports'][number] = {
            resolvedAbsoluteFilePath: 'some/path',
            parsedImportStatement: defaultParsedImportStatement
        };

        it('should return empty array when nothing matches', () => {
            expect(ProjectDependencyGraph.getImportedProjectsOfFile({}, [])).to.have.length(0);
            expect(ProjectDependencyGraph.getImportedProjectsOfFile({ a: ['b'] }, [])).to.have.length(0);
        });

        it('should return all projects which match the resolved imports', () => {
            const importResolution: ImportResolutions = {
                createdBy: 'createdBy',
                resolvedImports: [
                    { ...defaultResolvedImport, resolvedAbsoluteFilePath: 'a' },
                    { ...defaultResolvedImport, resolvedAbsoluteFilePath: 'b' },
                    { ...defaultResolvedImport, resolvedAbsoluteFilePath: 'd' },
                    { ...defaultResolvedImport, resolvedAbsoluteFilePath: 'some/path/matching/nothing' }
                ],
                resolvedPackageImports: [],
                skippedImports: [],
                unknownImports: []
            };
            const expected: string[] = ['b', 'c', 'some-project'];
            const actual: string[] = ProjectDependencyGraph.getImportedProjectsOfFile({ a: ['b', 'c'], d: ['b', 'some-project'] }, [
                importResolution
            ]);
            expect(actual).to.deep.equal(expected);
        });
    });
});
