import { ChangedProjects, YaniceProject } from 'yanice';

import { FileToProjectImportMap, ProjectImportMap } from '../api/project-import-map.interface';

export class ProjectImportMapperUtil {
    private static fileToProjectsCacheMap: Record<string, string[] | undefined> = {};

    public static createProjectImportMap(
        yaniceProjects: YaniceProject[],
        normalizedFileImportMap: Record<string, string[]>
    ): ProjectImportMap {
        const projectImportMap: ProjectImportMap = {};
        Object.keys(normalizedFileImportMap).forEach((filePath: string): void => {
            const correspondingProjects: string[] = ProjectImportMapperUtil.getProjectNamesByFile(yaniceProjects, filePath);
            const importedFiles: string[] = normalizedFileImportMap[filePath] ?? [];
            correspondingProjects.forEach((correspondingProject: string): void => {
                const existingProjectOrUndefined: ProjectImportMap[string] | undefined = projectImportMap[correspondingProject];
                if (existingProjectOrUndefined) {
                    existingProjectOrUndefined[filePath] = ProjectImportMapperUtil.getFileToProjectImportMap(yaniceProjects, importedFiles);
                } else {
                    projectImportMap[correspondingProject] = {
                        [filePath]: ProjectImportMapperUtil.getFileToProjectImportMap(yaniceProjects, importedFiles)
                    };
                }
            });
        });
        return projectImportMap;
    }

    private static getFileToProjectImportMap(yaniceProjects: YaniceProject[], importedFiles: string[]): FileToProjectImportMap {
        const resolvedImports: FileToProjectImportMap['resolvedImports'] = {};
        const unknownImports: string[] = [];
        importedFiles.forEach((importedFile: string): void => {
            const correspondingProjectNames: string[] = ProjectImportMapperUtil.getProjectNamesByFile(yaniceProjects, importedFile);
            if (correspondingProjectNames.length === 0) {
                unknownImports.push(importedFile);
            }
            correspondingProjectNames.forEach((correspondingProjectName: string): void => {
                const existingArrayOrUndefined: string[] | undefined = resolvedImports[correspondingProjectName];
                if (existingArrayOrUndefined) {
                    existingArrayOrUndefined.push(importedFile);
                } else {
                    resolvedImports[correspondingProjectName] = [importedFile];
                }
            });
        });
        return {
            resolvedImports,
            unknownImports
        };
    }

    private static getProjectNamesByFile(yaniceProjects: YaniceProject[], filePath: string): string[] {
        const fromCacheMap: string[] | undefined = ProjectImportMapperUtil.fileToProjectsCacheMap[filePath];
        if (fromCacheMap) {
            return fromCacheMap;
        }
        const correspondingProjectNames: string[] = ChangedProjects.getChangedProjectsRaw(yaniceProjects, [filePath]);
        ProjectImportMapperUtil.fileToProjectsCacheMap[filePath] = correspondingProjectNames;
        return correspondingProjectNames;
    }
}
