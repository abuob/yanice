import {
    ImportBoundariesYanicePluginArgs,
    LogUtil,
    Phase3Result,
    YaniceCliArgs,
    YaniceConfig,
    YanicePluginImportBoundariesOptions,
    YaniceProject
} from 'yanice';

import { YaniceImportBoundariesAssertionViolation } from './api/assertion.interface';
import { ImportBoundaryAssertionData } from './api/import-boundary-assertion-data';
import { FileToImportResolutions } from './api/import-resolver.interface';
import { AssertionLogger } from './assertions/assertion-logger';
import { ImportBoundariesAssertions } from './assertions/import-boundaries-assertions';
import { FileToProjectMapper } from './file-to-project-mapper/file-to-project-mapper';
import { GitLsFilesUtil } from './file-to-project-mapper/git-ls-files.util';
import { ImportResolutionUtil } from './import-resolvers/import-resolution.util';
import { PostResolver } from './post-resolver/post-resolver';
import { ProjectDependencyGraph } from './project-dependency-graph/project-dependency-graph';

export class ImportBoundariesExecutor {
    public static async execute(phase3Result: Phase3Result): Promise<void> {
        const yaniceConfig: YaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
        const yaniceProjects: YaniceProject[] = yaniceConfig.projects;
        const yaniceJsonDirectoryPath: string = phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const gitRepoRootPath: string = phase3Result.phase2Result.phase1Result.gitRepoRootPath;
        const yaniceArgs: YaniceCliArgs = phase3Result.phase2Result.phase1Result.yaniceCliArgs;
        const importBoundariesPluginConfig: YanicePluginImportBoundariesOptions | null =
            yaniceConfig.plugins.officiallySupported['import-boundaries'];

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
                yaniceProjects
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
                yaniceProjects
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
                phase3Result
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
        const importResolutionsMap: Record<string, FileToImportResolutions> =
            await ImportBoundariesExecutor.getPostResolvedAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs
            );
        ImportBoundariesExecutor.exitPlugin(0, JSON.stringify(importResolutionsMap, null, 4));
    }

    private static async handlePrintAssertionData(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[]
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects
        );
        ImportBoundariesExecutor.exitPlugin(0, JSON.stringify(assertionData, null, 4));
    }

    private static async handleGenerateMode(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[]
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects
        );
        ImportBoundariesExecutor.exitPlugin(0, JSON.stringify(assertionData.projectDependencyGraph, null, 4));
    }

    private static async handleAssertMode(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[],
        phase3Result: Phase3Result
    ): Promise<void> {
        const assertionData: ImportBoundaryAssertionData = await ImportBoundariesExecutor.getImportBoundaryAssertionData(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            absolutePaths,
            importBoundariesPluginConfig,
            importBoundariesArgs,
            yaniceProjects
        );

        const assertionViolations: YaniceImportBoundariesAssertionViolation[] = await ImportBoundariesAssertions.assertImportBoundaries(
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.assertions ?? [],
            phase3Result,
            assertionData,
            importBoundariesPluginConfig
        );
        if (assertionViolations.length > 0) {
            AssertionLogger.logAssertionViolations(assertionViolations);
            ImportBoundariesExecutor.exitPlugin(1, null);
        }
        ImportBoundariesExecutor.exitPlugin(0, 'No import boundary violation found!');
    }

    private static async getImportBoundaryAssertionData(
        gitRepoRootPath: string,
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs,
        yaniceProjects: YaniceProject[]
    ): Promise<ImportBoundaryAssertionData> {
        // TODO: Add performance logging here

        const importResolutionsMap: Record<string, FileToImportResolutions> =
            await ImportBoundariesExecutor.getPostResolvedAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig,
                importBoundariesArgs
            );

        const fileToProjectsMap: Record<string, string[]> = await FileToProjectMapper.getFileToProjectsMap(
            gitRepoRootPath,
            yaniceJsonDirectoryPath,
            yaniceProjects
        );

        const allProjectNames: string[] = yaniceProjects.map((yaniceProject: YaniceProject): string => yaniceProject.projectName);
        const projectDependencyGraph: Record<string, string[]> = ProjectDependencyGraph.createProjectDependencyGraph(
            allProjectNames,
            fileToProjectsMap,
            importResolutionsMap
        );

        return {
            fileToProjectsMap,
            fileToImportResolutionsMap: importResolutionsMap,
            projectDependencyGraph
        };
    }

    private static async getPostResolvedAbsoluteFilePathToImportResolutionsMap(
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<Record<string, FileToImportResolutions>> {
        const fileToImportResolutionsMapRaw: Record<string, FileToImportResolutions> =
            await ImportResolutionUtil.getAbsoluteFilePathToImportResolutionsMap(
                yaniceJsonDirectoryPath,
                absolutePaths,
                importBoundariesPluginConfig.importResolvers
            );

        const fileToImportResolutionsMap: Record<string, FileToImportResolutions> = await ImportBoundariesExecutor.postResolveIfNecessaryV2(
            fileToImportResolutionsMapRaw,
            yaniceJsonDirectoryPath,
            importBoundariesPluginConfig.postResolve,
            importBoundariesArgs
        );

        return fileToImportResolutionsMap;
    }

    private static async postResolveIfNecessaryV2(
        fileToResolvedImportsMap: Record<string, FileToImportResolutions>,
        yaniceJsonDirectoryPath: string,
        postResolverLocations: string[] | undefined,
        importBoundariesArgs: ImportBoundariesYanicePluginArgs
    ): Promise<Record<string, FileToImportResolutions>> {
        if (!postResolverLocations || postResolverLocations.length === 0 || importBoundariesArgs.skipPostResolvers) {
            return Promise.resolve(fileToResolvedImportsMap);
        }
        return PostResolver.postResolveProcessing(fileToResolvedImportsMap, yaniceJsonDirectoryPath, postResolverLocations);
    }

    private static exitPlugin(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
