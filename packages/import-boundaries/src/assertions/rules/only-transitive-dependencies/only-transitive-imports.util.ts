import { DirectedGraph, DirectedGraphNode, DirectedGraphUtil } from 'yanice';

export class OnlyTransitiveImportsUtil {
    public static getAllowedDependenciesMap(directedGraph: DirectedGraph): Record<string, string[]> {
        return directedGraph.nodes.reduce(
            (allowedDependenciesMap: Record<string, string[]>, node: DirectedGraphNode): Record<string, string[]> => {
                allowedDependenciesMap[node.name] = DirectedGraphUtil.getAncestorsAndSelfForSingleNode(directedGraph, node.name);
                return allowedDependenciesMap;
            },
            {}
        );
    }
}
