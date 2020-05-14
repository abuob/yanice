export class DirectedGraphNode {
    public readonly name: string;
    private children: DirectedGraphNode[];
    private parents: DirectedGraphNode[];

    constructor(name: string) {
        this.name = name;
        this.children = [];
        this.parents = [];
    }

    public getChildren(): DirectedGraphNode[] {
        return this.children;
    }

    public getParents(): DirectedGraphNode[] {
        return this.parents;
    }

    public addChild(node: DirectedGraphNode): void {
        this.children.push(node);
    }

    public addParent(node: DirectedGraphNode): void {
        this.parents.push(node);
    }
}

export interface IDirectedGraph {
    nodes: DirectedGraphNode[];
}

/**
 * For terminology, see: https://en.wikipedia.org/wiki/Tree_(data_structure)#Terminology_used_in_trees
 * (Not everywhere consequentially used yet)
 */
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

    public static getAncestorsOfMultipleNodes(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return this.removeDupliateEntries(
            nodeNames
                .map(ancestorName => {
                    const givenNode = this.getNodeByName(graph, ancestorName);
                    if (!givenNode) {
                        return [];
                    }
                    const setOfAncestors: Set<string> = this.getAncestorsAndSelfForSingleNode(graph, ancestorName).reduce(
                        (prev, curr) => prev.add(curr),
                        new Set<string>()
                    );
                    setOfAncestors.delete(ancestorName);
                    return Array.from(setOfAncestors);
                })
                .reduce((prev, curr) => prev.concat(curr), [])
        );
    }

    public static getDescendantsOfMultipleNodes(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return this.removeDupliateEntries(
            nodeNames
                .map(ancestorName => {
                    const givenNode = this.getNodeByName(graph, ancestorName);
                    if (!givenNode) {
                        return [];
                    }
                    const setOfDescendants: Set<string> = this.getDescendantsAndSelfForSingleNode(graph, ancestorName).reduce(
                        (prev, curr) => prev.add(curr),
                        new Set<string>()
                    );
                    setOfDescendants.delete(ancestorName);
                    return Array.from(setOfDescendants);
                })
                .reduce((prev, curr) => prev.concat(curr), [])
        );
    }

    public static getAncestorsAndSelfOfMultipleNodes(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return this.removeDupliateEntries(this.getAncestorsOfMultipleNodes(graph, nodeNames).concat(nodeNames));
    }

    public static getDescendantsAndSelfOfMultipleNodes(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return this.removeDupliateEntries(this.getDescendantsOfMultipleNodes(graph, nodeNames).concat(nodeNames));
    }

    public static getAncestorsAndSelfForSingleNode(graph: IDirectedGraph, nodeName: string): string[] {
        const givenNode = this.getNodeByName(graph, nodeName);
        if (!givenNode) {
            return [];
        }
        return this.getAncestorsAndSelfOfSingleNodeRecursively(givenNode).map(n => n.name);
    }

    public static getDescendantsAndSelfForSingleNode(graph: IDirectedGraph, nodeName: string): string[] {
        const givenNode = this.getNodeByName(graph, nodeName);
        if (!givenNode) {
            return [];
        }
        return this.getDescendantsAndSelfOfSingleNodeRecursively(givenNode).map(n => n.name);
    }

    /**
     * Implementation as per https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
     */
    public static getTopologicallySorted(graph: IDirectedGraph, nodeNames: string[]): string[] {
        const alreadySorted: string[] = [];
        const tmpMarked = new Set<string>();
        const permanentMarked = new Set<string>();
        while (graph.nodes.length !== permanentMarked.size) {
            const unmarkedNode = graph.nodes.find(node => !permanentMarked.has(node.name));
            if (unmarkedNode) {
                this.getTopologicallySortedVisit(graph, unmarkedNode, tmpMarked, permanentMarked, alreadySorted);
            } else {
                throw new Error('Cannot establish topological ordering; is your graph indeed a DAG?');
            }
        }
        return alreadySorted.filter(n => nodeNames.includes(n));
    }

    public static getTopologicallySortedReverse(graph: IDirectedGraph, nodeNames: string[]): string[] {
        return this.getTopologicallySorted(graph, nodeNames).reverse();
    }

    public static isAncestorOf(graph: IDirectedGraph, ancestor: string, descendant: string, allowReflexive: boolean): boolean {
        if (ancestor === descendant) {
            return allowReflexive;
        }
        return this.getAncestorsAndSelfForSingleNode(graph, descendant).includes(ancestor);
    }

    private static getTopologicallySortedVisit(
        graph: IDirectedGraph,
        currentNode: DirectedGraphNode,
        tmpMarked: Set<string>,
        permanentMarked: Set<string>,
        alreadySorted: string[]
    ): void {
        if (permanentMarked.has(currentNode.name)) {
            return;
        }
        if (tmpMarked.has(currentNode.name)) {
            throw new Error('Cannot establish topological ordering; does your graph contain a cycle?');
        }
        tmpMarked.add(currentNode.name);
        currentNode.getChildren().forEach(n => this.getTopologicallySortedVisit(graph, n, tmpMarked, permanentMarked, alreadySorted));
        tmpMarked.delete(currentNode.name);
        permanentMarked.add(currentNode.name);
        alreadySorted.unshift(currentNode.name);
    }

    private static getAncestorsAndSelfOfSingleNodeRecursively(node: DirectedGraphNode): DirectedGraphNode[] {
        if (node.getParents().length === 0) {
            return [node];
        }
        return this.removeDupliateEntries(
            node
                .getParents()
                .map(n => this.getAncestorsAndSelfOfSingleNodeRecursively(n))
                .reduce((prev, curr) => prev.concat(curr), [node])
        );
    }

    private static getDescendantsAndSelfOfSingleNodeRecursively(node: DirectedGraphNode): DirectedGraphNode[] {
        if (node.getChildren().length === 0) {
            return [node];
        }
        return this.removeDupliateEntries(
            node
                .getChildren()
                .map(n => this.getDescendantsAndSelfOfSingleNodeRecursively(n))
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
            .getChildren()
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

    public createDirectedEdge(parentName: string, childName: string): DirectedGraphBuilder {
        const parentNode = this.graph.nodes.find(node => node.name === parentName);
        const childNode = this.graph.nodes.find(node => node.name === childName);
        if (!parentNode || !childNode) {
            return this;
        }
        parentNode.addChild(childNode);
        childNode.addParent(parentNode);
        return this;
    }

    public build(): IDirectedGraph {
        return this.graph;
    }
}
