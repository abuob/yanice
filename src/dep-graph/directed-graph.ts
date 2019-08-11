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

    public static getTransitiveChildrenNames(graph: IDirectedGraph, ancestorNames: string[]): string[] {
        return this.removeDupliateEntries(
            ancestorNames
                .map(ancestorName => {
                    const givenNode = this.getNodeByName(graph, ancestorName);
                    if (!givenNode) {
                        return [];
                    }
                    const setOfChildren: Set<string> = this.getNodeAndTransitiveChildrenNames(graph, ancestorName).reduce(
                        (prev, curr) => prev.add(curr),
                        new Set<string>()
                    );
                    setOfChildren.delete(ancestorName);
                    return Array.from(setOfChildren);
                })
                .reduce((prev, curr) => prev.concat(curr), [])
        );
    }

    public static getTransitiveChildrenNamesIncludingAncestors(graph: IDirectedGraph, ancestorNames: string[]): string[] {
        return this.removeDupliateEntries(this.getTransitiveChildrenNames(graph, ancestorNames).concat(ancestorNames));
    }

    public static getNodeAndTransitiveChildrenNames(graph: IDirectedGraph, name: string): string[] {
        const givenNode = this.getNodeByName(graph, name);
        if (!givenNode) {
            return [];
        }
        return this.getNodeAndTransitiveChildren(givenNode).map(n => n.name);
    }

    private static getNodeAndTransitiveChildren(node: IDirectedGraphNode): IDirectedGraphNode[] {
        if (node.edgesTo.length === 0) {
            return [node];
        }
        return this.removeDupliateEntries(
            node.edgesTo.map(n => this.getNodeAndTransitiveChildren(n)).reduce((prev, curr) => prev.concat(curr), [node])
        );
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

    private static getNodeByName(graph: IDirectedGraph, name: string): IDirectedGraphNode | null {
        const givenNode = graph.nodes.find(n => n.name === name);
        if (!givenNode) {
            return null;
        }
        return givenNode;
    }

    // poor man's removal of duplicate entries in an array
    private static removeDupliateEntries<T>(input: T[]): T[] {
        return Array.from(input.reduce((prev, curr) => prev.add(curr), new Set<T>()));
    }
}

class DirectedGraphBuilder {
    private graph: IDirectedGraph = {
        nodes: []
    };

    public addNode(name: string): DirectedGraphBuilder {
        if (this.graph.nodes.map(n => n.name).includes(name)) {
            throw Error(`Cannot add a node with name "${name}" to the graph, such a node already exists!`);
        }
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
