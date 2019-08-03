interface IDirectedGraphNode {
    name: string;
    edgesTo: IDirectedGraphNode[];
}

export interface IDirectedGraph {
    nodes: IDirectedGraphNode[];
}

export class DirectedGraphUtil {
    public static get directedGraphBuilder(): DirectedGraphBuilder {
        return new DirectedGraphBuilder();
    }

    public static hasCycle(graph: IDirectedGraph): boolean {
        let visitedAlready: IDirectedGraphNode[] = [];
        let result = false;
        graph.nodes.forEach(node => {
            if (this.hasCycleRecursive(node, visitedAlready, [])) {
                result = true;
            }
            visitedAlready = visitedAlready.concat(node);
        });
        return result;
    }

    private static hasCycleRecursive(
        node: IDirectedGraphNode,
        visitedAlready: IDirectedGraphNode[],
        nodesInDfsTraversal: IDirectedGraphNode[]
    ): boolean {
        if (visitedAlready.includes(node)) {
            return false;
        }
        if (nodesInDfsTraversal.includes(node)) {
            return true;
        }
        return node.edgesTo
            .map(connectedNode => this.hasCycleRecursive(connectedNode, visitedAlready, nodesInDfsTraversal.concat(node)))
            .reduce((prev, curr) => prev || curr, false);
    }
}

class DirectedGraphBuilder {
    private graph: IDirectedGraph = {
        nodes: []
    };

    public addNode(name: string): DirectedGraphBuilder {
        this.graph.nodes = this.graph.nodes.concat({ name, edgesTo: [] });
        return this;
    }

    public createDirectedEdge(fromNodeWithName: string, toNodeWithName: string): DirectedGraphBuilder {
        let fromNode: IDirectedGraphNode | null = null;
        let toNode: IDirectedGraphNode | null = null;
        this.graph.nodes.forEach(node => {
            if (node.name === fromNodeWithName) {
                fromNode = node;
            }
            if (node.name === toNodeWithName) {
                toNode = node;
            }
        });
        if (!fromNode || !toNode) {
            return this;
        }
        fromNode!.edgesTo = fromNode!.edgesTo.concat(toNode);
        return this;
    }

    public build(): IDirectedGraph {
        return this.graph;
    }
}
