import { expect } from "chai";
import { DirectedGraphUtil } from '../directed-graph'

describe('DirectedGraphUtil', () => {
    describe('isCyclic', () => {
        it('should return true if there is a cycle in a given graph', () => {
            const graph1 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('B', 'A')
                .build();
            const graph2 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('B', 'C')
                .createDirectedEdge('C', 'A')
                .build();
            const graph3 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .addNode('D')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'D')
                .createDirectedEdge('C', 'D')
                .createDirectedEdge('D', 'A')
                .build();
            expect(DirectedGraphUtil.isCyclic(graph1)).to.equal(true);
            expect(DirectedGraphUtil.isCyclic(graph2)).to.equal(true);
            expect(DirectedGraphUtil.isCyclic(graph3)).to.equal(true);
        });

        it('should return false if there is no cycle in a given graph', () => {
            const graph0 = DirectedGraphUtil.directedGraphBuilder.build();
            const graph1 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .createDirectedEdge('A', 'B')
                .build();
            const graph2 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('B', 'C')
                .build();
            const graph3 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .addNode('D')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'D')
                .createDirectedEdge('C', 'D')
                .build();
            expect(DirectedGraphUtil.isCyclic(graph0)).to.equal(false);
            expect(DirectedGraphUtil.isCyclic(graph1)).to.equal(false);
            expect(DirectedGraphUtil.isCyclic(graph2)).to.equal(false);
            expect(DirectedGraphUtil.isCyclic(graph3)).to.equal(false);
        });
    });

    describe('directedGraphBuilder', () => {
        it('should create the graphs correctly', () => {
            expect(DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .build()).to.deep.equal({nodes: [
                    {name: 'A', edgesTo: []},
                    {name: 'B', edgesTo: []},
                    {name: 'C', edgesTo: []},
                ]});
            expect(DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .build()).to.deep.equal({nodes: [
                    {name: 'A', edgesTo: [{name: 'B', edgesTo: []}]},
                    {name: 'B', edgesTo: []},
                    {name: 'C', edgesTo: []},
                ]});
        });
    });
});
