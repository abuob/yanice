import { expect } from 'chai';
import { YaniceExecutor } from '../yanice-executor';
import validYaniceJson1 from '../__fixtures/valid-1.yanice.json';
import validYaniceJson4 from '../__fixtures/valid-4.yanice.json';
import { IYaniceJson } from '../config/config.interface'

describe('YaniceExecutor', () => {
    let yaniceExecutor: YaniceExecutor;
    const baseDirectory = process.cwd();
    const yaniceJson1: IYaniceJson = validYaniceJson1 as any;
    const yaniceJson4: IYaniceJson = validYaniceJson4 as any;

    describe('some changed projects', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = [
                "path/to/dir/A/some-A-file",
                "path/to/dir/B/some-B-file",
                "path/to/dir/E/some-E-file",
            ];
        });

        it('should calculate all changed projects correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        });

        it('should calculate all affected projects correctly when including unsupported commands', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=false'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });

        it('should calculate all affected projects correctly when not including unsupported commands', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
        });

        it('should calculate affected projects correctly before filtering', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['d-depends-on-a', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'D', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members([]);
        });

        it('should set affectedProjects to all projects when --all parameter is given', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--outputOnly=true', '--all'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should filter unsupported commands when --all and outputOnly=false even when includeCommandSupportedOnly=true', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--outputOnly=false', '--includeCommandSupportedOnly=false', '--all'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should set affectedProjects to all projects that support the given scope when --all parameter is given', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--outputOnly=true', '--includeCommandSupportedOnly=true', '--all'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should filter out projects according to parameters', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
        });

        it('should calculate responsibles correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--responsibles', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice', 'Bob']);
        });
    });

    describe('some changed projects', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = [
                "path/to/dir/A/some-A-file",
                "path/to/dir/D/some-D-file",
            ];
        });

        it('should detect directly changed projects correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice']);
        });
    });

    describe('one single project changed', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = [
                "path/to/dir/D/some-D-file"
            ];
        });

        it('should calculate affected projects for a simple scope properly when just one project changed', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members([]);
            expect((yaniceExecutor as any).responsibles).to.have.same.members([]);
        });

        it('should calculate affected projects for a scope with some dependencies properly when just one project changed', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['test'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Bob', 'Clara', 'David']);
        });
    });

    describe('for valid-4.yanice.json', () => {
        describe('scope-1', () => {
            it('should handle changes in project A for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['A/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.members(['A']);
            });
            it('should handle changes in project B for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['B/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['B']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.members(['A', 'B']);
            });
            it('should handle changes in project C for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['C/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['C']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
            });
        });
        describe('scope-2', () => {
            it('should handle changes in project A for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['A/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.members(['A']);
            });
            it('should handle changes in project B for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['B/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['B']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['A', 'B']);
            });
            it('should handle changes in project C for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['C/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['C']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'C']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['A']);
            });
            it('should handle changes in project D for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['D/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['D']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['A', 'B', 'D']);
            });
        });
    });
});
