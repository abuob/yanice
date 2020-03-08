import { DirectedGraphUtil, IDirectedGraph } from '../dep-graph/directed-graph';
import { IYaniceArgs } from './args-parser';
import { ICommandPerScope, IYaniceConfig, IYaniceConfigOptions, IYaniceJson, IYaniceProject } from './config.interface';

export class ConfigParser {
    public static readonly DEFAULT_CONFIG_OPTIONS: IYaniceConfigOptions = {
        commandOutput: 'ignore',
        outputFilters: [],
        outputFolder: './.yanice-output',
        port: 4567
    };

    /**
     * Ensure that a valid yaniceJson is entered here (jsonschema-verified).
     */
    public static getYaniceConfig(yaniceJson: IYaniceJson, yaniceArgs: IYaniceArgs): IYaniceConfig {
        return {
            options: this.getConfigOptions(yaniceJson, yaniceArgs),
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
            dependencies: yaniceJson.dependencyScopes[yaniceArgs.givenScope].dependencies
        };
    }

    public static supportsScopeCommand(yaniceConfig: IYaniceConfig, projectName: string, scope: string): boolean {
        const yaniceProject = yaniceConfig.projects.find(project => project.projectName === projectName);
        return !!yaniceProject && Object.keys(yaniceProject.commands).includes(scope);
    }

    public static getDepGraphFromConfigByScope(yaniceConfig: IYaniceConfig): IDirectedGraph | null {
        const dependencies = yaniceConfig.dependencies;
        const graphBuilder = DirectedGraphUtil.directedGraphBuilder;
        yaniceConfig.projects
            .map(p => p.projectName)
            .forEach(projectName => {
                graphBuilder.addNode(projectName);
            });
        Object.keys(dependencies).forEach(projectName => {
            dependencies[projectName].forEach(dependentProject => {
                graphBuilder.createDirectedEdge(dependentProject, projectName);
            });
        });
        return graphBuilder.build();
    }

    private static getConfigOptions(yaniceJson: IYaniceJson, yaniceArgs: IYaniceArgs): IYaniceConfigOptions {
        const scopeOptions = yaniceJson.dependencyScopes[yaniceArgs.givenScope].options;
        const yaniceConfigOptions: IYaniceConfigOptions = {
            port: scopeOptions?.port || yaniceJson.options?.port || this.DEFAULT_CONFIG_OPTIONS.port,
            commandOutput:
                yaniceArgs.commandOutputMode ||
                scopeOptions?.commandOutput ||
                yaniceJson.options?.commandOutput ||
                this.DEFAULT_CONFIG_OPTIONS.commandOutput,
            outputFolder: scopeOptions?.outputFolder || yaniceJson.options?.outputFolder || this.DEFAULT_CONFIG_OPTIONS.outputFolder,
            outputFilters: scopeOptions?.outputFilters || yaniceJson.options?.outputFilters || this.DEFAULT_CONFIG_OPTIONS.outputFilters
        };
        return yaniceConfigOptions;
    }
}
