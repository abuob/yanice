import { DirectedGraphUtil, IDirectedGraph } from '../dep-graph/directed-graph';

export interface IYaniceProject {
    projectName: string;
    pathRegExp: RegExp;
    pathGlob: string;
    commands: ICommandPerScope;
}

export interface IYaniceDependencyScope {
    [project: string]: string[];
}

export interface IYaniceCommand {
    command: string;
    cwd: string;
}

export interface ICommandPerScope {
    [scope: string]: IYaniceCommand;
}

export interface IYaniceJson {
    projects: Array<{
        projectName: string;
        pathRegExp?: string;
        pathGlob?: string;
        commands?: ICommandPerScope;
    }>;
    dependencyScopes: {
        [name: string]: IYaniceDependencyScope;
    };
}

export interface IYaniceConfig {
    projects: IYaniceProject[];
    dependencyScopes: {
        [name: string]: IYaniceDependencyScope;
    };
}

export class ConfigParser {
    /**
     * Ensure that a valid yaniceJson is entered here (jsonschema-verified).
     */
    public static getConfigFromYaniceJson(yaniceJson: IYaniceJson): IYaniceConfig {
        return {
            projects: yaniceJson.projects.map(
                (project): IYaniceProject => {
                    return {
                        projectName: project.projectName,
                        commands: project.commands ? project.commands : {},
                        pathGlob: project.pathGlob ? project.pathGlob : '**',
                        pathRegExp: project.pathRegExp ? new RegExp(project.pathRegExp) : /.*/
                    };
                }
            ),
            dependencyScopes: yaniceJson.dependencyScopes
        };
    }

    public static supportsScopeCommand(yaniceConfig: IYaniceConfig, projectName: string, scope: string): boolean {
        const yaniceProject = yaniceConfig.projects.find(project => project.projectName === projectName);
        return !!yaniceProject && Object.keys(yaniceProject.commands).includes(scope);
    }

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
                graphBuilder.createDirectedEdge(dependentProject, projectName);
            });
        });
        return graphBuilder.build();
    }
}
