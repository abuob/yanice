import path from 'node:path';

import type { ImportBoundaryAssertionData } from '@yanice/import-boundaries';
import { expect } from 'chai';

import { fixtureFileImportMapWithoutDummyResolver, fixtureFileToImportResolutions } from './fixtures/fixture-file-to-import.resolutions';
import { fixtureFileToProjectsMap } from './fixtures/fixture-file-to-projects.map';
import { fixtureProjectDependencyGraph } from './fixtures/fixture-project-dependency.graph';
import { IntegrationTestUtil } from './test-utils/integration-test.util';

describe('yanice', (): void => {
    beforeEach((): void => {
        IntegrationTestUtil.assertCleanFiles();
    });

    afterEach((): void => {
        IntegrationTestUtil.resetChanges();
    });

    describe('bad input', () => {
        it('should exit non-zero and print a warning when first parameter is bad', async (): Promise<void> => {
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync('totally-invalid');
            expect(commandResult.statusCode).to.equal(1);
            expect(commandResult.stderr).to.equal(null);

            const output: string = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
            expect(output).to.deep.equal(IntegrationTestUtil.getTextFixtureContent('fixture-bad-input.txt'));
        });
    });

    describe('output-only', () => {
        it('should be able to read its config file and print out all project files for a given scope', async (): Promise<void> => {
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                'output-only flat-all-projects-have-commands --all --rev=HEAD'
            );
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(3);
            expect(printedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should only print projects command for given scope', async (): Promise<void> => {
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                'output-only flat-projects-one-command --all --rev=HEAD'
            );
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(1);
            expect(printedProjects).to.have.same.members(['A']);
        });

        it('should print the changed project and all its dependents', async (): Promise<void> => {
            IntegrationTestUtil.touchProject('project-B');
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync('output-only a-depends-on-b --rev=HEAD');
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['A', 'B']);
            IntegrationTestUtil.resetChanges();
        });

        it('should print the listed responsibles for the changed project and all its dependents with the --responsibles parameter', async (): Promise<void> => {
            IntegrationTestUtil.touchProject('project-B');
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                'output-only a-depends-on-b --responsibles --rev=HEAD'
            );
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['Alice', 'Bob']);
            IntegrationTestUtil.resetChanges();
        });
    });

    describe('run', () => {
        it('should execute all commands', async (): Promise<void> => {
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                'run flat-all-projects-have-commands --all --rev=HEAD'
            );
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(3);

            const entryForA = IntegrationTestUtil.getTestLogByProject('project-A');
            expect(entryForA).to.have.length(1);
            expect(entryForA[0].identifier).to.equal('flat-all-projects-have-commands');

            const entryForB = IntegrationTestUtil.getTestLogByProject('project-B');
            expect(entryForB).to.have.length(1);
            expect(entryForB[0].identifier).to.equal('flat-all-projects-have-commands');

            const entryForC = IntegrationTestUtil.getTestLogByProject('project-C');
            expect(entryForC).to.have.length(1);
            expect(entryForC[0].identifier).to.equal('flat-all-projects-have-commands');

            IntegrationTestUtil.resetChanges();
        });

        it('should execute commands of the changed projects and its dependents', async (): Promise<void> => {
            IntegrationTestUtil.touchProject('project-B');

            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync('run a-depends-on-b --rev=HEAD');
            expect(commandResult.stderr).to.equal(null);
            expect(commandResult.statusCode).to.equal(0);

            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
            expect(printedProjects).to.have.length(2);

            const entryForA = IntegrationTestUtil.getTestLogByProject('project-A');
            expect(entryForA).to.have.length(1);
            expect(entryForA[0].identifier).to.equal('a-depends-on-b');

            const entryForB = IntegrationTestUtil.getTestLogByProject('project-B');
            expect(entryForB).to.have.length(1);
            expect(entryForB[0].identifier).to.equal('a-depends-on-b');

            const entryForC = IntegrationTestUtil.getTestLogByProject('project-C');
            expect(entryForC).to.have.length(0);

            IntegrationTestUtil.resetChanges();
        });
    });

    describe('plugin', () => {
        describe('custom', () => {
            it('it can start a plugin', async (): Promise<void> => {
                const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync('plugin:dummy-plugin a-depends-on-b --rev=HEAD');
                expect(commandResult.stderr).to.equal(null);
                expect(commandResult.statusCode).to.equal(0);

                const outputLines: string[] = IntegrationTestUtil.getNonEmptyLines(commandResult.stdout);
                expect(outputLines).to.have.length(2);
                expect(outputLines).to.have.same.members(['[DUMMY-PLUGIN] triggered', path.join(__dirname, 'test-project')]);
            });
        });
        describe('officially supported', () => {
            describe('import-boundaries', () => {
                it('should be able to print the file-import-maps', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --print-file-imports --skip-post-resolvers'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(0);

                    const outputObject = JSON.parse(commandResult.stdout.trim());
                    expect(outputObject).to.deep.equal(fixtureFileToImportResolutions);
                });

                it('should be able to print the file-import-maps also when running post-resolvers', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --print-file-imports'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(0);

                    const outputObject = JSON.parse(commandResult.stdout.trim());
                    expect(outputObject).to.deep.equal(fixtureFileImportMapWithoutDummyResolver);
                });

                it('should be able to print the project-map', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --print-assertion-data --skip-post-resolvers'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(0);

                    const outputObject = JSON.parse(commandResult.stdout.trim());
                    const expected: ImportBoundaryAssertionData = {
                        fileToProjectsMap: fixtureFileToProjectsMap,
                        fileToImportResolutionsMap: fixtureFileToImportResolutions,
                        projectDependencyGraph: fixtureProjectDependencyGraph
                    };
                    expect(outputObject).to.deep.equal(expected);
                });

                it('should be able to print the import-dependency-map for the yanice.json', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --generate --skip-post-resolvers'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(0);

                    const outputObject = JSON.parse(commandResult.stdout.trim());
                    expect(outputObject).to.deep.equal(fixtureProjectDependencyGraph);
                });

                it('should be able to detect if there are too many imports', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --assert'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(1);

                    const output: string = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
                    const expected: string = IntegrationTestUtil.getTextFixtureContent('fixture-assertion-error-too-many-imports.txt');
                    expect(output).to.include(expected);
                });

                it('should be able to print import-boundary-violations', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --assert'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(1);

                    const output: string = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
                    const expected: string = IntegrationTestUtil.getTextFixtureContent('fixture-assertion-error-bad-imports.txt');
                    expect(output).to.include(expected);
                    const amountOfImportBoundaryViolations: number = IntegrationTestUtil.getAmountOfImportBoundaryViolations(output);
                    expect(amountOfImportBoundaryViolations).to.equal(1);
                });

                it('should report unused dependencies because of the "use-all-declared-dependencies"-rule', async (): Promise<void> => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries unused-dependencies-exist --assert'
                    );
                    expect(commandResult.stderr).to.equal(null);
                    expect(commandResult.statusCode).to.equal(1);

                    const output: string = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
                    const expected: string = IntegrationTestUtil.getTextFixtureContent('fixture-assertion-error-unused-dependency.txt');
                    expect(output).to.include(expected);
                    const amountOfImportBoundaryViolations: number = IntegrationTestUtil.getAmountOfImportBoundaryViolations(output);
                    expect(amountOfImportBoundaryViolations).to.equal(0);
                });
            });
        });
    });
});
