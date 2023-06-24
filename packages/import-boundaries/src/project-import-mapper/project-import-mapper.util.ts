import path from 'node:path';

import { ChangedProjects, YaniceProject } from 'yanice';

import { EnrichedFileImportMap } from '../api/enriched-file-import-map.interface';
import { FileImportMap } from '../api/import-resolver.interface';
import { ProjectImportByFilesMap } from '../api/project-import-map.interface';

export class ProjectImportMapperUtil {
    private static fileToProjectsCacheMap: Record<string, string[] | undefined> = {};

    public static createProjectImportByFilesMap(
        fileImportMaps: FileImportMap[],
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[]
    ): ProjectImportByFilesMap {
        return fileImportMaps.reduce((prev: ProjectImportByFilesMap, curr: FileImportMap): ProjectImportByFilesMap => {
            const filePath: string = ProjectImportMapperUtil.convertAbsolutePathToYaniceJsonPath(
                yaniceJsonDirectoryPath,
                curr.absoluteFilePath
            );
            const correspondingProjects: string[] = ProjectImportMapperUtil.getProjectNamesByFile(yaniceProjects, filePath);
            const enrichedMap: EnrichedFileImportMap = ProjectImportMapperUtil.createEnrichedFileImportMap(
                curr,
                yaniceJsonDirectoryPath,
                yaniceProjects
            );
            correspondingProjects.forEach((correspondingProject: string): void => {
                const existingPropOrUndef: EnrichedFileImportMap[] | undefined = prev[correspondingProject];
                if (existingPropOrUndef) {
                    existingPropOrUndef.push(enrichedMap);
                } else {
                    prev[correspondingProject] = [enrichedMap];
                }
            });
            return prev;
        }, {});
    }

    private static createEnrichedFileImportMap(
        fileImportMap: FileImportMap,
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[]
    ): EnrichedFileImportMap {
        return {
            createdByResolver: fileImportMap.createdBy,
            filePath: ProjectImportMapperUtil.convertAbsolutePathToYaniceJsonPath(yaniceJsonDirectoryPath, fileImportMap.absoluteFilePath),
            resolvedImports: fileImportMap.resolvedImports.map(
                (resolvedImport: FileImportMap['resolvedImports'][number]): EnrichedFileImportMap['resolvedImports'][number] => {
                    const filePath: string = ProjectImportMapperUtil.convertAbsolutePathToYaniceJsonPath(
                        yaniceJsonDirectoryPath,
                        resolvedImport.resolvedAbsoluteFilePath
                    );
                    return {
                        filePath,
                        projects: ProjectImportMapperUtil.getProjectNamesByFile(yaniceProjects, filePath),
                        importStatement: resolvedImport.parsedImportStatement.raw
                    };
                }
            ),
            unknownImports: fileImportMap.unknownImports.map((unknownImport) => unknownImport.raw),
            skippedImports: fileImportMap.skippedImports.map((skippedImport) => skippedImport.raw),
            resolvedPackageImports: fileImportMap.resolvedPackageImports
        };
    }

    private static convertAbsolutePathToYaniceJsonPath(yaniceJsonDir: string, absoluteFilePath: string): string {
        return path.relative(yaniceJsonDir, absoluteFilePath);
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
