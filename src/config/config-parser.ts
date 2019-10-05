import { DirectedGraphUtil, IDirectedGraph } from '../dep-graph/directed-graph';

export interface IYaniceJson {
    projects: Array<{
        projectName: string;
        pathRegExp?: string;
        pathGlob?: string;
        commands?: {
            [scope: string]: {
                command: string;
                cwd?: string;
            };
        };
        responsibles?: string[];
    }>;
    dependencyScopes: {
        [name: string]: IYaniceDependencyScope;
    };
}

export interface IYaniceProject {
    projectName: string;
    pathRegExp: RegExp;
    pathGlob: string;
    commands: ICommandPerScope;
    responsibles: string[];
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
                    // TODO Check if we can simplify this.
                    // Looks complicated (sorry for that) but essentially we're just ensuring that:
                    // * commands is never undefined; if no commands are declared in the yanice.json, commands is an empty object
                    // * if for a command no cwd is given, use './' as default (cwd is never undefined on IYaniceConfig).
                    const commands = project.commands
                        ? Object.keys(project.commands).reduce((prev: ICommandPerScope, curr: string): ICommandPerScope => {
                              if (!project.commands || !project.commands[curr]) {
                                  return prev;
                              }
                              const cwd: string =
                                  project.commands[curr] && project.commands[curr].cwd ? (project.commands[curr].cwd as string) : './';
                              prev[curr] = {
                                  command: project.commands[curr].command,
                                  cwd
                              };
                              return prev;
                          }, {})
                        : {};

                    return {
                        projectName: project.projectName,
                        commands,
                        pathGlob: project.pathGlob ? project.pathGlob : '**',
                        pathRegExp: project.pathRegExp ? new RegExp(project.pathRegExp) : /.*/,
                        responsibles: project.responsibles ? project.responsibles : []
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
