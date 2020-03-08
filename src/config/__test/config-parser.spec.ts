import yaniceJson1 from '../../__fixtures/valid-2.yanice.json';
import yaniceJson2 from '../../__fixtures/valid-3.yanice.json';
import { ConfigParser } from '../config-parser'
import { expect } from 'chai';
import { DirectedGraphUtil } from '../../dep-graph/directed-graph'
import { IYaniceArgs } from '../args-parser'

describe('ConfigParser', () => {
    const args: IYaniceArgs = {
        givenScope: 'lint',
        diffTarget: {
            branch: null,
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
    }

    describe('getYaniceConfig', () => {
        it('should set the options to default values if none are specified', () => {
            const actualConfigForLint = ConfigParser.getYaniceConfig(yaniceJson1 as any, {...args, givenScope: 'lint'});
            expect(actualConfigForLint.options.outputFilters).to.have.same.members([]);
            expect(actualConfigForLint.options.commandOutput).to.equal('ignore');
            expect(actualConfigForLint.options.outputFolder).to.equal('./.yanice-output');
            expect(actualConfigForLint.options.port).to.equal(4567);
        });

        it('should override default options with global options when defined in yanice.json', () => {
            const actualConfigForBuild = ConfigParser.getYaniceConfig(yaniceJson2 as any, {...args, givenScope: 'build-some'});
            expect(actualConfigForBuild.options.outputFilters).to.have.same.members(['npmError']);
            expect(actualConfigForBuild.options.commandOutput).to.equal('append-at-end');
            expect(actualConfigForBuild.options.outputFolder).to.equal('./.yanice-graph-output');
            expect(actualConfigForBuild.options.port).to.equal(7777);
        });

        it('should override global options with options defined on scope-level', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(yaniceJson2 as any, {...args, givenScope: 'test'});
            expect(actualConfigForTest.options.commandOutput).to.equal('append-at-end-on-error');
            expect(actualConfigForTest.options.port).to.equal(8888);
        });

        it('should override scope options if they are overridden via cli-arguments', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(yaniceJson2 as any, {...args, givenScope: 'test', commandOutputMode: 'ignore'});
            expect(actualConfigForTest.options.commandOutput).to.equal('ignore');
        });
    });

    describe('getDepGraphFromConfigByScope', () => {
        it('should properly map command-cwd', () => {
            const yaniceConfig = ConfigParser.getYaniceConfig(yaniceJson1, args);
            const yaniceProject1 = yaniceConfig.projects.find(project => project.projectName === 'A');
            const yaniceProject2 = yaniceConfig.projects.find(project => project.projectName === 'B');
            expect(yaniceProject1!.commands.lint).to.deep.equal({
                command: 'lint A',
                cwd: 'path/to/dir/A'
            });
            expect(yaniceProject1!.commands.test).to.equal(undefined);
            expect(yaniceProject2!.commands.lint).to.deep.equal({
                command: 'lint B',
                cwd: './'
            });
        });

        it('should properly create a directed graph', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getYaniceConfig(yaniceJson1, {...args, givenScope: 'lint'}));
            expect(actualGraph!.nodes.map(n => n.name)).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });

        it('should properly create a directed graph', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getYaniceConfig(yaniceJson2 as any, {...args, givenScope: 'test'}));
            expect(actualGraph).to.not.equal(null);
            expect(actualGraph!.nodes.find(n => n.name === 'project-A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-1')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-A']);
            expect(DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(actualGraph!, ['lib-1'])).to.have.same.members(['project-A', 'lib-1']);
        });

        it('should properly create a directed graph when given a scope-definition', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getYaniceConfig(yaniceJson1, {...args, givenScope: 'test'}));
            expect(actualGraphForTestScope).to.not.equal(null);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'B')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'C')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'D')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['C', 'B']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'E')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForTestScope!)).to.equal(false);
        });

        it('should properly create a directed graph even when given a scope-definition containing an illegal cycle', () => {
            const actualGraphForIllegalCycleScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getYaniceConfig(yaniceJson1, {...args, givenScope: 'illegalCycle'}));
            expect(actualGraphForIllegalCycleScope).to.not.equal(null);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'A')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['E']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'B')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'C')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['B']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'D')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['C']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'E')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForIllegalCycleScope!)).to.equal(true);
        });

        it('should create nodes for projects even if they are not explicitly listed in the dependency scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getYaniceConfig(yaniceJson2 as any, {...args, givenScope: 'build-some'}));
            expect(actualGraph!.nodes.map(n => n.name)).to.have.same.members(['project-A', 'project-B', 'lib-1', 'lib-2']);
            expect(actualGraph!.nodes.find(n => n.name === 'project-A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'project-B')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-1')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-A']);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-2')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-B']);
        });
    });
});
