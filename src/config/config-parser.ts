import { DirectedGraphUtil, IDirectedGraph } from '../dep-graph/directed-graph';
import { IYaniceArgs } from './args-parser';
import {
    ICommandPerScope,
    IProjectDependencies,
    IYaniceConfig,
    IYaniceConfigOptions,
    IYaniceJson,
    IYaniceProject
} from './config.interface';

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
            projects: this.getProjects(yaniceJson),
            dependencies: {
                ...this.getEmptyDependencies(yaniceJson),
                ...this.getExtendedDependencies(yaniceJson, yaniceArgs.givenScope),
                ...this.getDirectDependencies(yaniceJson, yaniceArgs.givenScope)
            }
        };
    }

    public static supportsScopeCommand(yaniceConfig: IYaniceConfig, projectName: string, scope: string): boolean {
        const yaniceProject = yaniceConfig.projects.find(project => project.projectName === projectName);
        return !!yaniceProject && Object.keys(yaniceProject.commands).includes(scope);
    }

    public static getDepGraphFromConfig(yaniceConfig: IYaniceConfig): IDirectedGraph | null {
        const dependencies = yaniceConfig.dependencies;
        const graphBuilder = DirectedGraphUtil.directedGraphBuilder;
        yaniceConfig.projects
            .map(p => p.projectName)
            .forEach(projectName => {
                graphBuilder.addNode(projectName);
            });
        Object.keys(dependencies).forEach(projectName => {
            dependencies[projectName].forEach(dependencyName => {
                graphBuilder.createDirectedEdge(projectName, dependencyName);
            });
        });
        return graphBuilder.build();
    }

    private static getProjects(yaniceJson: IYaniceJson): IYaniceProject[] {
        return yaniceJson.projects.map(
            (project): IYaniceProject => {
                const commandsRaw = project.commands || {};
                const commands: ICommandPerScope = {};
                Object.keys(commandsRaw).forEach(scope => {
                    commands[scope] = {
                        command: commandsRaw[scope].command,
                        cwd: commandsRaw[scope].cwd || './'
                    };
                });
                return {
                    projectName: project.projectName,
                    pathGlob: project.pathGlob ? project.pathGlob : '**',
                    pathRegExp: project.pathRegExp ? new RegExp(project.pathRegExp) : /.*/,
                    responsibles: project.responsibles ? project.responsibles : [],
                    commands
                };
            }
        );
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

    // Creates an object with all projects depending on nothing. Use this to treat unlisted projects equal as listed projects with no dependencies;
    // i.e.: "dependencies: {}" is equal to "dependencies: { "A": []}"
    private static getEmptyDependencies(yaniceJson: IYaniceJson): IProjectDependencies {
        const emptyDependencies: IProjectDependencies = {};
        yaniceJson.projects
            .map(p => p.projectName)
            .forEach(projectName => {
                emptyDependencies[projectName] = [];
            });
        return emptyDependencies;
    }

    private static getExtendedDependencies(yaniceJson: IYaniceJson, givenScope: string): IProjectDependencies {
        const extendedScope: string | undefined = yaniceJson.dependencyScopes[givenScope].extends;
        if (!extendedScope) {
            return {};
        }
        return yaniceJson.dependencyScopes[extendedScope].dependencies;
    }

    private static getDirectDependencies(yaniceJson: IYaniceJson, givenScope: string): IProjectDependencies {
        return yaniceJson.dependencyScopes[givenScope].dependencies;
    }
}
