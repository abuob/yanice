import { expect } from "chai";
import { GraphDotRenderer } from '../graph-dot-renderer'

describe('GraphDotRenderer', () => {
    it('should render a graph without any edges to DOT', () => {
        expect(GraphDotRenderer.getDotRepresentation({nodes: [
                {name: 'A', edgesTo: []},
                {name: 'B', edgesTo: []},
                {name: 'C', edgesTo: []},
                {name: 'D', edgesTo: []},
                {name: 'E', edgesTo: []},
            ]})).to.equal('digraph {A [label="A"];B [label="B"];C [label="C"];D [label="D"];E [label="E"]; }');
    });

    it('should render a graph with some edges into DOT', () => {
        expect(GraphDotRenderer.getDotRepresentation({nodes: [
                {name: 'project-A', edgesTo: []},
                {name: 'project-B', edgesTo: []},
                {name: 'lib-1', edgesTo: [{name: 'project-A', edgesTo: []}]},
                {name: 'lib-2', edgesTo: [{name: 'project-B', edgesTo: []}]},
            ]})).to.equal('digraph {project_A [label="project-A"];project_B [label="project-B"];lib_1 [label="lib-1"];lib_2 [label="lib-2"]; lib_1 -> project_A;lib_2 -> project_B;}');
    });
});
