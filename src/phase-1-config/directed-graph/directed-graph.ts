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

export interface DirectedGraph {
    nodes: DirectedGraphNode[];
}

interface CycleSearchIntermediateResult {
    cycles: string[][];
    visitedAlready: DirectedGraphNode[];
}

/**
 * For terminology, see: https://en.wikipedia.org/wiki/Tree_(data_structure)#Terminology_used_in_trees
 * (Not everywhere consequentially used yet)
 */
export class DirectedGraphUtil {
    public static get directedGraphBuilder(): DirectedGraphBuilder {
        return new DirectedGraphBuilder();
    }

    public static hasCycle(graph: DirectedGraph): boolean {
        const visitedAlready: DirectedGraphNode[] = [];
        for (const node of graph.nodes) {
            if (DirectedGraphUtil.hasCycleRecursive(node, visitedAlready, [])) {
                return true;
            }
            visitedAlready.push(node);
        }
        return false;
    }

    public static findCycles(graph: DirectedGraph): string[][] {
        const start: CycleSearchIntermediateResult = {
            cycles: [],
            visitedAlready: []
        };
        const result: CycleSearchIntermediateResult = graph.nodes.reduce(
            (prev: CycleSearchIntermediateResult, curr: DirectedGraphNode): CycleSearchIntermediateResult => {
                return DirectedGraphUtil.findCycleRecursively(curr, prev, []);
            },
            start
        );
        return result.cycles;
    }

    public static getAncestorsOfMultipleNodes(graph: DirectedGraph, nodeNames: string[]): string[] {
        return nodeNames
            .map<string[]>((nodeName) => {
                const givenNode = DirectedGraphUtil.getNodeByName(graph, nodeName);
                if (!givenNode) {
                    return [];
                }
                return DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph, nodeName).filter(
                    (ancestorOrSelf) => ancestorOrSelf !== nodeName
                );
            })
            .reduce<string[]>((prev, curr) => prev.concat(curr), [])
            .reduce<string[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
    }

    public static getDescendantsOfMultipleNodes(graph: DirectedGraph, nodeNames: string[]): string[] {
        return nodeNames
            .map<string[]>((nodeName) => {
                const givenNode = DirectedGraphUtil.getNodeByName(graph, nodeName);
                if (!givenNode) {
                    return [];
                }
                return DirectedGraphUtil.getDescendantsAndSelfForSingleNode(graph, nodeName).filter(
                    (descendantOrSelf) => descendantOrSelf !== nodeName
                );
            })
            .reduce<string[]>((prev, curr) => prev.concat(curr), [])
            .reduce<string[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
    }

    public static getAncestorsAndSelfOfMultipleNodes(graph: DirectedGraph, nodeNames: string[]): string[] {
        return DirectedGraphUtil.getAncestorsOfMultipleNodes(graph, nodeNames)
            .concat(nodeNames)
            .reduce<string[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
    }

    public static getDescendantsAndSelfOfMultipleNodes(graph: DirectedGraph, nodeNames: string[]): string[] {
        return DirectedGraphUtil.getDescendantsOfMultipleNodes(graph, nodeNames)
            .concat(nodeNames)
            .reduce<string[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
    }

    public static getAncestorsAndSelfForSingleNode(graph: DirectedGraph, nodeName: string): string[] {
        const givenNode = DirectedGraphUtil.getNodeByName(graph, nodeName);
        if (!givenNode) {
            return [];
        }
        return DirectedGraphUtil.getAncestorsAndSelfOfSingleNodeRecursively(givenNode).map((n) => n.name);
    }

    public static getDescendantsAndSelfForSingleNode(graph: DirectedGraph, nodeName: string): string[] {
        const givenNode = DirectedGraphUtil.getNodeByName(graph, nodeName);
        if (!givenNode) {
            return [];
        }
        return DirectedGraphUtil.getDescendantsAndSelfOfSingleNodeRecursively(givenNode).map((n) => n.name);
    }

    /**
     * Implementation as per https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
     */
    public static getTopologicallySorted(graph: DirectedGraph, nodeNames: string[]): string[] {
        const alreadySorted: string[] = [];
        const tmpMarked = new Set<string>();
        const permanentMarked = new Set<string>();
        while (graph.nodes.length !== permanentMarked.size) {
            const unmarkedNode = graph.nodes.find((node) => !permanentMarked.has(node.name));
            if (unmarkedNode) {
                DirectedGraphUtil.getTopologicallySortedVisit(graph, unmarkedNode, tmpMarked, permanentMarked, alreadySorted);
            } else {
                throw new Error('Cannot establish topological ordering; is your graph indeed a DAG?');
            }
        }
        return alreadySorted.filter((n) => nodeNames.includes(n));
    }

    public static getTopologicallySortedReverse(graph: DirectedGraph, nodeNames: string[]): string[] {
        return DirectedGraphUtil.getTopologicallySorted(graph, nodeNames).reverse();
    }

    public static isAncestorOf(graph: DirectedGraph, ancestor: string, descendant: string, allowReflexive: boolean): boolean {
        if (ancestor === descendant) {
            return allowReflexive;
        }
        return DirectedGraphUtil.getAncestorsAndSelfForSingleNode(graph, descendant).includes(ancestor);
    }

    /**
     * visitor-function for getTopologicallySorted; as per https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
     */
    private static getTopologicallySortedVisit(
        graph: DirectedGraph,
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
        currentNode
            .getChildren()
            .forEach((n) => DirectedGraphUtil.getTopologicallySortedVisit(graph, n, tmpMarked, permanentMarked, alreadySorted));
        tmpMarked.delete(currentNode.name);
        permanentMarked.add(currentNode.name);
        alreadySorted.unshift(currentNode.name);
    }

    private static getAncestorsAndSelfOfSingleNodeRecursively(node: DirectedGraphNode): DirectedGraphNode[] {
        if (node.getParents().length === 0) {
            return [node];
        }
        return node
            .getParents()
            .map((n) => DirectedGraphUtil.getAncestorsAndSelfOfSingleNodeRecursively(n))
            .reduce<DirectedGraphNode[]>((prev, curr) => prev.concat(curr), [node])
            .reduce<DirectedGraphNode[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
    }

    private static getDescendantsAndSelfOfSingleNodeRecursively(node: DirectedGraphNode): DirectedGraphNode[] {
        if (node.getChildren().length === 0) {
            return [node];
        }
        return node
            .getChildren()
            .map((n) => DirectedGraphUtil.getDescendantsAndSelfOfSingleNodeRecursively(n))
            .reduce<DirectedGraphNode[]>((prev, curr) => prev.concat(curr), [node])
            .reduce<DirectedGraphNode[]>(DirectedGraphUtil.noDuplicatesAccumulate, []);
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
            .map((connectedNode) => DirectedGraphUtil.hasCycleRecursive(connectedNode, visitedAlready, nodesInDfsTraversal.concat(node)))
            .reduce((prev, curr) => prev || curr, false);
    }

    private static findCycleRecursively(
        currentNode: DirectedGraphNode,
        cycleSearchIntermediateResult: CycleSearchIntermediateResult,
        nodesInDfsTraversal: DirectedGraphNode[]
    ): CycleSearchIntermediateResult {
        if (nodesInDfsTraversal.includes(currentNode)) {
            const nodesInCycle: DirectedGraphNode[] = nodesInDfsTraversal.slice(nodesInDfsTraversal.indexOf(currentNode));
            const nodesInCycleNames: string[] = nodesInCycle.map((node: DirectedGraphNode) => node.name);
            return {
                cycles: [...cycleSearchIntermediateResult.cycles, nodesInCycleNames],
                visitedAlready: cycleSearchIntermediateResult.visitedAlready.concat(currentNode)
            };
        }
        if (cycleSearchIntermediateResult.visitedAlready.includes(currentNode)) {
            return cycleSearchIntermediateResult;
        }
        const children: DirectedGraphNode[] = currentNode.getChildren();
        return children.reduce((prev: CycleSearchIntermediateResult, currentChild: DirectedGraphNode): CycleSearchIntermediateResult => {
            return DirectedGraphUtil.findCycleRecursively(currentChild, prev, nodesInDfsTraversal.concat(currentNode));
        }, cycleSearchIntermediateResult);
    }

    private static getNodeByName(graph: DirectedGraph, name: string): DirectedGraphNode | null {
        return graph.nodes.find((n) => n.name === name) || null;
    }

    private static noDuplicatesAccumulate<T>(prev: T[], curr: T): T[] {
        return prev.includes(curr) ? prev : prev.concat([curr]);
    }
}

class DirectedGraphBuilder {
    private graph: DirectedGraph = {
        nodes: []
    };

    public addNode(name: string): DirectedGraphBuilder {
        if (this.graph.nodes.map((n) => n.name).includes(name)) {
            throw Error(`Cannot add a node with name "${name}" to the graph, such a node already exists!`);
        }
        this.graph.nodes = this.graph.nodes.concat(new DirectedGraphNode(name));
        return this;
    }

    public createDirectedEdge(parentName: string, childName: string): DirectedGraphBuilder {
        const parentNode = this.graph.nodes.find((node) => node.name === parentName);
        const childNode = this.graph.nodes.find((node) => node.name === childName);
        if (!parentNode || !childNode) {
            return this;
        }
        parentNode.addChild(childNode);
        childNode.addParent(parentNode);
        return this;
    }

    public build(): DirectedGraph {
        return this.graph;
    }
}
export type { DirectedGraphBuilder };
