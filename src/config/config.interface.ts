import { commandOutputFilterType } from '../util/output-filter';

export type commandOutputOptionsType = 'append-at-end-on-error' | 'append-at-end' | 'ignore';

interface YaniceOptionalOptions {
    commandOutput?: commandOutputOptionsType;
    outputFilters?: commandOutputFilterType[];
    outputFolder?: string;
    port?: number;
}

// This is the interface describing the content of the 'yanice.json'-file. It should adhere and is validated against
// jsonschema (schema.json). This interface is only used for when we initially read the config-file; later, we only want to work
// with the YaniceConfig, where all options etc. are set to default if undefined.
export interface YaniceJsonType {
    options?: YaniceOptionalOptions;
    schemaVersion: number;
    projects: {
        projectName: string;
        pathRegExp?: string;
        pathGlob?: string;
        commands?: {
            [scope: string]: {
                command?: string;
                commands?: string[];
                cwd?: string;
            };
        };
        responsibles?: string[];
    }[];
    dependencyScopes: {
        [scope: string]: {
            defaultDependencies?: string[];
            extends?: string;
            options?: YaniceOptionalOptions;
            dependencies: Record<string, string[] | undefined>;
        };
    };
}

export interface YaniceProject {
    projectName: string;
    pathRegExp: RegExp;
    pathGlob: string;
    commands: YaniceCommandPerScope;
    responsibles: string[];
}

export interface YaniceCommand {
    commands: string[];
    cwd: string;
}

export interface YaniceCommandPerScope {
    [scope: string]: YaniceCommand;
}

export interface YaniceConfigOptions {
    commandOutput: commandOutputOptionsType;
    outputFilters: commandOutputFilterType[];
    outputFolder: string;
    port: number;
}

export interface YaniceConfig {
    options: YaniceConfigOptions;
    projects: YaniceProject[];
    dependencies: Record<string, string[] | undefined>;
}
