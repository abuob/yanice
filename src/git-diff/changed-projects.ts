import { IYaniceProject } from '../config/config.interface';

const minimatch = require('minimatch');

export class ChangedProjects {
    public static getChangedProjectsRaw(yaniceProjects: IYaniceProject[], changedFilePaths: string[]): string[] {
        return yaniceProjects
            .filter((project) =>
                changedFilePaths.some((changedFile: string): boolean => ChangedProjects.isFilePathPartOfProject(project, changedFile))
            )
            .map((project) => project.projectName);
    }

    public static isFilePathPartOfProject(yaniceProject: IYaniceProject, filePath: string): boolean {
        return yaniceProject.pathRegExp.test(filePath) && minimatch(filePath, yaniceProject.pathGlob, { dot: true });
    }
}
