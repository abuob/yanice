import { IYaniceArgs } from '../config/args-parser';
import { ConfigParser, IYaniceConfig } from '../config/config-parser';
import { IDirectedGraph } from '../dep-graph/directed-graph';
import { ChangedProjects } from '../git-diff/changed-projects';

interface IYaniceGraphNodeInfo {
    projectName: string;
    edgesTo: string[];
    responsibles: string[];
    affectedFiles: string[];
    isAffected: boolean;
    hasCommandForScope: boolean;
}

export class GraphDagreRenderer {
    public static getGraphData(
        depGraph: IDirectedGraph,
        yaniceConfig: IYaniceConfig,
        yaniceArgs: IYaniceArgs,
        affectedProjects: string[],
        changedFiles: string[]
    ): IYaniceGraphNodeInfo[] {
        return depGraph.nodes.map(node => ({
            projectName: node.name,
            edgesTo: node.edgesTo.map(e => e.name),
            responsibles: yaniceConfig.projects
                .filter(p => p.projectName === node.name)
                .map(p => p.responsibles)
                .reduce((curr, prev): string[] => curr.concat(prev), []),
            affectedFiles: changedFiles.filter(filePath =>
                yaniceConfig.projects.some(p => p.projectName === node.name && ChangedProjects.isFilePathPartOfProject(p, filePath))
            ),
            isAffected: affectedProjects.includes(node.name),
            hasCommandForScope: ConfigParser.supportsScopeCommand(yaniceConfig, node.name, yaniceArgs.givenScope)
        }));
    }
}
