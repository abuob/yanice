import path from 'node:path';

import { FileToImportResolutions, FileToImportResolutionsMap } from '../api/import-resolver.interface';
import { YaniceImportBoundariesPostResolver } from '../api/post-resolve.interface';

export class PostResolver {
    public static async postResolveProcessing(
        fileToImportResolutionsMap: FileToImportResolutionsMap,
        yaniceJsonDirectoryPath: string,
        postResolversLocations: string[]
    ): Promise<FileToImportResolutionsMap> {
        const postResolvers: YaniceImportBoundariesPostResolver[] = PostResolver.loadPostResolvers(
            yaniceJsonDirectoryPath,
            postResolversLocations
        );
        const updatedFileToResolvedImportsMap: FileToImportResolutionsMap = fileToImportResolutionsMap;
        const absoluteFilePaths: string[] = Object.keys(fileToImportResolutionsMap);
        for (const absoluteFilePath of absoluteFilePaths) {
            for (const postResolver of postResolvers) {
                const currentFileToImportResolutions: FileToImportResolutions | undefined = fileToImportResolutionsMap[absoluteFilePath];
                if (!currentFileToImportResolutions) {
                    continue;
                }
                fileToImportResolutionsMap[absoluteFilePath] = await postResolver.postProcess(
                    absoluteFilePath,
                    currentFileToImportResolutions
                );
            }
        }
        return updatedFileToResolvedImportsMap;
    }

    private static loadPostResolvers(
        yaniceJsonDirectoryPath: string,
        postResolverLocations: string[]
    ): YaniceImportBoundariesPostResolver[] {
        return postResolverLocations.map((postResolverLocation: string): YaniceImportBoundariesPostResolver => {
            return require(path.join(yaniceJsonDirectoryPath, postResolverLocation));
        });
    }
}
