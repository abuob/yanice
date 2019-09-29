import { ArgsParser } from '../args-parser'
import { expect } from 'chai';

describe('ArgsParser', () => {
    describe('parseArgs', () => {
        it('should parse valid arguments correctly', () => {
            const actualArgs1 = ArgsParser.parseArgs(["lint", "--branch=origin/develop", "--includeUncommitted=true"]);
            const actualArgs2 = ArgsParser.parseArgs(["test", "--branch=master", "--includeUncommitted=false"]);
            const actualArgs3 = ArgsParser.parseArgs(["build", "--commit=1234567"]);
            const actualArgs4 = ArgsParser.parseArgs(["build", "--all"]);
            expect(actualArgs1).to.deep.equal({
                givenScope: 'lint',
                diffTarget: {
                    branch: 'origin/develop',
                    commit: null
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: false,
                outputOnly: false
            });
            expect(actualArgs2).to.deep.equal({
                givenScope: 'test',
                diffTarget: {
                    branch: 'master',
                    commit: null
                },
                includeUncommitted: false,
                includeAllProjects: false,
                includeCommandSupportedOnly: false,
                outputOnly: false
            });
            expect(actualArgs3).to.deep.equal({
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: '1234567'
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: false,
                outputOnly: false
            });
            expect(actualArgs4).to.deep.equal({
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: null,
                },
                includeUncommitted: true,
                includeAllProjects: true,
                includeCommandSupportedOnly: false,
                outputOnly: false
            });
        });
    });
});
