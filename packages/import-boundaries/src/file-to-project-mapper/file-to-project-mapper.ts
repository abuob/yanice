import path from 'node:path';

import { GlobTester, YaniceProject } from 'yanice';

import { GitLsFilesUtil } from './git-ls-files.util';
import { ProjectFolderTreeNode, ProjectFolderTreeUtil } from './project-folder-tree.util';

export class FileToProjectMapper {
    public static async getFileToProjectsMap(
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

        // create projectFolderDecisionTree
        const projectNameToProjectFolderMap: Record<string, string | undefined> =
            FileToProjectMapper.createProjectNameToProjectFolderMap(yaniceProjects);
        const projectFolderDecisionTree: ProjectFolderTreeNode =
            ProjectFolderTreeUtil.createProjectFolderDecisionTree(projectNameToProjectFolderMap);

        // create projectToFiles-map for projects which have projectFolder defined using projectFolderDecisionTree
        const projectNamesWithDefinedProjectPath: string[] = yaniceProjects
            .filter((yaniceProject: YaniceProject) => !!yaniceProject.projectFolder)
            .map((yaniceProject: YaniceProject): string => yaniceProject.projectName);
        const projectToFilePathsMap: Record<string, string[] | undefined> = ProjectFolderTreeUtil.getProjectToFilePathsMap(
            allFilesInYaniceRootRelativeToYaniceRoot,
            projectNamesWithDefinedProjectPath,
            projectFolderDecisionTree
        );

        // loop over projects to populate the file-to-project-map
        yaniceProjects.forEach((yaniceProject: YaniceProject): void => {
            const filePathCandidates: string[] = !!yaniceProject.projectFolder
                ? projectToFilePathsMap[yaniceProject.projectName] ?? allFilesInYaniceRootRelativeToYaniceRoot
                : allFilesInYaniceRootRelativeToYaniceRoot;

            const allFilesInProject: string[] = FileToProjectMapper.getFilesFiltered(
                filePathCandidates,
                yaniceProject.pathGlob,
                yaniceProject.pathRegExp
            );

            allFilesInProject.forEach((relativeFilePath: string): void => {
                const absoluteFilePath: string = path.join(yaniceJsonDirectoryPath, relativeFilePath);
                fileToProjectsMap[absoluteFilePath]?.push(yaniceProject.projectName);
            });
        });
        return fileToProjectsMap;
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

    private static createProjectNameToProjectFolderMap(yaniceProjects: YaniceProject[]): Record<string, string | undefined> {
        return yaniceProjects.reduce(
            (prev: Record<string, string | undefined>, curr: YaniceProject): Record<string, string | undefined> => {
                if (!curr.projectFolder) {
                    return prev;
                }
                prev[curr.projectName] = curr.projectFolder;
                return prev;
            },
            {}
        );
    }
}
