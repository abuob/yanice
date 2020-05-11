import { expect } from "chai";
import { GraphDotRenderer } from '../graph-dot-renderer'
import { DirectedGraphUtil } from '../../directed-graph/directed-graph'

describe('GraphDotRenderer', () => {
    it('should render a graph without any edges to DOT', () => {
        const graph = DirectedGraphUtil.directedGraphBuilder
            .addNode('A')
            .addNode('B')
            .addNode('C')
            .addNode('D')
            .addNode('E')
            .build();
        expect(GraphDotRenderer.getDotRepresentation(graph)).to.equal('digraph {A [label="A"];B [label="B"];C [label="C"];D [label="D"];E [label="E"]; }');
    });

    it('should render a graph with some edges into DOT', () => {
        const graph = DirectedGraphUtil.directedGraphBuilder
            .addNode('project-A')
            .addNode('project-B')
            .addNode('lib-1')
            .addNode('lib-2')
            .createDirectedEdge('lib-1', 'project-A')
            .createDirectedEdge('lib-2', 'project-B')
            .build();
        expect(GraphDotRenderer.getDotRepresentation(graph)).to.equal('digraph {project_A [label="project-A"];project_B [label="project-B"];lib_1 [label="lib-1"];lib_2 [label="lib-2"]; lib_1 -> project_A;lib_2 -> project_B;}');
    });
});
