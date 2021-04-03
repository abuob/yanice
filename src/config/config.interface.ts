import { commandOutputFilterType } from '../util/output-filter';

export type commandOutputOptionsType = 'ignore' | 'append-at-end' | 'append-at-end-on-error';

interface IOptionalOptions {
    commandOutput?: commandOutputOptionsType;
    outputFilters?: commandOutputFilterType[];
    outputFolder?: string;
    port?: number;
}

// This is the interface describing the content of the 'yanice.json'-file. It should adhere and is validated against
// jsonschema (schema.json). This interface is only used for when we initially read the config-file; later, we only want to work
// with the IYaniceConfig, where all options etc. are set to default if undefined.
export interface IYaniceJson {
    options?: IOptionalOptions;
    schemaVersion: number;
    projects: {
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
    }[];
    dependencyScopes: {
        [scope: string]: {
            defaultDependencies?: string[];
            extends?: string;
            options?: IOptionalOptions;
            dependencies: IProjectDependencies;
        };
    };
}

export interface IYaniceProject {
    projectName: string;
    pathRegExp: RegExp;
    pathGlob: string;
    commands: ICommandPerScope;
    responsibles: string[];
}

export interface IProjectDependencies {
    [projectName: string]: string[];
}

export interface IYaniceCommand {
    command: string;
    cwd: string;
}

export interface ICommandPerScope {
    [scope: string]: IYaniceCommand;
}

export interface IYaniceConfigOptions {
    commandOutput: commandOutputOptionsType;
    outputFilters: commandOutputFilterType[];
    outputFolder: string;
    port: number;
}

export interface IYaniceConfig {
    options: IYaniceConfigOptions;
    projects: IYaniceProject[];
    dependencies: IProjectDependencies;
}
