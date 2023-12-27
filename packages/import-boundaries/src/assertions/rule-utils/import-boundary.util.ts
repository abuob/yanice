import { AssertionViolationImportNotConfigured, YaniceImportBoundariesAssertionViolation } from '../../api/assertion.interface';
import { FileToImportResolutionsMap, ImportResolution, ImportResolutionResolvedImport } from '../../api/import-resolver.interface';

export class ImportBoundaryUtil {
    public static getRuleViolations(
        fileToProjectsMap: Record<string, string[]>,
        fileToImportResolutionsMap: FileToImportResolutionsMap,
        allowedDependenciesMap: Record<string, string[]>,
        ignoredProjects: string[]
    ): YaniceImportBoundariesAssertionViolation[] {
        const violations: AssertionViolationImportNotConfigured[] = [];
        Object.keys(fileToProjectsMap).forEach((filePath: string): void => {
            const importResolutions: ImportResolution[] = fileToImportResolutionsMap[filePath]?.importResolutions ?? [];
            const resolvedImports: ImportResolutionResolvedImport[] = importResolutions
                .map((importResolution: ImportResolution) => importResolution.resolvedImports)
                .flat();
            const projectsOfFile: string[] = fileToProjectsMap[filePath] ?? [];
            projectsOfFile.forEach((projectNameOfFile: string): void => {
                if (ignoredProjects.includes(projectNameOfFile)) {
                    return;
                }
                const allowedDependencies: string[] = allowedDependenciesMap[projectNameOfFile] ?? [];
                resolvedImports.forEach((resolvedImport: ImportResolutionResolvedImport): void => {
                    const projectsOfImport: string[] = fileToProjectsMap[resolvedImport.resolvedAbsoluteFilePath] ?? [];
                    projectsOfImport.forEach((projectNameOfImport: string): void => {
                        if (ignoredProjects.includes(projectNameOfImport)) {
                            return;
                        }
                        const isImportToSameProject: boolean = projectNameOfImport === projectNameOfFile;
                        if (isImportToSameProject || allowedDependencies.includes(projectNameOfImport)) {
                            return;
                        }
                        const violation: AssertionViolationImportNotConfigured = {
                            type: 'import-not-configured',
                            withinProject: projectNameOfFile,
                            filePath,
                            importedProject: projectNameOfImport,
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
}
