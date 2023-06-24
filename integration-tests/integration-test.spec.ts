import path from 'node:path';

import { expect } from 'chai';

import { fixtureFileImportMap } from './fixtures/fixture.file-import-map';
import { fixtureProjectImportByFilesMap } from './fixtures/fixture.project-import-by-files-map';
import { IntegrationTestUtil } from './test-utils/integration-test.util';

describe('yanice', () => {
    beforeEach(() => {
        IntegrationTestUtil.assertCleanFiles();
    });

    afterEach(() => {
        IntegrationTestUtil.resetChanges();
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
                it('should be able to print the normalized import-map provided by the importResolver', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --rev=HEAD --print-file-imports'
                    );
                    const outputObject = JSON.parse(output.trim());
                    expect(outputObject).to.deep.equal(fixtureFileImportMap);
                });

                it('should be able to print the project-map', () => {
                    const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                        'plugin:import-boundaries a-depends-on-b --rev=HEAD --print-project-imports'
                    );
                    const outputObject = JSON.parse(output.trim());
                    expect(outputObject).to.deep.equal(fixtureProjectImportByFilesMap);
                });
            });
        });
    });
});
