export interface IYaniceProject {
    projectName: string;
    projectRoot: string;
}

export interface IYaniceConfig {
    projects: IYaniceProject[];
}

export class ConfigParser {}
