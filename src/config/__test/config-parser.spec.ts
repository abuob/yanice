import yaniceJson1 from './fixtures/example-1-yanice.json';
import yaniceJson2 from './fixtures/example-2-yanice.json';
import { ConfigParser } from '../config-parser'
import { expect } from 'chai';
import { DirectedGraphUtil } from '../../dep-graph/directed-graph'

describe('ConfigParser', () => {
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
            expect(ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'lint')).to.deep.equal({nodes: [
                    {name: 'A', edgesTo: []},
                    {name: 'B', edgesTo: []},
                    {name: 'C', edgesTo: []},
                    {name: 'D', edgesTo: []},
                    {name: 'E', edgesTo: []},
                ]});
        });

        it('should properly create a directed graph when given example-2-yanice.json with test-scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson2), 'test');
            expect(actualGraph).to.not.equal(null);
            expect(actualGraph!.nodes.find(n => n.name === 'project-A')!.edgesTo.map(n => n.name)).to.have.same.members([]);
            expect(actualGraph!.nodes.find(n => n.name === 'lib-1')!.edgesTo.map(n => n.name)).to.have.same.members(['project-A']);
            expect(DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(actualGraph!, ['lib-1'])).to.have.same.members(['project-A', 'lib-1']);
        });

        it('should properly create a directed graph when given a scope-definition', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'test');
            expect(actualGraphForTestScope).to.not.equal(null);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'A')!.edgesTo.map(n => n.name)).to.have.same.members([]);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'B')!.edgesTo.map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'C')!.edgesTo.map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'D')!.edgesTo.map(n => n.name)).to.have.same.members(['C', 'B']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'E')!.edgesTo.map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForTestScope!)).to.equal(false);
        });

        it('should properly create a directed graph even when given a scope-definition containing an illegal cycle', () => {
            const actualGraphForIllegalCycleScope = ConfigParser.getDepGraphFromConfigByScope(ConfigParser.getConfigFromYaniceJson(yaniceJson1), 'illegalCycle');
            expect(actualGraphForIllegalCycleScope).to.not.equal(null);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'A')!.edgesTo.map(n => n.name)).to.have.same.members(['E']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'B')!.edgesTo.map(n => n.name)).to.have.same.members(['A']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'C')!.edgesTo.map(n => n.name)).to.have.same.members(['B']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'D')!.edgesTo.map(n => n.name)).to.have.same.members(['C']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'E')!.edgesTo.map(n => n.name)).to.have.same.members(['D']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForIllegalCycleScope!)).to.equal(true);
        });
    });
});
