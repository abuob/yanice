import { expect } from 'chai';
import { DirectedGraphUtil } from '../directed-graph';

const graph0 = DirectedGraphUtil.directedGraphBuilder.build();
const graph1 = DirectedGraphUtil.directedGraphBuilder.addNode('A').addNode('B').createDirectedEdge('A', 'B').build();
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

describe('DirectedGraphUtil', () => {
    describe('hasCycle', () => {
        it('should return true if there is a cycle in a given graph', () => {
            const cyclicGraph0 = DirectedGraphUtil.directedGraphBuilder.addNode('A').createDirectedEdge('A', 'A').build();
            const cyclicGraph1 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('B', 'A')
                .build();
            const cyclicGraph2 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('B', 'C')
                .createDirectedEdge('C', 'A')
                .build();
            const cyclicGraph3 = DirectedGraphUtil.directedGraphBuilder
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
            expect(DirectedGraphUtil.hasCycle(cyclicGraph0)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(cyclicGraph1)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(cyclicGraph2)).to.equal(true);
            expect(DirectedGraphUtil.hasCycle(cyclicGraph3)).to.equal(true);
        });

        it('should return false if there is no cycle in a given graph', () => {
            expect(DirectedGraphUtil.hasCycle(graph0)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph1)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph2)).to.equal(false);
            expect(DirectedGraphUtil.hasCycle(graph3)).to.equal(false);
        });
    });

    describe('getAncestorsAndSelfForSingleNode', () => {
        it('should return the given node and all its ancestors', () => {
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph0, 'this-does-not-exist')).to.have.same.members([]);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph1, 'A')).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph1, 'B')).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph2, 'A')).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph2, 'B')).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph2, 'C')).to.have.same.members(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph3, 'A')).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph3, 'B')).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph3, 'C')).to.have.same.members(['A', 'C']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph3, 'D')).to.have.same.members(['A', 'B', 'C', 'D']);
            expect(DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph3, 'E')).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });
    });

    describe('getDescendantsAndSelfForSingleNode', () => {
        it('should return the given node and all its descendants', () => {
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph0, 'this-does-not-exist')).to.have.same.members([]);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph1, 'A')).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph1, 'B')).to.have.same.members(['B']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph2, 'A')).to.have.same.members(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph2, 'B')).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph2, 'B')).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph2, 'C')).to.have.same.members(['C']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph3, 'A')).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph3, 'B')).to.have.same.members(['B', 'D', 'E']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph3, 'C')).to.have.same.members(['C', 'D', 'E']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph3, 'D')).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph3, 'E')).to.have.same.members(['E']);
        });
    });

    describe('getAncestorsOfMultipleNodes', () => {
        it('should return all ancestors, without the given nodes unless they are ancestors of other given nodes', () => {
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph0, ['this-does-not-exist'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph1, ['A'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph1, ['B'])).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph2, ['A'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph2, ['B'])).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph2, ['C'])).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph2, ['B', 'C'])).to.have.same.members(['A', 'B']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['A'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['A', 'E'])).to.have.same.members(['A', 'B', 'C', 'D']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['B'])).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['C'])).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['B', 'C'])).to.have.same.members(['A']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['D'])).to.have.same.members(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getAncestorsOfMultipleNodes(graph3, ['E'])).to.have.same.members(['A', 'B', 'C', 'D']);
        });
    });

    describe('getDescendantsOfMultipleNodes', () => {
        it('should return all descendants, without the given nodes unless they are descendants of other given nodes', () => {
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph0, ['this-does-not-exist'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph1, ['A'])).to.have.same.members(['B']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph1, ['B'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph2, ['A'])).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph2, ['A', 'B'])).to.have.same.members(['B', 'C']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph2, ['B'])).to.have.same.members(['C']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph2, ['C'])).to.have.same.members([]);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['A'])).to.have.same.members(['B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['A', 'E'])).to.have.same.members(['B', 'C', 'D', 'E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['B'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['C'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['B', 'C'])).to.have.same.members(['D', 'E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['D'])).to.have.same.members(['E']);
            expect(DirectedGraphUtil.getDescendantsOfMultipleNodes(graph3, ['E'])).to.have.same.members([]);
        });
    });

    describe('getTopologicallySorted', () => {
        it('should return node-names topologically sorted', () => {
            expect(DirectedGraphUtil.getTopologicallySorted(graph1, ['B', 'A'])).to.deep.equal(['A', 'B']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['A', 'B', 'C'])).to.deep.equal(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['B', 'C', 'A'])).to.deep.equal(['A', 'B', 'C']);
            expect(DirectedGraphUtil.getTopologicallySorted(graph2, ['C', 'B', 'A'])).to.deep.equal(['A', 'B', 'C']);
        });
    });

    describe('getTopologicallySortedReverse', () => {
        it('should return node-names topologically sorted', () => {
            expect(DirectedGraphUtil.getTopologicallySortedReverse(graph1, ['B', 'A'])).to.deep.equal(['B', 'A']);
            expect(DirectedGraphUtil.getTopologicallySortedReverse(graph2, ['A', 'B', 'C'])).to.deep.equal(['C', 'B', 'A']);
            expect(DirectedGraphUtil.getTopologicallySortedReverse(graph2, ['B', 'C', 'A'])).to.deep.equal(['C', 'B', 'A']);
            expect(DirectedGraphUtil.getTopologicallySortedReverse(graph2, ['C', 'B', 'A'])).to.deep.equal(['C', 'B', 'A']);
        });
    });

    describe('isAncestorOf', () => {
        it('should calculate whether a node is an ancestor of another one or not', () => {
            expect(DirectedGraphUtil.isAncestorOf(graph1, 'A', 'B', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph1, 'B', 'A', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'A', 'B', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'A', 'C', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'B', 'C', false)).to.equal(true);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'A', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'B', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'C', false)).to.equal(false);
            expect(DirectedGraphUtil.isAncestorOf(graph2, 'C', 'C', true)).to.equal(true);
        });
    });

    describe('directedGraphBuilder', () => {
        it('should create the graphs correctly', () => {
            const createdGraph0 = DirectedGraphUtil.directedGraphBuilder.addNode('A').addNode('B').addNode('C').build();
            const createdGraph1 = DirectedGraphUtil.directedGraphBuilder
                .addNode('A')
                .addNode('B')
                .addNode('C')
                .createDirectedEdge('A', 'B')
                .createDirectedEdge('A', 'C')
                .createDirectedEdge('B', 'C')
                .build();
            expect(createdGraph0.nodes.map((n) => n.name)).to.have.same.members(['A', 'B', 'C']);
            expect(createdGraph1.nodes.map((n) => n.name)).to.have.same.members(['A', 'B', 'C']);
            expect(
                createdGraph1.nodes
                    .find((n) => n.name === 'A')!
                    .getChildren()
                    .map((n) => n.name)
            ).to.have.same.members(['B', 'C']);
            expect(
                createdGraph1.nodes
                    .find((n) => n.name === 'B')!
                    .getChildren()
                    .map((n) => n.name)
            ).to.have.same.members(['C']);
        });

        it('should throw an error when trying to add another node with the same name', () => {
            const builderWithOneNode = DirectedGraphUtil.directedGraphBuilder.addNode('A');
            expect(builderWithOneNode.addNode.bind(builderWithOneNode, 'A')).to.throw(
                'Cannot add a node with name "A" to the graph, such a node already exists!'
            );
        });
    });
});
