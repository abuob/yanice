import { IntegrationTestUtil } from './integration-test.util';
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
});
