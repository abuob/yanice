import { expect } from 'chai';

import { AssertionViolationConfiguredImportUnused } from '../../../../api/assertion.interface';
import { UseAllDeclaredDependenciesUtil } from '../use-all-declared-dependencies.util';

describe('UseAllDeclaredDependenciesUtil', () => {
    describe('getRuleViolations', () => {
        it('should return an empty array if there are no rule violations', () => {
            const requiredDependenciesMap: Record<string, string[]> = {
                A: ['B', 'C'],
                B: ['C'],
                C: []
            };
            const projectDependencyGraph: Record<string, string[]> = {
                A: ['B', 'C'],
                B: ['C'],
                C: []
            };
            const ignoredProjects: string[] = [];
            const actual: AssertionViolationConfiguredImportUnused[] = UseAllDeclaredDependenciesUtil.getRuleViolations(
                requiredDependenciesMap,
                projectDependencyGraph,
                ignoredProjects
            );
            expect(actual).to.have.length(0);
        });

        it('should return an empty array if there are rule violations but only in ignored projects', () => {
            const requiredDependenciesMap: Record<string, string[]> = {
                A: ['B', 'C'],
                B: ['C'],
                C: []
            };
            const projectDependencyGraph: Record<string, string[]> = {
                A: ['C'], // 'B' is declared but unused, 'A' is ignored
                B: ['C'],
                C: []
            };
            const ignoredProjects: string[] = ['A'];
            const actual: AssertionViolationConfiguredImportUnused[] = UseAllDeclaredDependenciesUtil.getRuleViolations(
                requiredDependenciesMap,
                projectDependencyGraph,
                ignoredProjects
            );
            expect(actual).to.have.length(0);
        });

        it('should return rule violations', () => {
            const requiredDependenciesMap: Record<string, string[]> = {
                A: ['B', 'C'],
                B: ['C'],
                C: []
            };
            const projectDependencyGraph: Record<string, string[]> = {
                A: ['C'], // 'B' is declared but unused
                B: ['C'],
                C: []
            };
            const ignoredProjects: string[] = [];
            const actual: AssertionViolationConfiguredImportUnused[] = UseAllDeclaredDependenciesUtil.getRuleViolations(
                requiredDependenciesMap,
                projectDependencyGraph,
                ignoredProjects
            );
            const expectedViolation: AssertionViolationConfiguredImportUnused = {
                type: 'configured-import-unused',
                unusedProject: 'B',
                withinProject: 'A'
            };
            expect(actual).to.deep.equal([expectedViolation]);
        });

        it('should consider ignoredProjects', () => {
            const requiredDependenciesMap: Record<string, string[]> = {
                A: ['B', 'C', 'IGNORED'],
                B: ['C'],
                C: [],
                IGNORED: ['C']
            };
            const projectDependencyGraph: Record<string, string[]> = {
                A: ['C'], // 'B' is declared but unused
                B: ['C'],
                C: []
            };
            const ignoredProjects: string[] = ['IGNORED'];
            const actual: AssertionViolationConfiguredImportUnused[] = UseAllDeclaredDependenciesUtil.getRuleViolations(
                requiredDependenciesMap,
                projectDependencyGraph,
                ignoredProjects
            );
            const expectedViolation: AssertionViolationConfiguredImportUnused = {
                type: 'configured-import-unused',
                unusedProject: 'B',
                withinProject: 'A'
            };
            expect(actual).to.deep.equal([expectedViolation]);
        });
    });
});
