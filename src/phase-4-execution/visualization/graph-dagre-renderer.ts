import { YaniceCliArgsVisualize } from '../../phase-1-config/args-parser/cli-args.interface';
import { YaniceCommand, YaniceConfig, YaniceProject } from '../../phase-1-config/config/config.interface';
import { DirectedGraph, DirectedGraphNode, DirectedGraphUtil } from '../../phase-1-config/directed-graph/directed-graph';
import { ChangedProjects } from '../../phase-3-project-changes/changed-projects';

interface YaniceGraphNodeInfo {
    projectName: string;
    scope: string;
    parents: string[];
    children: string[];
    ancestors: string[];
    descendants: string[];
    responsibles: string[];
    changedFiles: string[];
    isAffected: boolean;
    command: YaniceCommand | null;
    pathGlob: string;
    pathRegExp: string;
}

export class GraphDagreRenderer {
    public static getGraphData(
        depGraph: DirectedGraph,
        yaniceConfig: YaniceConfig,
        yaniceVisualizeArgs: YaniceCliArgsVisualize,
        affectedProjects: string[],
        changedFiles: string[]
    ): YaniceGraphNodeInfo[] {
        return depGraph.nodes
            .map((node: DirectedGraphNode): YaniceGraphNodeInfo | null => {
                const projectOrUndefined = yaniceConfig.projects.find((project: YaniceProject) => project.projectName === node.name);
                const scope: string | null = yaniceVisualizeArgs.defaultArgs.scope;
                if (!scope) {
                    return null;
                }
                return {
                    projectName: node.name,
                    scope,
                    parents: node.getParents().map((e) => e.name),
                    children: node.getChildren().map((e) => e.name),
                    ancestors: DirectedGraphUtil.getAncestorsAndSelfForSingleNode(depGraph, node.name),
                    descendants: DirectedGraphUtil.getDescendantsAndSelfForSingleNode(depGraph, node.name),
                    responsibles: projectOrUndefined ? projectOrUndefined.responsibles : [],
                    changedFiles: projectOrUndefined
                        ? changedFiles.filter((filePath) => ChangedProjects.isFilePathPartOfProject(projectOrUndefined, filePath))
                        : [],
                    isAffected: affectedProjects.includes(node.name),
                    command: projectOrUndefined ? projectOrUndefined.commands[scope] || null : null,
                    pathGlob: projectOrUndefined ? projectOrUndefined.pathGlob : '**',
                    pathRegExp: projectOrUndefined ? projectOrUndefined.pathRegExp.toString() : '.*'
                };
            })
            .reduce(
                (prev: YaniceGraphNodeInfo[], curr: YaniceGraphNodeInfo | null): YaniceGraphNodeInfo[] => (curr ? prev.concat(curr) : prev),
                []
            );
    }
}
