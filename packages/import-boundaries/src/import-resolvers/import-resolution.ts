import fs from 'node:fs/promises';
import path from 'node:path';

import { GlobTester, PromiseCreator, PromiseQueue } from 'yanice';

import { FileImportMap, YaniceImportBoundariesImportResolver } from '../api/import-resolver.interface';
import { importResolverEs6 } from './es6/import-resolver.es6';

export class ImportResolution {
    public static async getImportMaps(
        yaniceJsonDirectoryPath: string,
        absolutePaths: string[],
        importResolverMap: Record<string, string[] | undefined>
    ): Promise<FileImportMap[]> {
        const pathGlobs: string[] = Object.keys(importResolverMap);
        const loadedResolvers: Record<string, YaniceImportBoundariesImportResolver[] | undefined> = pathGlobs.reduce(
            (
                prev: Record<string, YaniceImportBoundariesImportResolver[] | undefined>,
                curr: string
            ): Record<string, YaniceImportBoundariesImportResolver[] | undefined> => {
                const resolverNamesOrLocations: string[] | undefined = importResolverMap[curr];
                prev[curr] = resolverNamesOrLocations?.map((resolverNameOrLocation: string): YaniceImportBoundariesImportResolver => {
                    return ImportResolution.getResolver(yaniceJsonDirectoryPath, resolverNameOrLocation);
                });
                return prev;
            },
            {}
        );
        return ImportResolution.getAllFileImportMapPromisesStaggered(absolutePaths, pathGlobs, loadedResolvers, 100);
    }

    private static async getAllFileImportMapPromisesStaggered(
        absolutePaths: string[],
        pathGlobs: string[],
        loadedResolvers: Record<string, YaniceImportBoundariesImportResolver[] | undefined>,
        maxConcurrency: number
    ): Promise<FileImportMap[]> {
        const allFileImportMaps: FileImportMap[] = [];
        const promiseCreators: PromiseCreator[] = absolutePaths.reduce(
            (prev: PromiseCreator[], absoluteFilePath: string): PromiseCreator[] => {
                const promiseCreatorsForGivenFile: PromiseCreator[] = pathGlobs
                    .filter((pathGlob: string) => GlobTester.isGlobMatching(absoluteFilePath, pathGlob))
                    .map((pathGlob: string): PromiseCreator => {
                        const resolvers: YaniceImportBoundariesImportResolver[] = loadedResolvers[pathGlob] ?? [];
                        return async (): Promise<void> => {
                            const fileImportMap: FileImportMap[] = await ImportResolution.getFileImportMapPromises(
                                absoluteFilePath,
                                resolvers
                            );
                            allFileImportMaps.push(...fileImportMap);
                        };
                    });
                return prev.concat(promiseCreatorsForGivenFile);
            },
            []
        );
        const promiseQueue: PromiseQueue = PromiseQueue.createSimpleQueue(promiseCreators, maxConcurrency);
        await promiseQueue.startQueue();
        return allFileImportMaps;
    }

    private static async getFileImportMapPromises(
        absoluteFilePath: string,
        resolvers: YaniceImportBoundariesImportResolver[]
    ): Promise<FileImportMap[]> {
        const fileContent: string = await fs.readFile(absoluteFilePath, { encoding: 'utf-8' });
        const fileImportMapPromises: Promise<FileImportMap | null>[] = resolvers.map(
            (resolver: YaniceImportBoundariesImportResolver): Promise<FileImportMap | null> => {
                return resolver.getFileImportMap(absoluteFilePath, fileContent);
            }
        );
        return Promise.all(fileImportMapPromises).then((fileImportMaps: (FileImportMap | null)[]): FileImportMap[] => {
            return fileImportMaps.filter((fileImportMap: FileImportMap | null): fileImportMap is FileImportMap => !!fileImportMap);
        });
    }

    private static getResolver(yaniceJsonDirectoryPath: string, resolverNameOrLocation: string): YaniceImportBoundariesImportResolver {
        switch (resolverNameOrLocation) {
            case 'import-resolver-es6':
                return importResolverEs6;
            default: {
                return require(path.join(yaniceJsonDirectoryPath, resolverNameOrLocation));
            }
        }
    }
}
