import { DirectedGraph, DirectedGraphNode } from 'yanice';

export class OnlyDirectImportsUtil {
    public static getAllowedDependenciesMap(directedGraph: DirectedGraph): Record<string, string[]> {
        return Array.from(directedGraph.nodes).reduce(
            (allowedDependenciesMap: Record<string, string[]>, node: DirectedGraphNode): Record<string, string[]> => {
                allowedDependenciesMap[node.name] = node.getChildren().map((childNode: DirectedGraphNode): string => childNode.name);
                return allowedDependenciesMap;
            },
            {}
        );
    }
}
