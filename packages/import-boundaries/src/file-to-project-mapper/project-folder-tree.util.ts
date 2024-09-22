export interface ProjectFolderTreeNode {
    paths: Record<string, ProjectFolderTreeNode>;
    projects: string[];
}

export class ProjectFolderTreeUtil {
    public static createProjectFolderDecisionTree(projectToProjectPathMap: Record<string, string | undefined>): ProjectFolderTreeNode {
        const projectPathTree: ProjectFolderTreeNode = {
            paths: {},
            projects: []
        };
        Object.entries(projectToProjectPathMap).forEach(([projectName, projectPath]): void => {
            const splitPath: string[] = ProjectFolderTreeUtil.splitPath(projectPath);
            ProjectFolderTreeUtil.updateRecursively(projectPathTree, splitPath, projectName, 0);
        });
        return projectPathTree;
    }

    public static getProjectToFilePathsMap(
        filePaths: string[],
        projectNames: string[],
        projectFolderTree: ProjectFolderTreeNode
    ): Record<string, string[] | undefined> {
        const projectToFilePathsMap: Record<string, string[] | undefined> = {};
        filePaths.forEach((filePath: string): void => {
            const splitFilePath: string[] = ProjectFolderTreeUtil.splitPath(filePath);
            projectNames.forEach((projectName: string): void => {
                if (!projectToFilePathsMap[projectName]) {
                    projectToFilePathsMap[projectName] = [];
                }
                const isFilePartOfProject: boolean = ProjectFolderTreeUtil.isPartOfProject(splitFilePath, projectName, projectFolderTree);
                if (isFilePartOfProject) {
                    projectToFilePathsMap[projectName]?.push(filePath);
                }
            });
        });
        return projectToFilePathsMap;
    }

    public static getProjectsOfGivenPath(filePath: string, projectFolderTree: ProjectFolderTreeNode): string[] {
        const splitPath: string[] = ProjectFolderTreeUtil.splitPath(filePath);
        return ProjectFolderTreeUtil.getProjectsOfGivenPathRecursively(splitPath, projectFolderTree, 0);
    }

    public static isPartOfProject(filePathSplit: string[], projectName: string, projectPathTree: ProjectFolderTreeNode): boolean {
        return ProjectFolderTreeUtil.isPartOfProjectRecursively(filePathSplit, projectName, projectPathTree, 0);
    }

    public static splitPath(inputPath: string | undefined): string[] {
        if (!inputPath || inputPath === '.' || inputPath === './') {
            return [];
        }
        return inputPath.split(/[/\\]/);
    }

    private static getProjectsOfGivenPathRecursively(
        splitPath: string[],
        currentTreeNode: ProjectFolderTreeNode,
        currentIndex: number
    ): string[] {
        const nextPathElement: string | undefined = splitPath[currentIndex];
        if (!nextPathElement) {
            return [];
        }
        const nextTreeNode: ProjectFolderTreeNode | undefined = currentTreeNode.paths[nextPathElement];
        if (!nextTreeNode) {
            return currentTreeNode.projects;
        }
        return [
            ...currentTreeNode.projects,
            ...ProjectFolderTreeUtil.getProjectsOfGivenPathRecursively(splitPath, nextTreeNode, currentIndex + 1)
        ];
    }

    private static isPartOfProjectRecursively(
        splitPath: string[],
        projectName: string,
        currentTreeNode: ProjectFolderTreeNode,
        currentIndex: number
    ): boolean {
        if (currentTreeNode.projects.includes(projectName)) {
            return true;
        }
        const nextPathElement: string | undefined = splitPath[currentIndex];
        if (!nextPathElement) {
            return false;
        }
        const nextTreeNode: ProjectFolderTreeNode | undefined = currentTreeNode.paths[nextPathElement];
        if (!nextTreeNode) {
            return false;
        }
        return ProjectFolderTreeUtil.isPartOfProjectRecursively(splitPath, projectName, nextTreeNode, currentIndex + 1);
    }

    private static updateRecursively(
        currentNode: ProjectFolderTreeNode,
        inputPath: string[],
        projectName: string,
        currentIndex: number
    ): void {
        if (currentIndex === inputPath.length) {
            currentNode.projects.push(projectName);
            return;
        }
        const nextPathElement: string | undefined = inputPath[currentIndex];
        if (!nextPathElement) {
            return;
        }
        if (!currentNode.paths[nextPathElement]) {
            currentNode.paths[nextPathElement] = {
                paths: {},
                projects: []
            };
        }
        const nextNode: ProjectFolderTreeNode | undefined = currentNode.paths[nextPathElement];
        if (!nextNode) {
            return;
        }
        ProjectFolderTreeUtil.updateRecursively(nextNode, inputPath, projectName, currentIndex + 1);
    }
}
