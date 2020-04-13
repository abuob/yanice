import { expect } from "chai";
import { DirectedGraphUtil } from '../directed-graph'

describe('DirectedGraphUtil', () => {
    describe('hasCycle', () => {
        it('should return true if there is a cycle in a given graph', () => {
            const graph0 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .createDirectedEdge('A', 'A')
                .build();
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
            expect(DirectedGraphUtil.hasCycle(graph0)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(graph1)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(graph2)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(graph3)).to.equal(true);
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
            expect(DirectedGraphUtil.hasCycle(graph0)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph1)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph2)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph3)).to.equal(false);
        });
    });

    describe('getNodeAndTransitiveChildrenNames', () => {
        it('should return the given node and all its transitive children', () => {
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
                .addNode('E')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'D')
                .createDirectedEdge('C', 'D')
                .createDirectedEdge('D', 'E')
                .build();
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph0, 'this-does-not-exist')).to.have.same.members([]);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph1, 'A')).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph1, 'B')).to.have.same.members(['B']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph2, 'A')).to.have.same.members(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph2, 'B')).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph2, 'C')).to.have.same.members(['C']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph3, 'A')).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph3, 'B')).to.have.same.members(['B', 'D', 'E']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph3, 'C')).to.have.same.members(['C', 'D', 'E']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph3, 'D')).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getNodeAndTransitiveChildrenNames(graph3, 'E')).to.have.same.members(['E']);
        });
    });

    describe('getTransitiveChildrenNames', () => {
        it('should return all transitive children, without the given ancestor-node', () => {
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
                .addNode('E')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'D')
                .createDirectedEdge('C', 'D')
                .createDirectedEdge('D', 'E')
                .build();
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph0, ['this-does-not-exist'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph1, ['A'])).to.have.same.members(['B']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph1, ['B'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph2, ['A'])).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph2, ['B'])).to.have.same.members(['C']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph2, ['C'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['A'])).to.have.same.members(['B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['A', 'E'])).to.have.same.members(['B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['B'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['C'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['B', 'C'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['D'])).to.have.same.members(['E']);
            expect(DirectedGraphUtil.getTransitiveChildrenNames(graph3, ['E'])).to.have.same.members([]);
        });
    });

    describe('getTopologicallySorted', () => {
        it('should return node-names topologically sorted', () => {
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
                .addNode('E')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'D')
                .createDirectedEdge('C', 'D')
                .createDirectedEdge('D', 'E')
                .build();
            expect(DirectedGraphUtil.getTopologicallySorted(graph1, ['B', 'A'])).to.deep.equal(['A', 'B']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['A', 'B', 'C'])).to.deep.equal(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['B', 'C', 'A'])).to.deep.equal(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['C', 'B', 'A'])).to.deep.equal(['A', 'B', 'C']);
        });
    });

    describe('isAncestorOf', () => {
        it('should calculate whether a node is an ancestor of another one or not', () => {
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
            expect(DirectedGraphUtil.isAncestorOf(graph1, 'A', 'B', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph1, 'B', 'A', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'A', 'B', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'A', 'C', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'B', 'C', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'A', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'B', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'C', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'C', true)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'C', true)).to.equal(true);
        });
    });

    describe('directedGraphBuilder', () => {
        it('should create the graphs correctly', () => {
            const graph1 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .build();
            const graph2 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'C')
                .build();
            expect(graph1.nodes.map(n => n.name)).to.have.same.members(['A', 'B', 'C']);
            expect(graph2.nodes.map(n => n.name)).to.have.same.members(['A', 'B', 'C']);
            expect(graph2.nodes.find(n => n.name === 'A')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['B', 'C']);
            expect(graph2.nodes.find(n => n.name === 'B')!.getConnectedNodes().map(n => n.name)).to.have.same.members(['C']);
        });

        it('should throw an error when trying to add another node with the same name', () => {
            const builderWithOneNode = DirectedGraphUtil.directedGraphBuilder
                .addNode('A');
            expect(builderWithOneNode.addNode.bind(builderWithOneNode, 'A')).to.throw('Cannot add a node with name "A" to the graph, such a node already exists!');
        });
    });
});
