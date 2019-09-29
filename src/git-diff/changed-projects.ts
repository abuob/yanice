import { IYaniceProject } from '../config/config-parser';
const minimatch = require('minimatch');

export class ChangedProjects {
    public static getChangedProjectsRaw(yaniceProjects: IYaniceProject[], changedFilePaths: string[]): string[] {
        return yaniceProjects
            .filter(project =>
                changedFilePaths.reduce(
                    (prev: boolean, curr: string) => prev || (project.pathRegExp.test(curr) && minimatch(curr, project.pathGlob)),
                    false
                )
            )
            .map(project => project.projectName);
    }
}
