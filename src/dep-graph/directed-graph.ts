export class DirectedGraphNode {
    public readonly name: string;
    private edgesTo: DirectedGraphNode[];

    constructor(name: string) {
        this.name = name;
        this.edgesTo = [];
    }

    public getConnectedNodes(): DirectedGraphNode[] {
        return this.edgesTo;
    }

    public addEdgeTowards(node: DirectedGraphNode): void {
        this.edgesTo.push(node);
    }
}

export interface IDirectedGraph {
    nodes: DirectedGraphNode[];
}

export class DirectedGraphUtil {
    public static get directedGraphBuilder(): DirectedGraphBuilder {
        return new DirectedGraphBuilder();
    }

    public static hasCycle(graph: IDirectedGraph): boolean {
        let visitedAlready: DirectedGraphNode[] = [];
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

    public static sortTopologically(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return nodeNames.sort((a, b) => {
            if (this.isAncestorOf(graph, a, b, false)) {
                return -1;
            }
            if (this.isAncestorOf(graph, b, a, false)) {
                return 1;
            }
            return 0;
        });
    }

    public static isAncestorOf(graph: IDirectedGraph, ancestor: string, descendant: string, allowReflexive: boolean): boolean {
        if (ancestor === descendant) {
            return allowReflexive;
        }
        return this.getNodeAndTransitiveChildrenNames(graph, ancestor).includes(descendant);
    }

    private static getNodeAndTransitiveChildren(node: DirectedGraphNode): DirectedGraphNode[] {
        if (node.getConnectedNodes().length === 0) {
            return [node];
        }
        return this.removeDupliateEntries(
            node
                .getConnectedNodes()
                .map(n => this.getNodeAndTransitiveChildren(n))
                .reduce((prev, curr) => prev.concat(curr), [node])
        );
    }

    private static hasCycleRecursive(
        node: DirectedGraphNode,
        visitedAlready: DirectedGraphNode[],
        nodesInDfsTraversal: DirectedGraphNode[]
    ): boolean {
        if (visitedAlready.includes(node)) {
            return false;
        }
        if (nodesInDfsTraversal.includes(node)) {
            return true;
        }
        return node
            .getConnectedNodes()
            .map(connectedNode => this.hasCycleRecursive(connectedNode, visitedAlready, nodesInDfsTraversal.concat(node)))
            .reduce((prev, curr) => prev || curr, false);
    }

    private static getNodeByName(graph: IDirectedGraph, name: string): DirectedGraphNode | null {
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
        this.graph.nodes = this.graph.nodes.concat(new DirectedGraphNode(name));
        return this;
    }

    public createDirectedEdge(fromNodeWithName: string, toNodeWithName: string): DirectedGraphBuilder {
        const fromNode = this.graph.nodes.find(node => node.name === fromNodeWithName);
        const toNode = this.graph.nodes.find(node => node.name === toNodeWithName);
        if (!fromNode || !toNode) {
            return this;
        }
        fromNode.addEdgeTowards(toNode);
        return this;
    }

    public build(): IDirectedGraph {
        return this.graph;
    }
}
