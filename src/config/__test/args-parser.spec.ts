import { ArgsParser, IYaniceArgs } from '../args-parser'
import { expect } from 'chai';

describe('ArgsParser', () => {
    describe('parseArgs', () => {
        it('should parse valid arguments correctly', () => {
            const actualArgs1 = ArgsParser.parseArgs(["lint", "--branch=master", "--includeUncommitted=true"]);
            const actualArgs2 = ArgsParser.parseArgs(["test", "--branch=master", "--includeUncommitted=false", "--concurrency=123"]);
            const actualArgs3 = ArgsParser.parseArgs(["build", "--commit=1234567", "--concurrency=3"]);
            const actualArgs4 = ArgsParser.parseArgs(["build", "--all", "--responsibles"]);
            const actualArgs5 = ArgsParser.parseArgs(["lint", "--branch=master", "--include-uncommitted", "--output-only"]);
            const actualArgs6 = ArgsParser.parseArgs(["lint", "--branch=master", "--outputOnly=false"]);
            const actualArgs7 = ArgsParser.parseArgs(["lint", "--rev=HEAD~1"]);

            const args: IYaniceArgs = {
                givenScope: 'lint',
                diffTarget: {
                    branch: 'master',
                    commit: null,
                    rev: null
                },
                includeUncommitted: true,
                includeAllProjects: false,
                includeCommandSupportedOnly: true,
                outputOnly: false,
                outputResponsibles: false,
                concurrency: 1
            };

            expect(actualArgs1).to.deep.equal({
                ...args,
                includeUncommitted: true
            });
            expect(actualArgs2).to.deep.equal({
                ...args,
                givenScope: 'test',
                concurrency: 123,
                includeUncommitted: false
            });
            expect(actualArgs3).to.deep.equal({
                ...args,
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: '1234567',
                    rev: null
                },
                concurrency: 3
            });
            expect(actualArgs4).to.deep.equal({
                ...args,
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: null,
                    rev: null
                },
                includeAllProjects: true,
                includeCommandSupportedOnly: true,
                outputResponsibles: true,
                concurrency: 1
            });
            expect(actualArgs5).to.deep.equal({
                ...args,
                includeCommandSupportedOnly: true,
                outputOnly: true
            });
            expect(actualArgs6).to.deep.equal({
                ...args
            });
            expect(actualArgs7).to.deep.equal({
                ...args,
                diffTarget: {
                    branch: null,
                    commit: null,
                    rev: 'HEAD~1'
                }
            });
        });
    });
});
