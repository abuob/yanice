import path from 'node:path';

import { ChangedProjects, GlobTester, YaniceProject } from 'yanice';

import { GitLsFilesUtil } from './git-ls-files.util';

export class FileToProjectMapper {
    public static getFileToProjectsMap(
        absoluteFilePaths: string[],
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[]
    ): Record<string, string[]> {
        const fileToProjectsMap: Record<string, string[]> = {};
        absoluteFilePaths.forEach((absoluteFilePath: string): void => {
            const relativePathToYaniceJson: string = FileToProjectMapper.convertAbsolutePathToYaniceJsonPath(
                yaniceJsonDirectoryPath,
                absoluteFilePath
            );
            fileToProjectsMap[absoluteFilePath] = ChangedProjects.getChangedProjectsRaw(yaniceJsonDirectoryPath, yaniceProjects, [
                relativePathToYaniceJson
            ]);
        });
        return fileToProjectsMap;
    }

    public static async getFileToProjectsMapV2(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[]
    ): Promise<Record<string, string[]>> {
        const fileToProjectsMap: Record<string, string[]> = {};
        const allFilesInYaniceRootRelativeToGitRoot: string[] = await GitLsFilesUtil.gitLsFiles(gitRepoRootPath, yaniceJsonDirectoryPath);
        const allFilesInYaniceRootRelativeToYaniceRoot: string[] = allFilesInYaniceRootRelativeToGitRoot.map(
            (filePathRelativeToGitRoot: string): string => {
                return FileToProjectMapper.getFilePathRelativeToYaniceRoot(
                    gitRepoRootPath,
                    yaniceJsonDirectoryPath,
                    filePathRelativeToGitRoot
                );
            }
        );

        // ensure that every file is part of the map
        allFilesInYaniceRootRelativeToYaniceRoot.forEach((filePathRelativeToYaniceRoot: string): void => {
            const absoluteFilePath: string = path.join(yaniceJsonDirectoryPath, filePathRelativeToYaniceRoot);
            fileToProjectsMap[absoluteFilePath] = [];
        });

        // loop over projects to populate the file-to-project-map
        for (const yaniceProject of yaniceProjects) {
            const projectFilesRelativeToYaniceRoot: string[] =
                await FileToProjectMapper.getFilesRelevantForYaniceProjectRelativeToYaniceRoot(
                    yaniceProject,
                    allFilesInYaniceRootRelativeToYaniceRoot,
                    gitRepoRootPath,
                    yaniceJsonDirectoryPath
                );
            projectFilesRelativeToYaniceRoot.forEach((projectFileRelativeToYaniceRoot: string): void => {
                const absoluteFilePath: string = path.join(yaniceJsonDirectoryPath, projectFileRelativeToYaniceRoot);
                const existingEntryOrNull: string[] | undefined = fileToProjectsMap[absoluteFilePath];
                if (!existingEntryOrNull) {
                    fileToProjectsMap[absoluteFilePath] = [yaniceProject.projectName];
                } else {
                    existingEntryOrNull.push(yaniceProject.projectName);
                }
            });
        }
        return fileToProjectsMap;
    }

    private static convertAbsolutePathToYaniceJsonPath(yaniceJsonDir: string, absoluteFilePath: string): string {
        return path.relative(yaniceJsonDir, absoluteFilePath);
    }

    private static async getFilesRelevantForYaniceProjectRelativeToYaniceRoot(
        yaniceProject: YaniceProject,
        allFilesInYaniceRootRelativeToYaniceRoot: string[],
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string
    ): Promise<string[]> {
        if (!yaniceProject.projectFolder) {
            return FileToProjectMapper.getFilesFiltered(
                allFilesInYaniceRootRelativeToYaniceRoot,
                yaniceProject.pathGlob,
                yaniceProject.pathRegExp
            );
        }
        const relativePathFromGitRootToYaniceRoot: string = path.relative(gitRepoRootPath, yaniceJsonDirectoryPath);
        const projectFolderRelativeToGitRoot: string = path.join(relativePathFromGitRootToYaniceRoot, yaniceProject.projectFolder);
        const filesInProjectRelativeToGitRoot: string[] = await GitLsFilesUtil.gitLsFiles(gitRepoRootPath, projectFolderRelativeToGitRoot);
        const filesInProjectRelativeToYaniceRoot: string[] = filesInProjectRelativeToGitRoot.map(
            (fileRelativeToGitRoot: string): string => {
                return FileToProjectMapper.getFilePathRelativeToYaniceRoot(gitRepoRootPath, yaniceJsonDirectoryPath, fileRelativeToGitRoot);
            }
        );
        return FileToProjectMapper.getFilesFiltered(filesInProjectRelativeToYaniceRoot, yaniceProject.pathGlob, yaniceProject.pathRegExp);
    }

    private static getFilesFiltered(
        filesInProjectRelativeToYaniceRoot: string[],
        pathGlob: string | null,
        pathRegExp: RegExp | null
    ): string[] {
        if (!pathGlob && !pathRegExp) {
            return filesInProjectRelativeToYaniceRoot;
        }
        return filesInProjectRelativeToYaniceRoot.filter((relativeFilePathToYaniceRoot: string): boolean => {
            const isRegExpMatching: boolean = !pathRegExp || pathRegExp.test(relativeFilePathToYaniceRoot);
            const isGlobMatching: boolean = !pathGlob || GlobTester.isGlobMatching(relativeFilePathToYaniceRoot, pathGlob);
            return isRegExpMatching && isGlobMatching;
        });
    }

    private static getFilePathRelativeToYaniceRoot(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        filePathRelativeToGitRoot: string
    ): string {
        const absoluteFilePath: string = path.join(gitRepoRootPath, filePathRelativeToGitRoot);
        return path.relative(yaniceJsonDirectoryPath, absoluteFilePath);
    }
}
