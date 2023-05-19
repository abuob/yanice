import { ArgsParser, YaniceArgs } from '../args-parser';
import { expect } from 'chai';

describe('ArgsParser', () => {
    describe('parseArgs', () => {
        it('should parse valid arguments correctly', () => {
            const actualArgs01 = ArgsParser.parseArgs(['lint', '--branch=master', '--includeUncommitted=true']);
            const actualArgs02 = ArgsParser.parseArgs(['test', '--branch=master', '--includeUncommitted=false', '--concurrency=123']);
            const actualArgs03 = ArgsParser.parseArgs(['build', '--commit=1234567', '--concurrency=3']);
            const actualArgs04 = ArgsParser.parseArgs(['build', '--all', '--responsibles']);
            const actualArgs05 = ArgsParser.parseArgs(['lint', '--branch=master', '--include-uncommitted', '--output-only']);
            const actualArgs06 = ArgsParser.parseArgs(['lint', '--branch=master', '--outputOnly=false']);
            const actualArgs07 = ArgsParser.parseArgs(['lint', '--rev=HEAD~1']);
            const actualArgs08 = ArgsParser.parseArgs(['lint', '--visualize', '--renderer=dagre', '--branch=master']);
            const actualArgs09 = ArgsParser.parseArgs(['lint', '--visualize', '--renderer=vizjs']);
            const actualArgs10 = ArgsParser.parseArgs(['lint', '--save-visualization', '--renderer=vizjs', '--branch=master']);
            const actualArgs11 = ArgsParser.parseArgs(['lint', '--branch=master', '--output-mode=append-at-end-on-error']);
            const actualArgs12 = ArgsParser.parseArgs(['lint', '--branch=master', '--output-mode=ignore']);

            const args: YaniceArgs = {
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
                visualizeDepGraph: false,
                saveDepGraphVisualization: false,
                graphRenderer: 'DAGREJS',
                commandOutputMode: null,
                concurrency: 1
            };

            expect(actualArgs01).to.deep.equal({
                ...args,
                includeUncommitted: true
            });
            expect(actualArgs02).to.deep.equal({
                ...args,
                givenScope: 'test',
                concurrency: 123,
                includeUncommitted: false
            });
            expect(actualArgs03).to.deep.equal({
                ...args,
                givenScope: 'build',
                diffTarget: {
                    branch: null,
                    commit: '1234567',
                    rev: null
                },
                concurrency: 3
            });
            expect(actualArgs04).to.deep.equal({
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
            expect(actualArgs05).to.deep.equal({
                ...args,
                includeCommandSupportedOnly: true,
                outputOnly: true
            });
            expect(actualArgs06).to.deep.equal({
                ...args
            });
            expect(actualArgs07).to.deep.equal({
                ...args,
                diffTarget: {
                    branch: null,
                    commit: null,
                    rev: 'HEAD~1'
                }
            });
            expect(actualArgs08).to.deep.equal({
                ...args,
                visualizeDepGraph: true
            });
            expect(actualArgs09).to.deep.equal({
                ...args,
                diffTarget: {
                    branch: null,
                    commit: null,
                    rev: null
                },
                visualizeDepGraph: true,
                graphRenderer: 'VIZJS'
            });
            expect(actualArgs10).to.deep.equal({
                ...args,
                saveDepGraphVisualization: true,
                graphRenderer: 'VIZJS'
            });
            expect(actualArgs11).to.deep.equal({
                ...args,
                commandOutputMode: 'append-at-end-on-error'
            });
            expect(actualArgs12).to.deep.equal({
                ...args,
                commandOutputMode: 'ignore'
            });
        });
    });
});
