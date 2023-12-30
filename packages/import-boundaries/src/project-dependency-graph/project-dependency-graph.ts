import { FileToImportResolutionsMap, ImportResolution, ImportResolutionResolvedImport } from '../api/import-resolver.interface';

export class ProjectDependencyGraph {
    public static createProjectDependencyGraph(
        allProjectNames: string[],
        fileToProjectsMap: Record<string, string[]>,
        fileToImportResolutionsMap: FileToImportResolutionsMap,
        ignoredProjects: string[]
    ): Record<string, string[]> {
        const projectDependencyGraphRaw: Record<string, string[]> = ProjectDependencyGraph.createProjectDependencyGraphRaw(
            fileToProjectsMap,
            fileToImportResolutionsMap
        );
        return ProjectDependencyGraph.getProjectGraphCleaned(allProjectNames, projectDependencyGraphRaw, ignoredProjects);
    }

    public static getImportedProjectsOfFile(fileToProjectsMap: Record<string, string[]>, importResolutions: ImportResolution[]): string[] {
        const projectsMatchingGivenImport: string[] = [];
        importResolutions.forEach((importResolution: ImportResolution): void => {
            importResolution.resolvedImports.forEach((resolvedImport: ImportResolutionResolvedImport): void => {
                fileToProjectsMap[resolvedImport.resolvedAbsoluteFilePath]?.forEach((matchingProject: string): void => {
                    if (!projectsMatchingGivenImport.includes(matchingProject)) {
                        projectsMatchingGivenImport.push(matchingProject);
                    }
                });
            });
        });
        return projectsMatchingGivenImport;
    }

    private static createProjectDependencyGraphRaw(
        fileToProjectsMap: Record<string, string[]>,
        fileToImportResolutionsMap: FileToImportResolutionsMap
    ): Record<string, string[]> {
        const projectDependencyGraph: Record<string, string[]> = {};
        const allFilePaths: string[] = Object.keys(fileToProjectsMap);
        allFilePaths.forEach((filePath: string): void => {
            const importResolutions: ImportResolution[] = fileToImportResolutionsMap[filePath]?.importResolutions ?? [];
            const importedProjectsOfFile: string[] = ProjectDependencyGraph.getImportedProjectsOfFile(fileToProjectsMap, importResolutions);
            const projectsOfFile: string[] = fileToProjectsMap[filePath] ?? [];
            ProjectDependencyGraph.extendDependencyGraph(projectDependencyGraph, projectsOfFile, importedProjectsOfFile);
        });
        return projectDependencyGraph;
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

    private static getProjectGraphCleaned(
        allProjectNames: string[],
        projectDependencyGraphRaw: Record<string, string[]>,
        ignoredProjects: string[]
    ): Record<string, string[]> {
        const allProjectNamesSorted: string[] = allProjectNames.slice(0).sort();
        return allProjectNamesSorted.reduce((prev: Record<string, string[]>, curr: string): Record<string, string[]> => {
            if (ignoredProjects.includes(curr)) {
                return prev;
            }
            const dependencies: string[] = projectDependencyGraphRaw[curr] ?? [];
            prev[curr] = dependencies
                .filter((dependency: string) => !ignoredProjects.includes(dependency))
                .slice(0)
                .sort();
            return prev;
        }, {});
    }
}
