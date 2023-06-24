import { YaniceProject } from '../phase-1-config/config/config.interface';
import { GlobTester } from './glob-tester';

export class ChangedProjects {
    public static getChangedProjectsRaw(yaniceProjects: YaniceProject[], changedFilePaths: string[]): string[] {
        return yaniceProjects
            .filter((project) =>
                changedFilePaths.some((changedFile: string): boolean => ChangedProjects.isFilePathPartOfProject(project, changedFile))
            )
            .map((project) => project.projectName);
    }

    public static isFilePathPartOfProject(yaniceProject: YaniceProject, filePath: string): boolean {
        return yaniceProject.pathRegExp.test(filePath) && GlobTester.isGlobMatching(filePath, yaniceProject.pathGlob);
    }
}
