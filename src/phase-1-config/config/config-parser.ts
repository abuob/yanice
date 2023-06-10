import { DirectedGraphUtil, DirectedGraph } from '../directed-graph/directed-graph';
import {
    commandOutputOptionsType,
    YaniceCommandPerScope,
    YaniceConfig,
    YaniceConfigOptions,
    YaniceJsonType,
    YanicePluginOptions,
    YaniceProject
} from './config.interface';
import { YaniceCliArgs } from '../args-parser/cli-args.interface';

export class ConfigParser {
    public static readonly DEFAULT_CONFIG_OPTIONS: YaniceConfigOptions = {
        commandOutput: 'ignore',
        outputFilters: [],
        outputFolder: './.yanice-output',
        port: 4567
    };

    /**
     * Ensure that a valid yaniceJson is entered here (jsonschema-verified).
     */
    public static getYaniceConfig(yaniceJson: YaniceJsonType, yaniceCliArgs: YaniceCliArgs): YaniceConfig {
        return {
            options: ConfigParser.getConfigOptions(yaniceJson, yaniceCliArgs),
            projects: ConfigParser.getProjects(yaniceJson),
            plugins: ConfigParser.getPluginOptions(yaniceJson),
            dependencies: {
                ...ConfigParser.getDefaultDependencies(yaniceJson, yaniceCliArgs.defaultArgs.scope),
                ...ConfigParser.getExtendedDependencies(yaniceJson, yaniceCliArgs.defaultArgs.scope),
                ...ConfigParser.getDirectDependencies(yaniceJson, yaniceCliArgs.defaultArgs.scope)
            }
        };
    }

    public static supportsScopeCommand(yaniceConfig: YaniceConfig, projectName: string, scope: string | null): boolean {
        const yaniceProject: YaniceProject | undefined = yaniceConfig.projects.find(
            (project: YaniceProject): boolean => project.projectName === projectName
        );
        return !!yaniceProject && !!scope && Object.keys(yaniceProject.commands).includes(scope);
    }

    public static getDepGraphFromConfig(yaniceConfig: YaniceConfig): DirectedGraph | null {
        const dependencies: Record<string, string[] | undefined> = yaniceConfig.dependencies;
        const graphBuilder = DirectedGraphUtil.directedGraphBuilder;
        yaniceConfig.projects
            .map((p: YaniceProject): string => p.projectName)
            .forEach((projectName: string) => {
                graphBuilder.addNode(projectName);
            });
        Object.keys(dependencies).forEach((projectName) => {
            const dependenciesForProject: string[] = dependencies?.[projectName] ?? [];
            dependenciesForProject.forEach((dependencyName: string) => {
                graphBuilder.createDirectedEdge(projectName, dependencyName);
            });
        });
        return graphBuilder.build();
    }

    private static getProjects(yaniceJson: YaniceJsonType): YaniceProject[] {
        return yaniceJson.projects.map((project): YaniceProject => {
            const commandsRaw = project.commands || {};
            const commands: YaniceCommandPerScope = {};
            Object.keys(commandsRaw).forEach((scope: string) => {
                const singleCommand: string | null = commandsRaw[scope]?.command ?? null;
                const multiCommand: string[] = commandsRaw[scope]?.commands ?? [];
                const allCommands: string[] = singleCommand ? [singleCommand, ...multiCommand] : multiCommand;
                commands[scope] = {
                    commands: allCommands,
                    cwd: commandsRaw[scope]?.cwd || './'
                };
            });
            return {
                projectName: project.projectName,
                pathGlob: project.pathGlob ? project.pathGlob : '**',
                pathRegExp: project.pathRegExp ? new RegExp(project.pathRegExp) : /.*/,
                responsibles: project.responsibles ? project.responsibles : [],
                commands
            };
        });
    }

    private static getPluginOptions(yaniceJson: YaniceJsonType): YanicePluginOptions {
        return {
            custom: yaniceJson.plugins?.custom ?? {},
            officiallySupported: {
                'import-boundaries': yaniceJson.plugins?.officiallySupported?.['import-boundaries'] ?? null
            }
        };
    }

    private static getConfigOptions(yaniceJson: YaniceJsonType, yaniceCliArgs: YaniceCliArgs): YaniceConfigOptions {
        const scope: string | null = yaniceCliArgs.defaultArgs.scope;
        const outputModeFromArgs: commandOutputOptionsType | null = yaniceCliArgs.type === 'run' ? yaniceCliArgs.outputMode : null;
        const scopeOptions = !!scope ? yaniceJson.dependencyScopes[scope]?.options : undefined;
        const yaniceConfigOptions: YaniceConfigOptions = {
            port: scopeOptions?.port || yaniceJson.options?.port || ConfigParser.DEFAULT_CONFIG_OPTIONS.port,
            commandOutput:
                outputModeFromArgs ||
                scopeOptions?.commandOutput ||
                yaniceJson.options?.commandOutput ||
                ConfigParser.DEFAULT_CONFIG_OPTIONS.commandOutput,
            outputFolder:
                scopeOptions?.outputFolder || yaniceJson.options?.outputFolder || ConfigParser.DEFAULT_CONFIG_OPTIONS.outputFolder,
            outputFilters:
                scopeOptions?.outputFilters || yaniceJson.options?.outputFilters || ConfigParser.DEFAULT_CONFIG_OPTIONS.outputFilters
        };
        return yaniceConfigOptions;
    }

    /**
     * Creates an object with all projects depending on nothing (or just the default-dependencies).
     * We use this to initialize the final dependencies in the yaniceConfig-object, and to treat unlisted dependencies
     * equal to listed dependencies (so that we don't have to take care of this further down the road).
     * Examples:
     *    1) "dependencies: {}" is equal to "dependencies: { "A": []}" if there is only a project A
     *    2) "defaultDependencies: ["A"], "dependencies: { "B": ["C"] } with three projects A,B,C is equal to
     *       "dependencies: { "A": [], "B": ["C"], "C": ["A"]}"
     *
     */
    private static getDefaultDependencies(yaniceJson: YaniceJsonType, givenScope: string | null): Record<string, string[] | undefined> {
        if (!givenScope) {
            return {};
        }
        const initialDependencies: Record<string, string[] | undefined> = {};
        const defaultDependencies: string[] = yaniceJson.dependencyScopes[givenScope]?.defaultDependencies || [];
        yaniceJson.projects
            .map((project: YaniceJsonType['projects'][number]) => project.projectName)
            .forEach((projectName: string) => {
                initialDependencies[projectName] = defaultDependencies.includes(projectName) ? [] : defaultDependencies;
            });
        return initialDependencies;
    }

    private static getExtendedDependencies(yaniceJson: YaniceJsonType, givenScope: string | null): Record<string, string[] | undefined> {
        if (!givenScope) {
            return {};
        }
        const extendedScope: string | undefined = yaniceJson.dependencyScopes[givenScope]?.extends;
        if (!extendedScope) {
            return {};
        }
        return yaniceJson.dependencyScopes[extendedScope]?.dependencies ?? {};
    }

    private static getDirectDependencies(yaniceJson: YaniceJsonType, givenScope: string | null): Record<string, string[] | undefined> {
        if (!givenScope) {
            return {};
        }
        return yaniceJson.dependencyScopes[givenScope]?.dependencies ?? {};
    }
}
