import path from 'node:path';

import { YaniceProject } from 'yanice';

import { AssertionViolationInvalidEntrypoint } from '../../../api/assertion.interface';
import { FileToImportResolutionsMap, ImportResolution, ImportResolutionResolvedImport } from '../../../api/import-resolver.interface';

export class AccessViaEntrypointsUtil {
    public static getRuleViolations(
        projectToEntryPointsMap: Record<string, string[]>,
        fileToImportResolutionsMap: FileToImportResolutionsMap,
        fileToProjectsMap: Record<string, string[]>,
        ignoredProjects: string[]
    ): AssertionViolationInvalidEntrypoint[] {
        const result: AssertionViolationInvalidEntrypoint[] = [];
        Object.keys(fileToImportResolutionsMap).forEach((filePath: string): void => {
            const projectsOfFile: string[] = fileToProjectsMap[filePath] ?? [];
            projectsOfFile.forEach((projectName: string): void => {
                if (ignoredProjects.includes(projectName)) {
                    return;
                }
                const importResolutions: ImportResolution[] = fileToImportResolutionsMap[filePath]?.importResolutions ?? [];
                importResolutions.forEach((importResolution: ImportResolution): void => {
                    importResolution.resolvedImports.forEach((resolvedImport: ImportResolutionResolvedImport): void => {
                        const importedFilePath: string = resolvedImport.resolvedAbsoluteFilePath;
                        const importedProjects: string[] = fileToProjectsMap[importedFilePath] ?? [];
                        importedProjects.forEach((importedProject: string): void => {
                            if (ignoredProjects.includes(importedProject)) {
                                return;
                            }
                            if (importedProject === projectName) {
                                return;
                            }
                            const allowedEntryPointsOfImportedProject: string[] = projectToEntryPointsMap[importedProject] ?? [];
                            if (allowedEntryPointsOfImportedProject.length === 0) {
                                return;
                            }
                            const isAllowedEntryPoint: boolean = allowedEntryPointsOfImportedProject.some(
                                (allowedEntryPoint: string): boolean => {
                                    return importedFilePath === allowedEntryPoint;
                                }
                            );
                            if (!isAllowedEntryPoint) {
                                result.push({
                                    type: 'invalid-entrypoint',
                                    importedProject,
                                    importStatement: resolvedImport.parsedImportStatement.raw,
                                    expectedEntryPoints: allowedEntryPointsOfImportedProject,
                                    filePath,
                                    withinProject: projectName
                                });
                            }
                        });
                    });
                });
            });
        });
        return result;
    }

    public static createProjectToEntryPointsMap(yaniceProjects: YaniceProject[], yaniceBasePath: string): Record<string, string[]> {
        return yaniceProjects.reduce((prev: Record<string, string[]>, curr: YaniceProject): Record<string, string[]> => {
            prev[curr.projectName] = curr.entryPoints.map((relativeFilePath: string) => {
                return path.join(yaniceBasePath, relativeFilePath);
            });
            return prev;
        }, {});
    }
}
