import { FileToImportResolutionsMap, ImportResolution } from '../api/import-resolver.interface';

export class ProjectDependencyGraph {
    public static createProjectDependencyGraph(
        allProjectNames: string[],
        absoluteFilePathToProjectsMap: Record<string, string[] | undefined>,
        fileToImportResolutionsMap: FileToImportResolutionsMap
    ): Record<string, string[]> {
        const projectDependencyGraph: Record<string, string[]> = {};
        const allFilePaths: string[] = Object.keys(absoluteFilePathToProjectsMap);
        allFilePaths.forEach((filePath: string): void => {
            const projectsOfFile: string[] = absoluteFilePathToProjectsMap[filePath] ?? [];
            const importResolutions: ImportResolution[] = fileToImportResolutionsMap[filePath]?.importResolutions ?? [];
            const importedProjectsOfFile: string[] = ProjectDependencyGraph.getImportedProjectsOfFile(
                absoluteFilePathToProjectsMap,
                importResolutions
            );
            ProjectDependencyGraph.extendDependencyGraph(projectDependencyGraph, projectsOfFile, importedProjectsOfFile);
        });
        allProjectNames.forEach((projectName: string) => {
            if (!projectDependencyGraph[projectName]) {
                projectDependencyGraph[projectName] = [];
            }
        });
        return projectDependencyGraph;
    }

    public static getImportedProjectsOfFile(
        absoluteFilePathToProjectsMap: Record<string, string[] | undefined>,
        importResolutions: ImportResolution[]
    ): string[] {
        const projectsMatchingGivenImport: string[] = [];
        importResolutions.forEach((importResolution: ImportResolution): void => {
            importResolution.resolvedImports.forEach((resolvedImport: ImportResolution['resolvedImports'][number]): void => {
                absoluteFilePathToProjectsMap[resolvedImport.resolvedAbsoluteFilePath]?.forEach((matchingProject: string): void => {
                    if (!projectsMatchingGivenImport.includes(matchingProject)) {
                        projectsMatchingGivenImport.push(matchingProject);
                    }
                });
            });
        });
        return projectsMatchingGivenImport;
    }

    /**
     * Impure method, will modify projectDependencyGraph in place.
     * Note: A project does not depend on itself; we do not model this in the
     * dependency-graph.
     * @param projectDependencyGraph
     * @param dependents only unique values
     * @param dependencies only unique values
     */
    private static extendDependencyGraph(
        projectDependencyGraph: Record<string, string[]>,
        dependents: string[],
        dependencies: string[]
    ): void {
        dependents.forEach((dependent: string): void => {
            if (!projectDependencyGraph[dependent]) {
                projectDependencyGraph[dependent] = [];
            }
            dependencies.forEach((dependency: string): void => {
                const existingDependencies: string[] | undefined = projectDependencyGraph[dependent];
                if (existingDependencies && !existingDependencies.includes(dependency) && dependency !== dependent) {
                    existingDependencies.push(dependency);
                }
            });
        });
    }
}
