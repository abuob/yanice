import { IYaniceProject } from '../config/config-parser';
const minimatch = require('minimatch');

export class ChangedProjects {
    public static getChangedProjectsRaw(yaniceProjects: IYaniceProject[], changedFilePaths: string[]): string[] {
        return yaniceProjects
            .filter(
                project =>
                    !!changedFilePaths.find(
                        (changedFile: string): boolean => project.pathRegExp.test(changedFile) && minimatch(changedFile, project.pathGlob)
                    )
            )
            .map(project => project.projectName);
    }
}
