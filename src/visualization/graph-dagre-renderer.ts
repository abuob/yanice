import { IYaniceArgs } from '../config/args-parser';
import { IYaniceCommand, IYaniceConfig } from '../config/config.interface';
import { IDirectedGraph } from '../directed-graph/directed-graph';
import { ChangedProjects } from '../git-diff/changed-projects';

interface IYaniceGraphNodeInfo {
    projectName: string;
    scope: string;
    edgesTo: string[];
    responsibles: string[];
    changedFiles: string[];
    isAffected: boolean;
    command: IYaniceCommand | null;
    pathGlob: string;
    pathRegExp: string;
}

export class GraphDagreRenderer {
    public static getGraphData(
        depGraph: IDirectedGraph,
        yaniceConfig: IYaniceConfig,
        yaniceArgs: IYaniceArgs,
        affectedProjects: string[],
        changedFiles: string[]
    ): IYaniceGraphNodeInfo[] {
        const graphData = depGraph.nodes.map(
            (node): IYaniceGraphNodeInfo => {
                const projectOrUndefined = yaniceConfig.projects.find(project => project.projectName === node.name);
                return {
                    projectName: node.name,
                    scope: yaniceArgs.givenScope,
                    edgesTo: node.getChildren().map(e => e.name),
                    responsibles: projectOrUndefined ? projectOrUndefined.responsibles : [],
                    changedFiles: projectOrUndefined
                        ? changedFiles.filter(filePath => ChangedProjects.isFilePathPartOfProject(projectOrUndefined, filePath))
                        : [],
                    isAffected: affectedProjects.includes(node.name),
                    command: projectOrUndefined ? projectOrUndefined.commands[yaniceArgs.givenScope] || null : null,
                    pathGlob: projectOrUndefined ? projectOrUndefined.pathGlob : '**',
                    pathRegExp: projectOrUndefined ? projectOrUndefined.pathRegExp.toString() : '.*'
                };
            }
        );
        return graphData;
    }
}
