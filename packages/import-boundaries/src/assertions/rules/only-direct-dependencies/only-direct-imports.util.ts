import { DirectedGraph, DirectedGraphNode } from 'yanice';

import { AssertionViolationImportNotConfigured, YaniceImportBoundariesAssertionViolation } from '../../../api/assertion.interface';
import { ImportResolutionResolvedImport, ImportResolutions } from '../../../api/import-resolver.interface';

export class OnlyDirectImportsUtil {
    public static getRuleViolations(
        fileToProjectsMap: Record<string, string[]>,
        importResolutionsMap: Record<string, ImportResolutions[]>,
        directedGraph: DirectedGraph
    ): YaniceImportBoundariesAssertionViolation[] {
        const allowedDependenciesMap: Record<string, string[]> = OnlyDirectImportsUtil.getAllowedDependenciesMap(directedGraph) ?? [];
        const violations: AssertionViolationImportNotConfigured[] = [];
        Object.keys(fileToProjectsMap).forEach((filePath: string): void => {
            const importResolutions: ImportResolutions[] = importResolutionsMap[filePath] ?? [];
            const resolvedImports: ImportResolutionResolvedImport[] = importResolutions
                .map((importResolution: ImportResolutions) => importResolution.resolvedImports)
                .flat();
            const projectsOfFile: string[] = fileToProjectsMap[filePath] ?? [];
            projectsOfFile.forEach((projectNameOfFile: string): void => {
                const allowedDependencies: string[] = allowedDependenciesMap[projectNameOfFile] ?? [];
                resolvedImports.forEach((resolvedImport: ImportResolutionResolvedImport): void => {
                    const projectsOfImport: string[] = fileToProjectsMap[resolvedImport.resolvedAbsoluteFilePath] ?? [];
                    projectsOfImport.forEach((projectNameOfImport: string): void => {
                        const isImportToSameProject: boolean = projectNameOfImport === projectNameOfFile;
                        if (isImportToSameProject || allowedDependencies.includes(projectNameOfImport)) {
                            return;
                        }
                        const violation: AssertionViolationImportNotConfigured = {
                            type: 'import-not-configured',
                            withinProject: projectNameOfFile,
                            filePath,
                            actualProject: projectNameOfImport,
                            importStatement: resolvedImport.parsedImportStatement.raw,
                            allowedProjects: allowedDependencies
                        };
                        violations.push(violation);
                    });
                });
            });
        });
        return violations;
    }

    public static getAllowedDependenciesMap(directedGraph: DirectedGraph): Record<string, string[]> {
        return directedGraph.nodes.reduce(
            (allowedDependenciesMap: Record<string, string[]>, node: DirectedGraphNode): Record<string, string[]> => {
                allowedDependenciesMap[node.name] = node.getChildren().map((childNode: DirectedGraphNode): string => childNode.name);
                return allowedDependenciesMap;
            },
            {}
        );
    }
}
