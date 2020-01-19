import { ArgsParser } from '../args-parser'
import { expect } from 'chai';

describe('ArgsParser', () => {
    describe('parseArgs', () => {
        it('should parse valid arguments correctly', () => {
            const actualArgs1 = ArgsParser.parseArgs(["lint", "--branch=origin/develop", "--includeUncommitted=true"]);
            const actualArgs2 = ArgsParser.parseArgs(["test", "--branch=master", "--includeUncommitted=false", "--concurrency=123"]);
            const actualArgs3 = ArgsParser.parseArgs(["build", "--commit=1234567", "--concurrency=3"]);
            const actualArgs4 = ArgsParser.parseArgs(["build", "--all", "--responsibles"]);
            const actualArgs5 = ArgsParser.parseArgs(["lint", "--branch=origin/develop", "--include-uncommitted", "--output-only"]);
            const actualArgs6 = ArgsParser.parseArgs(["lint", "--branch=origin/develop", "--outputOnly=false"]);

            expect(actualArgs1).to.deep.equal({
                givenScope: 'lint',
                diffTarget: {
                    branch: 'origin/develop',
                    commit: null
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: false,
                concurrency: 1
            });
            expect(actualArgs2).to.deep.equal({
                givenScope: 'test',
                diffTarget: {
                    branch: 'master',
                    commit: null
                },
                includeUncommitted: false,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: false,
                concurrency: 123
            });
            expect(actualArgs3).to.deep.equal({
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: '1234567'
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: false,
                concurrency: 3
            });
            expect(actualArgs4).to.deep.equal({
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: null,
                },
                includeUncommitted: true,
                includeAllProjects: true,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: true,
                concurrency: 1
            });
            expect(actualArgs5).to.deep.equal({
                givenScope: 'lint',
                diffTarget: {
                    branch: 'origin/develop',
                    commit: null
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: true,
                outputResponsibles: false,
                concurrency: 1
            });
            expect(actualArgs6).to.deep.equal({
                givenScope: 'lint',
                diffTarget: {
                    branch: 'origin/develop',
                    commit: null
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: false,
                concurrency: 1
            });
        });
    });
});
