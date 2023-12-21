import path from 'node:path';

import { YaniceProject } from '../phase-1-config/config/config.interface';
import { GlobTester } from './glob-tester';

export class ChangedProjects {
    /**
     * @param yaniceJsonDirectoryPath
     * @param yaniceProjects
     * @param relativeFilePaths file paths relative to the yanice.json
     */
    public static getChangedProjectsRaw(
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[],
        relativeFilePaths: string[]
    ): string[] {
        return yaniceProjects
            .filter((project: YaniceProject): boolean => {
                return relativeFilePaths.some((changedFile: string): boolean =>
                    ChangedProjects.isFilePathPartOfProject(yaniceJsonDirectoryPath, project, changedFile)
                );
            })
            .map((project: YaniceProject): string => project.projectName);
    }

    public static isFilePathPartOfProject(yaniceJsonDirectoryPath: string, yaniceProject: YaniceProject, filePath: string): boolean {
        return (
            (!yaniceProject.pathRegExp || yaniceProject.pathRegExp.test(filePath)) &&
            (!yaniceProject.pathGlob || GlobTester.isGlobMatching(filePath, yaniceProject.pathGlob)) &&
            (!yaniceProject.projectFolder ||
                ChangedProjects.isFileWithinDirectory(yaniceJsonDirectoryPath, yaniceProject.projectFolder, filePath))
        );
    }

    /**
     *
     * @param yaniceJsonDirectoryPath
     * @param relativeDirectory directory path relative to yanice.json
     * @param relativeFilePath file path relative to yanice.json
     */
    public static isFileWithinDirectory(yaniceJsonDirectoryPath: string, relativeDirectory: string, relativeFilePath: string): boolean {
        const absoluteDirPath: string = path.join(yaniceJsonDirectoryPath, relativeDirectory);
        const absoluteFilePath: string = path.join(yaniceJsonDirectoryPath, relativeFilePath);
        const relativePath: string = path.relative(absoluteDirPath, absoluteFilePath);
        return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    }
}
