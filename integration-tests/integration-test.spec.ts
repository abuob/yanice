import { IntegrationTestUtil } from './test-utils/integration-test.util';
import { expect } from 'chai';

describe('yanice', () => {
    beforeEach(() => {
        IntegrationTestUtil.assertCleanFiles();
    });

    describe('--all --output-only', () => {
        it('should be able to read its config file and print out all project files for a given scope', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs(
                'flat-all-projects-have-commands --all --output-only --rev=HEAD'
            );
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(3);
            expect(printedProjects).to.have.same.members(['A', 'B', 'C']);
        });

        it('should only print projects command for given scope', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('flat-projects-one-command --all --output-only --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(1);
            expect(printedProjects).to.have.same.members(['A']);
        });
    });

    describe('--output-only', () => {
        it('should print the changed project and all its dependents', () => {
            IntegrationTestUtil.touchProject('project-B');
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('a-depends-on-b --output-only --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['A', 'B']);
            IntegrationTestUtil.resetChanges();
        });
    });

    describe('--responsibles', () => {
        it('should print the listed responsibles for the changed project and all its dependents', () => {
            IntegrationTestUtil.touchProject('project-B');
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('a-depends-on-b --responsibles --rev=HEAD');
            const printedProjects: string[] = IntegrationTestUtil.getNonEmptyLines(output);
            expect(printedProjects).to.have.length(2);
            expect(printedProjects).to.have.same.members(['Alice', 'Bob']);
            IntegrationTestUtil.resetChanges();
        });
    });

    describe('execute', () => {
        it('should execute all commands', () => {
            const output: string = IntegrationTestUtil.executeYaniceWithArgs('flat-all-projects-have-commands --all --rev=HEAD');
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

            const output: string = IntegrationTestUtil.executeYaniceWithArgs('a-depends-on-b --rev=HEAD');
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
});
