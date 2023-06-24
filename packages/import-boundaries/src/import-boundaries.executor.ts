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

import { FileImportMap, YaniceImportBoundariesImportResolver } from './api/import-resolver.interface';
import { ProjectImportByFilesMap } from './api/project-import-map.interface';
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
        const fileImportMaps: FileImportMap[] = importResolvers.reduce(
            (prev: FileImportMap[], curr: YaniceImportBoundariesImportResolver): FileImportMap[] => {
                const fileImportMap: FileImportMap[] = curr.getFileImportMaps();
                return prev.concat(fileImportMap);
            },
            []
        );

        if (importBoundariesArgs.mode === 'print-file-imports') {
            ImportBoundariesExecutor.printOutput(fileImportMaps);
            process.exit(0);
        }
        const projectImportByFilesMap: ProjectImportByFilesMap = ProjectImportMapperUtil.createProjectImportByFilesMap(
            fileImportMaps,
            yaniceJsonDirectoryPath,
            yaniceProjects
        );
        if (importBoundariesArgs.mode === 'print-project-imports') {
            ImportBoundariesExecutor.printOutput(projectImportByFilesMap);
            process.exit(0);
        }
    }

    private static printOutput(object: FileImportMap[] | ProjectImportByFilesMap): void {
        LogUtil.log(JSON.stringify(object, null, 4));
    }

    private static getImportResolver(scriptLocation: string, yaniceJsonDirectoryPath: string): YaniceImportBoundariesImportResolver {
        return require(path.join(yaniceJsonDirectoryPath, scriptLocation));
    }

    private static exitPlugin(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
