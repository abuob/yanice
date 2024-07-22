import {
    ImportBoundariesYanicePluginArgs,
    LogUtil,
    Phase3Result,
    YaniceCliArgs,
    YaniceConfig,
    YanicePerformanceLogger,
    YanicePluginImportBoundariesOptions,
    YaniceProject
} from 'yanice';

import { YaniceImportBoundariesAssertionViolation } from './api/assertion.interface';
import { ImportBoundaryAssertionData } from './api/import-boundary-assertion-data';
import { FileToImportResolutionsMap } from './api/import-resolver.interface';
import { AssertionLogger } from './assertions/assertion-logger';
import { ImportBoundariesAssertions } from './assertions/import-boundaries-assertions';
import { FileToProjectMapper } from './file-to-project-mapper/file-to-project-mapper';
import { GitLsFilesUtil } from './file-to-project-mapper/git-ls-files.util';
import { ImportResolutionUtil } from './import-resolvers/import-resolution.util';
import { PostResolver } from './post-resolver/post-resolver';
import { ProjectDependencyGraph } from './project-dependency-graph/project-dependency-graph';

type stopWatchIdentifiersType = 'file-to-import-resolution-map' | 'file-to-project-map' | 'project-dependency-graph';

export class ImportBoundariesExecutor {
    public static async execute(phase3Result: Phase3Result): Promise<void> {
        const yaniceConfig: YaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
        const yaniceProjects: YaniceProject[] = yaniceConfig.projects;
        const yaniceJsonDirectoryPath: string = phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const gitRepoRootPath: string = phase3Result.phase2Result.phase1Result.gitRepoRootPath;
        const yaniceArgs: YaniceCliArgs = phase3Result.phase2Result.phase1Result.yaniceCliArgs;
        const importBoundariesPluginConfig: YanicePluginImportBoundariesOptions | null =
            yaniceConfig.plugins.officiallySupported['import-boundaries'];

        const performanceLogger: YanicePerformanceLogger<stopWatchIdentifiersType> = new YanicePerformanceLogger(
            'ImportBoundariesExecutor',
            yaniceArgs.defaultArgs.isPerformanceLoggingEnabled
        );

        if (yaniceArgs.type !== 'plugin' || yaniceArgs.selectedPlugin.type !== 'import-boundaries') {
            ImportBoundariesExecutor.exitPlugin(1, 'Incorrect arguments passed to "import-boundaries"-plugin, abort!');
        }

        const importBoundariesArgs: ImportBoundariesYanicePluginArgs = yaniceArgs.selectedPlugin;

        if (!importBoundariesPluginConfig) {
            ImportBoundariesExecutor.exitPlugin(1, 'Plugin "import-boundaries" not configured in yanice.json!');
        }

        const allAbsoluteFilePaths: string[] = await GitLsFilesUtil.getAllAbsoluteFilePathsInYaniceRoot(
            gitRepoRootPath,
            yaniceJsonDirectoryPath
        );

        if (importBoundariesArgs.mode === 'print-file-imports') {
            await ImportBoundariesExecutor.handlePrintFileImportsMode(
                yaniceJsonDirectoryPath,
                allAbsoluteFilePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs
            );
            return;
        }

        if (importBoundariesArgs.mode === 'print-assertion-data') {
            await ImportBoundariesExecutor.handlePrintAssertionData(
                gitRepoRootPath,
                yaniceJsonDirectoryPath,
                allAbsoluteFilePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs,
                yaniceProjects,
                performanceLogger
            );
            return;
        }

        if (importBoundariesArgs.mode === 'generate') {
            await ImportBoundariesExecutor.handleGenerateMode(
                gitRepoRootPath,
                yaniceJsonDirectoryPath,
                allAbsoluteFilePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs,
                yaniceProjects,
                performanceLogger
            );
            return;
        }

        if (importBoundariesArgs.mode === 'assert') {
            await ImportBoundariesExecutor.handleAssertMode(
                gitRepoRootPath,
                yaniceJsonDirectoryPath,
                allAbsoluteFilePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs,
                yaniceProjects,
                phase3Result,
                performanceLogger
            );
            return;
        }
    }

    private static async handlePrintFileImportsMode(
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<void> {
        const fileToImportResolutionsMap: FileToImportResolutionsMap =
            await ImportBoundariesExecutor.getPostResolvedAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs
            );
        const output: string = `${JSON.stringify(fileToImportResolutionsMap, null, 4)}\n`;
        await LogUtil.writeToStdoutAsync(output);
        ImportBoundariesExecutor.exitPlugin(0, null);
    }

    private static async handlePrintAssertionData(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[],
        performanceLogger: YanicePerformanceLogger<stopWatchIdentifiersType>
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects,
            performanceLogger
        );
        const output: string = `${JSON.stringify(assertionData, null, 4)}\n`;
        await LogUtil.writeToStdoutAsync(output);
        ImportBoundariesExecutor.exitPlugin(0, null);
    }

    private static async handleGenerateMode(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[],
        performanceLogger: YanicePerformanceLogger<stopWatchIdentifiersType>
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects,
            performanceLogger
        );
        const output: string = `${JSON.stringify(assertionData.projectDependencyGraph, null, 4)}\n`;
        await LogUtil.writeToStdoutAsync(output);
        ImportBoundariesExecutor.exitPlugin(0, null);
    }

    private static async handleAssertMode(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[],
        phase3Result: Phase3Result,
        performanceLogger: YanicePerformanceLogger<stopWatchIdentifiersType>
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects,
            performanceLogger
        );

        const assertionViolations: YaniceImportBoundariesAssertionViolation[] = await ImportBoundariesAssertions.assertImportBoundaries(
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.assertions ?? [],
            importBoundariesPluginConfig.customAssertions ?? [],
            phase3Result,
            assertionData,
            importBoundariesPluginConfig
        );
        if (assertionViolations.length > 0) {
            AssertionLogger.logAssertionViolations(assertionViolations, yaniceJsonDirectoryPath);
            ImportBoundariesExecutor.exitPlugin(1, null);
        } else {
            ImportBoundariesExecutor.exitPlugin(0, 'No import boundary violation found!');
        }
    }

    private static async getImportBoundaryAssertionData(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[],
        performanceLogger: YanicePerformanceLogger<stopWatchIdentifiersType>
    ): Promise<ImportBoundaryAssertionData> {
        performanceLogger.startStopwatch('file-to-import-resolution-map');

        const fileToImportResolutionsMap: FileToImportResolutionsMap =
            await ImportBoundariesExecutor.getPostResolvedAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs
            );

        performanceLogger.stopStopwatchAndLog('file-to-import-resolution-map', 'Created fileToImportResolutionMap in:');
        performanceLogger.startStopwatch('file-to-project-map');

        const fileToProjectsMap: Record<string, string[]> = await FileToProjectMapper.getFileToProjectsMap(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            yaniceProjects
        );
        performanceLogger.stopStopwatchAndLog('file-to-project-map', 'Created fileToProjectsMap in:');
        performanceLogger.startStopwatch('project-dependency-graph');

        const allProjectNames: string[] = yaniceProjects.map((yaniceProject: YaniceProject): string => yaniceProject.projectName);
        const projectDependencyGraph: Record<string, string[]> = ProjectDependencyGraph.createProjectDependencyGraph(
            allProjectNames,
            fileToProjectsMap,
            fileToImportResolutionsMap,
            importBoundariesPluginConfig.assertionOptions?.ignoredProjects ?? []
        );

        performanceLogger.stopStopwatchAndLog('project-dependency-graph', 'Created projectDependencyGraph in:');

        return {
            fileToProjectsMap,
            fileToImportResolutionsMap,
            projectDependencyGraph
        };
    }

    private static async getPostResolvedAbsoluteFilePathToImportResolutionsMap(
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<FileToImportResolutionsMap> {
        const fileToImportResolutionsMapRaw: FileToImportResolutionsMap =
            await ImportResolutionUtil.getAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig.importResolvers
            );

        const fileToImportResolutionsMap: FileToImportResolutionsMap = await ImportBoundariesExecutor.postResolveIfNecessary(
            fileToImportResolutionsMapRaw,
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.postResolve,
            importBoundariesArgs
        );

        return fileToImportResolutionsMap;
    }

    private static async postResolveIfNecessary(
        fileToResolvedImportsMap: FileToImportResolutionsMap,
        yaniceJsonDirectoryPath: string,
        postResolverLocations: string[] | undefined,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<FileToImportResolutionsMap> {
        if (!postResolverLocations || postResolverLocations.length === 0 || importBoundariesArgs.skipPostResolvers) {
            return Promise.resolve(fileToResolvedImportsMap);
        }
        return PostResolver.postResolveProcessing(fileToResolvedImportsMap, yaniceJsonDirectoryPath, postResolverLocations);
    }

    /**
     * @param exitCode
     * @param shortMessage must be below 8192 bytes; otherwise, use LogUtil.writeToStdoutAsync
     */
    private static exitPlugin(exitCode: number, shortMessage: string | null): never {
        if (shortMessage) {
            LogUtil.log(shortMessage);
        }
        return process.exit(exitCode);
    }
}
