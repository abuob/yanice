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

export class ConfigParser {}
