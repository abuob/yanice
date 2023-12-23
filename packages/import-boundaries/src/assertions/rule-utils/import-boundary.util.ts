import { AssertionViolationImportNotConfigured, YaniceImportBoundariesAssertionViolation } from '../../api/assertion.interface';
import { ImportResolutionResolvedImport, ImportResolutions } from '../../api/import-resolver.interface';

export class ImportBoundaryUtil {
    public static getRuleViolations(
        fileToProjectsMap: Record<string, string[]>,
        importResolutionsMap: Record<string, ImportResolutions[]>,
        allowedDependenciesMap: Record<string, string[]>,
        ignoredProjects: string[]
    ): YaniceImportBoundariesAssertionViolation[] {
        const violations: AssertionViolationImportNotConfigured[] = [];
        Object.keys(fileToProjectsMap).forEach((filePath: string): void => {
            const importResolutions: ImportResolutions[] = importResolutionsMap[filePath] ?? [];
            const resolvedImports: ImportResolutionResolvedImport[] = importResolutions
                .map((importResolution: ImportResolutions) => importResolution.resolvedImports)
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
