import yaniceJson from './fixtures/example-yanice.json';
import { ConfigParser } from '../config-parser'
import { expect } from 'chai';
import { DirectedGraphUtil } from '../../dep-graph/directed-graph'

describe('ConfigParser', () => {
    describe('getDepGraphFromConfigByScope', () => {
        it('should return null if given a scope that is not defined', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(yaniceJson, 'scopeDoesNotExist');
            expect(actualGraphForTestScope).to.equal(null);
        });

        it('should properly create a directed graph when given the most simple scope-definition', () => {
            expect(ConfigParser.getDepGraphFromConfigByScope(yaniceJson, 'lint')).to.deep.equal({nodes: [
                    {name: 'A', edgesTo: []},
                    {name: 'B', edgesTo: []},
                    {name: 'C', edgesTo: []},
                    {name: 'D', edgesTo: []},
                    {name: 'E', edgesTo: []},
                ]});
        });

        it('should properly create a directed graph when given a scope-definition', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfigByScope(yaniceJson, 'test');
            expect(actualGraphForTestScope).to.not.equal(null);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'A')!.edgesTo.map(n => n.name)).to.have.same.members(['B', 'C']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'B')!.edgesTo.map(n => n.name)).to.have.same.members(['D']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'C')!.edgesTo.map(n => n.name)).to.have.same.members(['D']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'D')!.edgesTo.map(n => n.name)).to.have.same.members(['E']);
            expect(actualGraphForTestScope!.nodes.find(n => n.name === 'E')!.edgesTo.map(n => n.name)).to.have.same.members([]);
            expect(DirectedGraphUtil.hasCycle(actualGraphForTestScope!)).to.equal(false);
        });

        it('should properly create a directed graph even when given a scope-definition containing an illegal cycle', () => {
            const actualGraphForIllegalCycleScope = ConfigParser.getDepGraphFromConfigByScope(yaniceJson, 'illegalCycle');
            expect(actualGraphForIllegalCycleScope).to.not.equal(null);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'A')!.edgesTo.map(n => n.name)).to.have.same.members(['B']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'B')!.edgesTo.map(n => n.name)).to.have.same.members(['C']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'C')!.edgesTo.map(n => n.name)).to.have.same.members(['D']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'D')!.edgesTo.map(n => n.name)).to.have.same.members(['E']);
            expect(actualGraphForIllegalCycleScope!.nodes.find(n => n.name === 'E')!.edgesTo.map(n => n.name)).to.have.same.members(['A']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForIllegalCycleScope!)).to.equal(true);
        });
    });
});
