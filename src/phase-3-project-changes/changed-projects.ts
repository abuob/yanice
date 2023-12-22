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
                return relativeFilePaths.some((relativeFilePath: string): boolean =>
                    ChangedProjects.isFilePathPartOfProject(yaniceJsonDirectoryPath, project, relativeFilePath)
                );
            })
            .map((project: YaniceProject): string => project.projectName);
    }

    /**
     * @param yaniceJsonDirectoryPath
     * @param yaniceProject
     * @param relativeFilePath file path relative to the yanice.json
     */
    public static isFilePathPartOfProject(
        yaniceJsonDirectoryPath: string,
        yaniceProject: YaniceProject,
        relativeFilePath: string
    ): boolean {
        return (
            (!yaniceProject.pathRegExp || yaniceProject.pathRegExp.test(relativeFilePath)) &&
            (!yaniceProject.pathGlob || GlobTester.isGlobMatching(relativeFilePath, yaniceProject.pathGlob)) &&
            (!yaniceProject.projectFolder ||
                ChangedProjects.isFileWithinDirectory(yaniceJsonDirectoryPath, yaniceProject.projectFolder, relativeFilePath))
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
