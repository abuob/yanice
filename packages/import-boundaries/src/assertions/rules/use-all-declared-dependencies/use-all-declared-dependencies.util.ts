import { DirectedGraph, DirectedGraphNode } from 'yanice';

import { AssertionViolationConfiguredImportUnused } from '../../../api/assertion.interface';

export class UseAllDeclaredDependenciesUtil {
    public static getAllDeclaredDependencies(directedGraph: DirectedGraph): Record<string, string[]> {
        return Array.from(directedGraph.nodes).reduce(
            (allowedDependenciesMap: Record<string, string[]>, node: DirectedGraphNode): Record<string, string[]> => {
                allowedDependenciesMap[node.name] = node.getChildren().map((childNode: DirectedGraphNode): string => childNode.name);
                return allowedDependenciesMap;
            },
            {}
        );
    }

    public static getRuleViolations(
        requiredDependenciesMap: Record<string, string[]>,
        projectDependencyGraph: Record<string, string[]>,
        ignoredProjects: string[]
    ): AssertionViolationConfiguredImportUnused[] {
        return Object.keys(requiredDependenciesMap).reduce(
            (
                allRuleViolations: AssertionViolationConfiguredImportUnused[],
                projectName: string
            ): AssertionViolationConfiguredImportUnused[] => {
                if (ignoredProjects.includes(projectName)) {
                    return allRuleViolations;
                }
                const requiredDependencies: string[] = requiredDependenciesMap[projectName] ?? [];
                const dependenciesInUse: string[] = projectDependencyGraph[projectName] ?? [];
                requiredDependencies.forEach((requiredDependency: string): void => {
                    if (ignoredProjects.includes(requiredDependency)) {
                        return;
                    }
                    if (!dependenciesInUse.includes(requiredDependency)) {
                        allRuleViolations.push({
                            type: 'configured-import-unused',
                            withinProject: projectName,
                            unusedProject: requiredDependency
                        });
                    }
                });
                return allRuleViolations;
            },
            []
        );
    }
}
