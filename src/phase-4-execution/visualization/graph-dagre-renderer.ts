import { YaniceArgs } from '../../phase-1-config/config/args-parser';
import { YaniceCommand, YaniceConfig, YaniceProject } from '../../phase-1-config/config/config.interface';
import { DirectedGraphNode, DirectedGraphUtil, DirectedGraph } from '../../phase-1-config/directed-graph/directed-graph';
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
        yaniceArgs: YaniceArgs,
        affectedProjects: string[],
        changedFiles: string[]
    ): YaniceGraphNodeInfo[] {
        return depGraph.nodes.map((node: DirectedGraphNode): YaniceGraphNodeInfo => {
            const projectOrUndefined = yaniceConfig.projects.find((project: YaniceProject) => project.projectName === node.name);
            return {
                projectName: node.name,
                scope: yaniceArgs.givenScope,
                parents: node.getParents().map((e) => e.name),
                children: node.getChildren().map((e) => e.name),
                ancestors: DirectedGraphUtil.getAncestorsAndSelfForSingleNode(depGraph, node.name),
                descendants: DirectedGraphUtil.getDescendantsAndSelfForSingleNode(depGraph, node.name),
                responsibles: projectOrUndefined ? projectOrUndefined.responsibles : [],
                changedFiles: projectOrUndefined
                    ? changedFiles.filter((filePath) => ChangedProjects.isFilePathPartOfProject(projectOrUndefined, filePath))
                    : [],
                isAffected: affectedProjects.includes(node.name),
                command: projectOrUndefined ? projectOrUndefined.commands[yaniceArgs.givenScope] || null : null,
                pathGlob: projectOrUndefined ? projectOrUndefined.pathGlob : '**',
                pathRegExp: projectOrUndefined ? projectOrUndefined.pathRegExp.toString() : '.*'
            };
        });
    }
}