export interface IYaniceProject {
    projectName: string;
    rootDir: string;
}

export interface IYaniceConfig {
    projects: IYaniceProject[];
}

export class ConfigParser {}
