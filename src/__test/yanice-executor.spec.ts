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
        });

        it('should calculate all changed projects correctly', () => {
            yaniceExecutor
                .executePhase1(['lint', '--rev=HEAD', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();
            const changedProjects: string[] | undefined = yaniceExecutor.phase3Result?.changedProjects;
            expect(changedProjects).to.have.length(3);
            expect(changedProjects).to.have.same.members(['A', 'B', 'E']);
        });

        it('should calculate all affected projects correctly when including unsupported commands', () => {
            yaniceExecutor
                .executePhase1(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=false'],
                    baseDirectory,
                    yaniceJson1
                )
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });

        it('should calculate all affected projects correctly when not including unsupported commands', () => {
            yaniceExecutor
                .executePhase1(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['B', 'C', 'D']);
        });

        it('should calculate affected projects correctly before filtering', () => {
            yaniceExecutor
                .executePhase1(['d-depends-on-a', '--rev=HEAD', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(4);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(0);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members([]);
        });

        it('should set affectedProjects to all projects when --all parameter is given', () => {
            yaniceExecutor
                .executePhase1(['lint', '--all', '--outputOnly=true'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should filter unsupported commands when --all and outputOnly=false even when includeCommandSupportedOnly=true', () => {
            yaniceExecutor
                .executePhase1(['lint', '--all', '--outputOnly=false', '--includeCommandSupportedOnly=false'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should set affectedProjects to all projects that support the given scope when --all parameter is given', () => {
            yaniceExecutor
                .executePhase1(['lint', '--all', '--outputOnly=true', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should filter out projects according to parameters', () => {
            yaniceExecutor
                .executePhase1(
                    ['test', '--rev=HEAD', '--outputOnly=true', '--includeCommandSupportedOnly=true'],
                    baseDirectory,
                    yaniceJson1
                )
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/B/some-B-file', 'path/to/dir/E/some-E-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'B', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D', 'E']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['B', 'C', 'D']);
            // D must be before B/C (topologically sorted):
            expect(yaniceExecutor.phase3Result?.affectedProjects[0]).to.equal('D');
        });
    });

    describe('some changed projects', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
        });

        it('should detect directly changed projects correctly', () => {
            yaniceExecutor
                .executePhase1(['lint', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/A/some-A-file', 'path/to/dir/D/some-D-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(2);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['A', 'D']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(2);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'D']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(1);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['A']);
        });
    });

    describe('one single project changed', () => {
        beforeEach(() => {
            yaniceExecutor = new YaniceExecutor();
        });

        it('should calculate affected projects for a simple scope properly when just one project changed', () => {
            yaniceExecutor
                .executePhase1(['lint', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/D/some-D-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(1);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['D']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(1);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['D']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(0);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members([]);
        });

        it('should calculate affected projects for a scope with some dependencies properly when just one project changed', () => {
            yaniceExecutor
                .executePhase1(['test', '--rev=HEAD'], baseDirectory, yaniceJson1)
                .skipPhase2ForTests(['path/to/dir/D/some-D-file'])
                .executePhase3();

            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.length(1);
            expect(yaniceExecutor.phase3Result?.changedProjects).to.have.same.members(['D']);

            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.length(4);
            expect(yaniceExecutor.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);

            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.length(3);
            expect(yaniceExecutor.phase3Result?.affectedProjects).to.have.same.members(['B', 'C', 'D']);
        });
    });

    describe('for valid-4.yanice.json', () => {
        describe('scope-1', () => {
            it('should handle changes in project A for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['A/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['A']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.members(['A']);
            });
            it('should handle changes in project B for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['B/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['B']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(2);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(2);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['B', 'A']);
            });
            it('should handle changes in project C for scope-1 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-1', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['C/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['C']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(3);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(3);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['C', 'B', 'A']);
            });
        });
        describe('scope-2', () => {
            it('should handle changes in project A for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['A/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['A']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['A']);
            });
            it('should handle changes in project B for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['B/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['B']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(2);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(2);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['B', 'A']);
            });
            it('should handle changes in project C for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['C/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['C']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(2);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'C']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['A']);
            });
            it('should handle changes in project D for scope-2 correctly', () => {
                const yaniceExecutor4 = new YaniceExecutor();
                yaniceExecutor4
                    .executePhase1(['scope-2', '--rev=HEAD'], baseDirectory, yaniceJson4)
                    .skipPhase2ForTests(['D/some.file'])
                    .executePhase3();

                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutor4.phase3Result?.changedProjects).to.have.same.members(['D']);

                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.length(4);
                expect(yaniceExecutor4.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['A', 'B', 'C', 'D']);

                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.length(3);
                expect(yaniceExecutor4.phase3Result?.affectedProjects).to.have.same.ordered.members(['D', 'B', 'A']);
            });
        });
    });

    describe('readmeYaniceJson', () => {
        describe('test-scope', () => {
            it('should test all projects in topologically ordering', () => {
                const yaniceExecutorReadme = new YaniceExecutor();
                yaniceExecutorReadme
                    .executePhase1(['test', '--rev=HEAD'], baseDirectory, readmeYaniceJson)
                    .skipPhase2ForTests(['yanice.json'])
                    .executePhase3();

                expect(yaniceExecutorReadme.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutorReadme.phase3Result?.changedProjects).to.have.same.members(['important-repo-files']);

                expect(yaniceExecutorReadme.phase3Result?.affectedProjectsUnfiltered).to.have.length(5);
                expect(yaniceExecutorReadme.phase3Result?.affectedProjectsUnfiltered).to.have.same.members([
                    'project-A',
                    'project-B',
                    'lib-1',
                    'lib-2',
                    'important-repo-files'
                ]);

                expect(yaniceExecutorReadme.phase3Result?.affectedProjects).to.have.length(2);
                expect(yaniceExecutorReadme.phase3Result?.affectedProjects).to.have.same.ordered.members(['lib-1', 'project-A']);
            });
            it('should test project-A and lib-1 if lib-1 has changed', () => {
                const yaniceExecutorReadme = new YaniceExecutor();
                yaniceExecutorReadme
                    .executePhase1(['test', '--rev=HEAD'], baseDirectory, readmeYaniceJson)
                    .skipPhase2ForTests(['libs/lib-1/some.file'])
                    .executePhase3();

                expect(yaniceExecutorReadme.phase3Result?.changedProjects).to.have.length(1);
                expect(yaniceExecutorReadme.phase3Result?.changedProjects).to.have.same.members(['lib-1']);

                expect(yaniceExecutorReadme.phase3Result?.affectedProjectsUnfiltered).to.have.length(2);
                expect(yaniceExecutorReadme.phase3Result?.affectedProjectsUnfiltered).to.have.same.members(['project-A', 'lib-1']);

                expect(yaniceExecutorReadme.phase3Result?.affectedProjects).to.have.length(2);
                expect(yaniceExecutorReadme.phase3Result?.affectedProjects).to.have.same.ordered.members(['lib-1', 'project-A']);
            });
        });
    });
});
