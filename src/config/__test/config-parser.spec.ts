import yaniceJson1 from '../../__fixtures/valid-2.yanice.json';
import yaniceJson2 from '../../__fixtures/valid-3.yanice.json';
import { ConfigParser } from '../config-parser'
import { expect } from 'chai';
import { DirectedGraphUtil } from '../../dep-graph/directed-graph'

describe('ConfigParser', () => {
    describe('getConfigFromYaniceJson', () => {
        it('should set the options to default values if none are specified', () => {
            const actualYaniceConfig1 = ConfigParser.getConfigFromYaniceJson(yaniceJson1 as any);
            expect(actualYaniceConfig1.options.outputFilters).to.have.same.members([]);
            expect(actualYaniceConfig1.options.commandOutput).to.equal('ignore');
            expect(actualYaniceConfig1.options.outputFolder).to.equal('./.yanice-output');
            expect(actualYaniceConfig1.options.port).to.equal(4567);
        });

        it('should set the options to the values specified in the yaniceJson', () => {
            const actualYaniceConfig2 = ConfigParser.getConfigFromYaniceJson(yaniceJson2 as any);
            expect(actualYaniceConfig2.options.outputFilters).to.have.same.members(['npmError']);
            expect(actualYaniceConfig2.options.commandOutput).to.equal('append-at-end');
            expect(actualYaniceConfig2.options.outputFolder).to.equal('./.yanice-graph-output');
            expect(actualYaniceConfig2.options.port).to.equal(7777);
        });
    });

    describe('getDepGraphFromConfigByScope', () => {
        it('should return null if given a scope that is not defined', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'scopeDoesNotExist');
            expect(actualGraphForTestScope).to.equal(null);
        });

        it('should properly map commands to default values when none are given', () => {
            const yaniceConfig = ConfigParser.getConfigFromYaniceJson(yaniceJson1);
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

        it('should properly create a directed graph when given example-1-yanice.json with test-scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'lint');
            expect(actualGraph!.nodes.map(n => n.name)).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });

        it('should properly create a directed graph when given example-2-yanice.json with test-scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson2 as any), 'test');
            expect(actualGraph).to.not.equal(null);
            expect(actualGraph!.nodes.find(n => n.name === 'project-A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-1')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-A']);
            expect(DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(actualGraph!, ['lib-1'])).to.have.same.members(['project-A', 'lib-1']);
        });

        it('should properly create a directed graph when given a scope-definition', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'test');
            expect(actualGraphForTestScope).to.not.equal(null);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'B')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'C')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'D')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['C', 'B']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'E')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForTestScope!)).to.equal(false);
        });

        it('should properly create a directed graph even when given a scope-definition containing an illegal cycle', () => {
            const actualGraphForIllegalCycleScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'illegalCycle');
            expect(actualGraphForIllegalCycleScope).to.not.equal(null);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'A')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['E']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'B')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'C')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['B']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'D')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['C']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'E')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForIllegalCycleScope!)).to.equal(true);
        });

        it('should create nodes for projects even if they are not explicitly listed in the dependency scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson2 as any), 'build-some');
            expect(actualGraph!.nodes.map(n => n.name)).to.have.same.members(['project-A', 'project-B', 'lib-1', 'lib-2']);
            expect(actualGraph!.nodes.find(n => n.name === 'project-A')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'project-B')!.getConnectedNodes().map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-1')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-A']);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-2')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['project-B']);
        });
    });
});
