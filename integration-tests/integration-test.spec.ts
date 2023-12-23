import path from 'node:path';

import { expect } from 'chai';

import type { ImportBoundaryAssertionData } from '../packages/import-boundaries/src/api/import-boundary-assertion-data';
import { fixtureFileToProjectsMap } from './fixtures/fixture-file-to-projects.map';
import { fixtureFileImportMapWithoutDummyResolver, fixtureImportResolutionsMap } from './fixtures/fixture-import-resolutions.map';
import { fixtureProjectDependencyGraph } from './fixtures/fixture-project-dependency.graph';
import { IntegrationTestUtil } from './test-utils/integration-test.util';

describe('yanice', () => {
    beforeEach(() => {
        IntegrationTestUtil.assertCleanFiles();
    });

    afterEach(() => {
        IntegrationTestUtil.resetChanges();
    });

    describe('bad input', () => {
        it('should exit non-zero and print a warning when first parameter is bad', async () => {
            const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync('totally-invalid');
            expect(commandResult.statusCode).to.equal(1);
            const output = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
            expect(output).to.deep.equal(IntegrationTestUtil.getTextFixtureContent('fixture-bad-input.txt'));
        });
    });

    describe('output-only', () => {
        it('should be able to read its config file and print out all project files for a given scope', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                'output-only flat-all-projects-have-commands --all --rev=HEAD'
            );
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(3);
            expect(printedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should only print projects command for given scope', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('output-only flat-projects-one-command --all --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(1);
            expect(printedProjects).to.have.same.members(['A']);
        });

        it('should print the changed project and all its dependents', () => {
            IntegrationTestUtil.touchProject('project-B');
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('output-only a-depends-on-b --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['A', 'B']);
            IntegrationTestUtil.resetChanges();
        });

        it('should print the listed responsibles for the changed project and all its dependents with the --responsibles parameter', () => {
            IntegrationTestUtil.touchProject('project-B');
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('output-only a-depends-on-b --responsibles --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['Alice', 'Bob']);
            IntegrationTestUtil.resetChanges();
        });
    });

    describe('run', () => {
        it('should execute all commands', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('run flat-all-projects-have-commands --all --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
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

        it('should execute commands of the changed projects and its dependents', () => {
            IntegrationTestUtil.touchProject('project-B');

            const output: string = IntegrationTestUtil.executeYaniceWithArgs('run a-depends-on-b --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
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
            it('it can start a plugin', () => {
                const output: string = IntegrationTestUtil.executeYaniceWithArgs('plugin:dummy-plugin a-depends-on-b --rev=HEAD');
                const outputLines: string[] = IntegrationTestUtil.getNonEmptyLines(output);
                expect(outputLines).to.have.length(2);
                expect(outputLines).to.have.same.members(['[DUMMY-PLUGIN] triggered', path.join(__dirname, 'test-project')]);
            });
        });
        describe('officially supported', () => {
            describe('import-boundaries', () => {
                it('should be able to print the file-import-maps', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --print-file-imports --skip-post-resolvers'
                    );
                    const outputObject = JSON.parse(output.trim());
                    expect(outputObject).to.deep.equal(fixtureImportResolutionsMap);
                });

                it('should be able to print the file-import-maps also when running post-resolvers', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --print-file-imports'
                    );
                    const outputObject = JSON.parse(output.trim());
                    expect(outputObject).to.deep.equal(fixtureFileImportMapWithoutDummyResolver);
                });

                it('should be able to print the project-map', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --print-assertion-data --skip-post-resolvers'
                    );
                    const outputObject = JSON.parse(output.trim());
                    const expected: ImportBoundaryAssertionData = {
                        fileToProjectsMap: fixtureFileToProjectsMap,
                        importResolutionsMap: fixtureImportResolutionsMap,
                        projectDependencyGraph: fixtureProjectDependencyGraph
                    };
                    expect(outputObject).to.deep.equal(expected);
                });

                it('should be able to print the import-dependency-map for the yanice.json', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --generate --skip-post-resolvers'
                    );
                    const outputObject = JSON.parse(output.trim());
                    expect(outputObject).to.deep.equal(fixtureProjectDependencyGraph);
                });

                it('should be able to detect if there are too many imports', async () => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --assert'
                    );
                    const output = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
                    expect(commandResult.statusCode).to.equal(1);
                    const expected: string = IntegrationTestUtil.getTextFixtureContent('fixture-assertion-error-too-many-imports.txt');
                    expect(output).to.include(expected);
                });

                it('should be able to print import-boundary-violations', async () => {
                    const commandResult = await IntegrationTestUtil.executeYaniceWithArgsAsync(
                        'plugin:import-boundaries a-depends-on-b --assert'
                    );
                    const output = IntegrationTestUtil.normalizeTextOutput(commandResult.stdout);
                    expect(commandResult.statusCode).to.equal(1);
                    const expected: string = IntegrationTestUtil.getTextFixtureContent('fixture-assertion-error-bad-imports.txt');
                    expect(output).to.include(expected);
                    // counting occurrences of ".ts:" is not ideal; we want to count the amount of violations in the output:
                    const amountOfImportBoundaryViolations: number = output.match(/\.ts:/g)?.length ?? 0;
                    expect(amountOfImportBoundaryViolations).to.equal(1);
                });
            });
        });
    });
});
