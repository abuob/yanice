import { IYaniceProject } from '../config/config-parser';

export class ChangedProjects {
    public static getChangedProjectsRaw(yaniceProjects: IYaniceProject[], changedFilePaths: string[]): string[] {
        return yaniceProjects
            .filter(project =>
                changedFilePaths.reduce(
                    (prev: boolean, curr: string) => prev || this.getProjectRootDirRegExp(project.rootDir).test(curr),
                    false
                )
            )
            .map(project => project.projectName);
    }

    private static getProjectRootDirRegExp(rootDir: string): RegExp {
        if (rootDir.charAt(rootDir.length - 1) === '/') {
            return new RegExp(rootDir);
        }
        return new RegExp(`${rootDir}/`);
    }
}
