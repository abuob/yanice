import { DirectedGraph } from '../../phase-1-config/directed-graph/directed-graph';

export class GraphDotRenderer {
    public static getDotRepresentation(directedGraph: DirectedGraph): string {
        return `digraph {${GraphDotRenderer.getAllNodeDeclarations(directedGraph)} ${GraphDotRenderer.getAllEdgeDeclarations(
            directedGraph
        )}}`;
    }

    private static getAllNodeDeclarations(directedGraph: DirectedGraph): string {
        return Array.from(directedGraph.nodes)
            .map((node) => `${GraphDotRenderer.getDotConformNodeName(node.name)} [label="${node.name}"];`)
            .join('');
    }

    private static getAllEdgeDeclarations(directedGraph: DirectedGraph): string {
        return Array.from(directedGraph.nodes)
            .map((ancestor): string => {
                const definitionPerChild: string[] = ancestor.getChildren().map((child): string => {
                    const nodeNameDot: string = GraphDotRenderer.getDotConformNodeName(ancestor.name);
                    const childNameDot: string = GraphDotRenderer.getDotConformNodeName(child.name);
                    return `${nodeNameDot} -> ${childNameDot};`;
                });
                return definitionPerChild.join('');
            })
            .join('');
    }

    private static getDotConformNodeName(projectName: string): string {
        return projectName.replace(/-/g, '_');
    }
}
