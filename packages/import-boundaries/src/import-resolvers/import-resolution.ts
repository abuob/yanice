import path from 'node:path';

import { FileReader, GlobTester } from 'yanice';

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

        const allFileImportMapPromises: Promise<FileImportMap[]>[] = [];

        absolutePaths.forEach((absoluteFilePath: string): void => {
            pathGlobs.forEach((pathGlob: string): void => {
                if (!GlobTester.isGlobMatching(absoluteFilePath, pathGlob)) {
                    return;
                }
                const resolvers: YaniceImportBoundariesImportResolver[] = loadedResolvers[pathGlob] ?? [];
                const fileImportMapPromisesPerGlob: Promise<FileImportMap[]> = ImportResolution.getFileImportMapPromises(
                    absoluteFilePath,
                    resolvers
                );
                allFileImportMapPromises.push(fileImportMapPromisesPerGlob);
            });
        });
        return Promise.all(allFileImportMapPromises).then((allFileImportMaps: FileImportMap[][]): FileImportMap[] => {
            return allFileImportMaps.flat();
        });
    }

    private static async getFileImportMapPromises(
        absoluteFilePath: string,
        resolvers: YaniceImportBoundariesImportResolver[]
    ): Promise<FileImportMap[]> {
        const fileContent: string = await FileReader.readFile(absoluteFilePath);
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
