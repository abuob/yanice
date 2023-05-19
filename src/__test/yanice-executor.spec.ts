import { expect } from 'chai';
import { YaniceExecutor } from '../yanice-executor';
import validYaniceJson1 from '../__fixtures/valid-1.yanice.json';
import validYaniceJson4 from '../__fixtures/valid-4.yanice.json';
import validReadmeYaniceJson from '../__fixtures/readme-example-yanice.json';
import { YaniceJsonType } from '../phase-1-config/config/config.interface';

describe('YaniceExecutor', () => {
    let yaniceExecutor: YaniceExecutor;
    const baseDirectory = process.cwd();
    const yaniceJson1: YaniceJsonType = validYaniceJson1 as any;
    const yaniceJson4: YaniceJsonType = validYaniceJson4 as any;
    const readmeYaniceJson: YaniceJsonType = validReadmeYaniceJson as any;

    describe('some changed projects', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = ['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'];
        });

        it('should calculate all changed projects correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--rev=HEAD', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .calculateChangedProjects();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        });

        it('should calculate all affected projects correctly when including unsupported commands', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=false'],
                    baseDirectory,
                    yaniceJson1
                )
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
                .loadConfigAndParseArgs(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
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
                .loadConfigAndParseArgs(['d-depends-on-a', '--rev=HEAD', '--outputOnly=true'], baseDirectory, yaniceJson1)
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
                .loadConfigAndParseArgs(['lint', '--all', '--outputOnly=true'], baseDirectory, yaniceJson1)
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
                .loadConfigAndParseArgs(
                    ['lint', '--all', '--outputOnly=false', '--includeCommandSupportedOnly=false'],
                    baseDirectory,
                    yaniceJson1
                )
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
                .loadConfigAndParseArgs(
                    ['lint', '--all', '--outputOnly=true', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
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
                .loadConfigAndParseArgs(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
            // D must be before B/C (topologically sorted):
            expect((yaniceExecutor as any).affectedProjects[0]).to.equal('D');
        });

        it('should calculate responsibles correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(
                    ['lint', '--rev=HEAD', '--responsibles', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .calculateResponsibles()
                .filterOutUnsupportedProjectsIfNeeded();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'E']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice', 'Bob', 'Edith']);
        });
    });

    describe('some changed projects', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = ['path/to/dir/A/some-A-file', 'path/to/dir/D/some-D-file'];
        });

        it('should detect directly changed projects correctly', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice', 'David']);
        });
    });

    describe('one single project changed', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
            (yaniceExecutor as any).changedFiles = ['path/to/dir/D/some-D-file'];
        });

        it('should calculate affected projects for a simple scope properly when just one project changed', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['lint', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members([]);
            expect((yaniceExecutor as any).responsibles).to.have.same.ordered.members(['David']);
        });

        it('should calculate affected projects for a scope with some dependencies properly when just one project changed', () => {
            yaniceExecutor
                .loadConfigAndParseArgs(['test', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .calculateChangedProjects()
                .calculateDepGraphForGivenScope()
                .verifyDepGraphValidity()
                .calculateAffectedProjectsUnfiltered()
                .filterOutUnsupportedProjectsIfNeeded()
                .calculateResponsibles();
            expect((yaniceExecutor as any).changedProjects).to.have.same.members(['D']);
            expect((yaniceExecutor as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);
            expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
            expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice', 'Bob', 'Clara', 'David']);
        });
    });

    describe('for valid-4.yanice.json', () => {
        describe('scope-1', () => {
            it('should handle changes in project A for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['A/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['A']);
            });
            it('should handle changes in project B for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['B/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['B']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['B', 'A']);
            });
            it('should handle changes in project C for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['C/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['C']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['C', 'B', 'A']);
            });
        });
        describe('scope-2', () => {
            it('should handle changes in project A for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['A/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
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
                    .loadConfigAndParseArgs(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['B']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['B', 'A']);
            });
            it('should handle changes in project C for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                (yaniceExecutor4 as any).changedFiles = ['C/some.file'];
                yaniceExecutor4
                    .loadConfigAndParseArgs(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
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
                    .loadConfigAndParseArgs(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutor4 as any).changedProjects).to.have.same.members(['D']);
                expect((yaniceExecutor4 as any).affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);
                expect((yaniceExecutor4 as any).affectedProjects).to.have.same.ordered.members(['D', 'B', 'A']);
            });
        });
    });

    describe('readmeYaniceJson', () => {
        describe('test-scope', () => {
            it('should test all projects in topologically ordering', () => {
                const yaniceExecutorReadme = new YaniceExecutor();
                (yaniceExecutorReadme as any).changedFiles = ['yanice.json'];
                yaniceExecutorReadme
                    .loadConfigAndParseArgs(['test', '--rev=HEAD'], baseDirectory, readmeYaniceJson)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutorReadme as any).changedProjects).to.have.same.members(['important-repo-files']);
                expect((yaniceExecutorReadme as any).affectedProjectsUnfiltered).to.have.same.members([
                    'project-A',
                    'project-B',
                    'lib-1',
                    'lib-2',
                    'important-repo-files'
                ]);
                expect((yaniceExecutorReadme as any).affectedProjects).to.have.same.ordered.members(['lib-1', 'project-A']);
            });
            it('should test project-A and lib-1 if lib-1 has changed', () => {
                const yaniceExecutorReadme = new YaniceExecutor();
                (yaniceExecutorReadme as any).changedFiles = ['libs/lib-1/some.file'];
                yaniceExecutorReadme
                    .loadConfigAndParseArgs(['test', '--rev=HEAD'], baseDirectory, readmeYaniceJson)
                    .calculateChangedProjects()
                    .calculateDepGraphForGivenScope()
                    .verifyDepGraphValidity()
                    .calculateAffectedProjectsUnfiltered()
                    .filterOutUnsupportedProjectsIfNeeded()
                    .calculateResponsibles();
                expect((yaniceExecutorReadme as any).changedProjects).to.have.same.members(['lib-1']);
                expect((yaniceExecutorReadme as any).affectedProjectsUnfiltered).to.have.same.members(['project-A', 'lib-1']);
                expect((yaniceExecutorReadme as any).affectedProjects).to.have.same.ordered.members(['lib-1', 'project-A']);
            });
        });
    });
});
