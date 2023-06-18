import path from 'node:path';

import {
    ImportBoundariesYanicePluginArgs,
    LogUtil,
    Phase3Result,
    YaniceCliArgs,
    YaniceConfig,
    YanicePluginImportBoundariesOptionsInterface,
    YaniceProject
} from 'yanice';

import { YaniceImportBoundariesImportResolver } from './api/import-resolver.interface';
import { ProjectImportMap } from './api/project-import-map.interface';
import { ProjectImportMapperUtil } from './project-import-mapper/project-import-mapper.util';

export class ImportBoundariesExecutor {
    public static execute(phase3Result: Phase3Result): void {
        const yaniceConfig: YaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
        const yaniceProjects: YaniceProject[] = yaniceConfig.projects;
        const yaniceJsonDirectoryPath: string = phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const yaniceArgs: YaniceCliArgs = phase3Result.phase2Result.phase1Result.yaniceCliArgs;
        const importBoundariesPluginConfig: YanicePluginImportBoundariesOptionsInterface | null =
            yaniceConfig.plugins.officiallySupported['import-boundaries'];

        if (yaniceArgs.type !== 'plugin' || yaniceArgs.selectedPlugin.type !== 'import-boundaries') {
            process.exit(1); // TODO: Handle better
        }

        const importBoundariesArgs: ImportBoundariesYanicePluginArgs = yaniceArgs.selectedPlugin;

        if (!importBoundariesPluginConfig) {
            ImportBoundariesExecutor.exitPlugin(1, 'Plugin "import-boundaries" not configured in yanice.json!');
        }

        const importResolverScriptLocations: string[] = importBoundariesPluginConfig.importResolvers;
        const importResolvers: YaniceImportBoundariesImportResolver[] = importResolverScriptLocations.map((scriptLocation: string) =>
            ImportBoundariesExecutor.getImportResolver(scriptLocation, yaniceJsonDirectoryPath)
        );
        const absolutePathFileImportMaps: Record<string, string[]>[] = importResolvers.map(
            (importResolver: YaniceImportBoundariesImportResolver) => importResolver.getImportMap()
        );
        const absoluteFileImportMap: Record<string, string[]> = ImportBoundariesExecutor.mergeFileImportMaps(absolutePathFileImportMaps);
        const normalizedFileImportMap: Record<string, string[]> = ImportBoundariesExecutor.getNormalizedFileImportMap(
            yaniceJsonDirectoryPath,
            absoluteFileImportMap
        );
        if (importBoundariesArgs.mode === 'print-file-imports') {
            ImportBoundariesExecutor.printImportMap(normalizedFileImportMap);
            process.exit(0);
        }
        const projectImportMap: ProjectImportMap = ProjectImportMapperUtil.createProjectImportMap(yaniceProjects, normalizedFileImportMap);
        if (importBoundariesArgs.mode === 'print-project-imports') {
            ImportBoundariesExecutor.printProjectImportMap(projectImportMap);
            process.exit(0);
        }
    }

    /**
     * Converts a file-import-map with absolute file paths to a file-import-map with relative paths,
     * relative to the yaniceJsonDirectoryPath.
     */
    private static getNormalizedFileImportMap(
        yaniceJsonDirectoryPath: string,
        fileImportMap: Record<string, string[]>
    ): Record<string, string[]> {
        const normalizedFileImportMap: Record<string, string[]> = {};
        Object.keys(fileImportMap).forEach((absoluteImportingFile): void => {
            const normalizedImportingFile: string = ImportBoundariesExecutor.normalizeAbsoluteFilePath(
                yaniceJsonDirectoryPath,
                absoluteImportingFile
            );
            const normalizedImportedFiles: string[] | undefined = fileImportMap[absoluteImportingFile]?.map((absoluteFilePath): string => {
                return ImportBoundariesExecutor.normalizeAbsoluteFilePath(yaniceJsonDirectoryPath, absoluteFilePath);
            });
            normalizedFileImportMap[normalizedImportingFile] = normalizedImportedFiles ?? [];
        });
        return normalizedFileImportMap;
    }

    private static normalizeAbsoluteFilePath(yaniceJsonDirectoryPath: string, absoluteFilePath: string): string {
        return path.relative(yaniceJsonDirectoryPath, absoluteFilePath);
    }

    private static printImportMap(importMap: Record<string, string[]>): void {
        Object.keys(importMap).forEach((key: string): void => {
            LogUtil.log(`${key}:`);
            importMap[key]?.forEach((value: string) => {
                LogUtil.log(`    ${value}`);
            });
        });
    }

    private static printProjectImportMap(projectImportMap: ProjectImportMap): void {
        LogUtil.log(JSON.stringify(projectImportMap, null, 4));
    }

    private static getImportResolver(scriptLocation: string, yaniceJsonDirectoryPath: string): YaniceImportBoundariesImportResolver {
        return require(path.join(yaniceJsonDirectoryPath, scriptLocation));
    }

    private static mergeFileImportMaps(importMaps: Record<string, string[] | undefined>[]): Record<string, string[]> {
        return importMaps.reduce((prev: Record<string, string[]>, curr: Record<string, string[] | undefined>): Record<string, string[]> => {
            Object.keys(curr).forEach((key: string): void => {
                const value: string[] = curr[key] ?? [];
                if (prev[key]) {
                    prev[key] = ImportBoundariesExecutor.removeDuplicates(prev?.[key]?.concat(value) ?? value);
                } else {
                    prev[key] = value;
                }
            });
            return prev;
        }, {});
    }

    private static removeDuplicates(input: string[]): string[] {
        return [...new Set(input)];
    }

    private static exitPlugin(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
