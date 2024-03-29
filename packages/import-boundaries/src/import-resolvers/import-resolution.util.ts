import fs from 'node:fs/promises';
import path from 'node:path';

import { GlobTester, PromiseCreator, PromiseQueue } from 'yanice';

import {
    FileToImportResolutions,
    FileToImportResolutionsMap,
    ImportResolution,
    YaniceImportBoundariesImportResolver
} from '../api/import-resolver.interface';
import { es6DeclarativeImportResolver } from './es6-declarative-imports/es6-declarative-import.resolver';
import { SkipStatementHandlingResult, SkipStatementsUtil } from './util/skip-statements.util';

export class ImportResolutionUtil {
    public static async getAbsoluteFilePathToImportResolutionsMap(
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importResolverMap: Record<string, string[] | undefined>
    ): Promise<FileToImportResolutionsMap> {
        const pathGlobs: string[] = Object.keys(importResolverMap);
        const loadedResolvers: Record<string, YaniceImportBoundariesImportResolver[] | undefined> = pathGlobs.reduce(
            (
                prev: Record<string, YaniceImportBoundariesImportResolver[] | undefined>,
                curr: string
            ): Record<string, YaniceImportBoundariesImportResolver[] | undefined> => {
                const resolverNamesOrLocations: string[] | undefined = importResolverMap[curr];
                prev[curr] = resolverNamesOrLocations?.map((resolverNameOrLocation: string): YaniceImportBoundariesImportResolver => {
                    return ImportResolutionUtil.getResolver(yaniceJsonDirectoryPath, resolverNameOrLocation);
                });
                return prev;
            },
            {}
        );
        return ImportResolutionUtil.resolveFileImportsStaggered(absolutePaths, pathGlobs, loadedResolvers, 100);
    }

    private static async resolveFileImportsStaggered(
        absolutePaths: string[],
        pathGlobs: string[],
        loadedResolvers: Record<string, YaniceImportBoundariesImportResolver[] | undefined>,
        maxConcurrency: number
    ): Promise<FileToImportResolutionsMap> {
        const fileToResolvedImportsMap: FileToImportResolutionsMap = {};
        const promiseCreators: PromiseCreator[] = absolutePaths.reduce(
            (prev: PromiseCreator[], absoluteFilePath: string): PromiseCreator[] => {
                const promiseCreatorsForGivenFile: PromiseCreator[] = pathGlobs
                    .filter((pathGlob: string) => GlobTester.isGlobMatching(absoluteFilePath, pathGlob))
                    .map((pathGlob: string): PromiseCreator => {
                        const resolvers: YaniceImportBoundariesImportResolver[] = loadedResolvers[pathGlob] ?? [];
                        return async (): Promise<void> => {
                            fileToResolvedImportsMap[absoluteFilePath] = await ImportResolutionUtil.resolveImports(
                                absoluteFilePath,
                                resolvers
                            );
                        };
                    });
                return prev.concat(promiseCreatorsForGivenFile);
            },
            []
        );
        const promiseQueue: PromiseQueue = PromiseQueue.createSimpleQueue(promiseCreators, maxConcurrency);
        await promiseQueue.startQueue();
        return fileToResolvedImportsMap;
    }

    private static async resolveImports(
        absoluteFilePath: string,
        resolvers: YaniceImportBoundariesImportResolver[]
    ): Promise<FileToImportResolutions> {
        const rawFileContent: string = await fs.readFile(absoluteFilePath, { encoding: 'utf-8' });
        const skipStatementHandlingResult: SkipStatementHandlingResult = SkipStatementsUtil.handleSkipStatements(rawFileContent);
        const importResolutionsPromise: Promise<ImportResolution | null>[] = resolvers.map(
            (resolver: YaniceImportBoundariesImportResolver): Promise<ImportResolution | null> => {
                return resolver.getFileImportMap(absoluteFilePath, skipStatementHandlingResult.inputWithoutSkipStatements);
            }
        );
        return Promise.all(importResolutionsPromise).then(
            (importResolutionsOrNull: (ImportResolution | null)[]): FileToImportResolutions => {
                const importResolutions: ImportResolution[] = importResolutionsOrNull.filter(
                    (importResolutionOrNull: ImportResolution | null): importResolutionOrNull is ImportResolution =>
                        !!importResolutionOrNull
                );
                return {
                    skippedImports: skipStatementHandlingResult.skipStatements,
                    importResolutions
                };
            }
        );
    }

    private static getResolver(yaniceJsonDirectoryPath: string, resolverNameOrLocation: string): YaniceImportBoundariesImportResolver {
        switch (resolverNameOrLocation) {
            case 'es6-declarative-import-resolver':
                return es6DeclarativeImportResolver;
            default: {
                return require(path.join(yaniceJsonDirectoryPath, resolverNameOrLocation));
            }
        }
    }
}
