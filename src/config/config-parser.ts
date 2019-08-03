import { DirectedGraphUtil, IDirectedGraph } from '../dep-graph/directed-graph';

export interface IYaniceProject {
    projectName: string;
    rootDir: string;
}

export interface IYaniceDependencyScope {
    [project: string]: string[];
}

export interface IYaniceConfig {
    projects: IYaniceProject[];
    dependencyScopes: {
        [name: string]: IYaniceDependencyScope;
    };
}

export class ConfigParser {
    public static getDepGraphFromConfigByScope(yaniceConfig: IYaniceConfig, scope: string): IDirectedGraph | null {
        const depScope: IYaniceDependencyScope = yaniceConfig.dependencyScopes[scope];
        if (!depScope) {
            return null;
        }
        const graphBuilder = DirectedGraphUtil.directedGraphBuilder;
        Object.keys(depScope).forEach(projectName => {
            graphBuilder.addNode(projectName);
        });
        Object.keys(depScope).forEach(projectName => {
            depScope[projectName].forEach(dependentProject => {
                graphBuilder.createDirectedEdge(projectName, dependentProject);
            });
        });
        return graphBuilder.build();
    }
}
