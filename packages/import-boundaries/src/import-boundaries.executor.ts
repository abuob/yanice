import {
    ImportBoundariesYanicePluginArgs,
    LogUtil,
    Phase3Result,
    YaniceCliArgs,
    YaniceConfig,
    YanicePluginImportBoundariesOptionsInterface,
    YaniceProject
} from 'yanice';

import { FileImportMap } from './api/import-resolver.interface';
import { ProjectImportByFilesMap } from './api/project-import-map.interface';
import { FileDiscovery } from './file-discovery/file-discovery';
import { ImportResolution } from './import-resolvers/import-resolution';
import { PostResolver } from './post-resolver/post-resolver';
import { ProjectImportMapperUtil } from './project-import-mapper/project-import-mapper.util';

export class ImportBoundariesExecutor {
    public static async execute(phase3Result: Phase3Result): Promise<void> {
        const yaniceConfig: YaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
        const yaniceProjects: YaniceProject[] = yaniceConfig.projects;
        const yaniceJsonDirectoryPath: string = phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const yaniceArgs: YaniceCliArgs = phase3Result.phase2Result.phase1Result.yaniceCliArgs;
        const importBoundariesPluginConfig: YanicePluginImportBoundariesOptionsInterface | null =
            yaniceConfig.plugins.officiallySupported['import-boundaries'];

        if (yaniceArgs.type !== 'plugin' || yaniceArgs.selectedPlugin.type !== 'import-boundaries') {
            ImportBoundariesExecutor.exitPlugin(1, 'Incorrect arguments passed to "import-boundaries"-plugin, abort!');
        }

        const importBoundariesArgs: ImportBoundariesYanicePluginArgs = yaniceArgs.selectedPlugin;

        if (!importBoundariesPluginConfig) {
            ImportBoundariesExecutor.exitPlugin(1, 'Plugin "import-boundaries" not configured in yanice.json!');
        }

        const allFilePaths: string[] = await FileDiscovery.getFilePathsRecursively(
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.exclusionGlobs ?? []
        );

        const fileImportMapsRaw: FileImportMap[] = await ImportResolution.getImportMaps(
            yaniceJsonDirectoryPath,
            allFilePaths,
            importBoundariesPluginConfig.importResolvers
        );

        const fileImportMaps: FileImportMap[] = await ImportBoundariesExecutor.postResolveIfNecessary(
            fileImportMapsRaw,
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.postResolve ?? [],
            importBoundariesArgs
        );

        if (importBoundariesArgs.mode === 'print-file-imports') {
            ImportBoundariesExecutor.exitPlugin(0, JSON.stringify(fileImportMaps, null, 4));
        }
        const projectImportByFilesMap: ProjectImportByFilesMap = ProjectImportMapperUtil.createProjectImportByFilesMap(
            fileImportMaps,
            yaniceJsonDirectoryPath,
            yaniceProjects
        );
        if (importBoundariesArgs.mode === 'print-project-imports') {
            ImportBoundariesExecutor.exitPlugin(0, JSON.stringify(projectImportByFilesMap, null, 4));
        }
    }

    private static async postResolveIfNecessary(
        fileImportMaps: FileImportMap[],
        yaniceJsonDirectoryPath: string,
        postResolverLocations: string[],
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<FileImportMap[]> {
        if (postResolverLocations.length === 0 || importBoundariesArgs.skipPostResolvers) {
            return Promise.resolve(fileImportMaps);
        }
        return PostResolver.postResolveProcessing(fileImportMaps, yaniceJsonDirectoryPath, postResolverLocations);
    }

    private static exitPlugin(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
