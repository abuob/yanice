import path from 'node:path';

import { FileToImportResolutions } from '../api/import-resolver.interface';
import { YaniceImportBoundariesPostResolverV2 } from '../api/post-resolve.interface';

export class PostResolver {
    public static async postResolveProcessing(
        fileToResolvedImportsMap: Record<string, FileToImportResolutions>,
        yaniceJsonDirectoryPath: string,
        postResolversLocations: string[]
    ): Promise<Record<string, FileToImportResolutions>> {
        const postResolvers: YaniceImportBoundariesPostResolverV2[] = PostResolver.loadPostResolvers(
            yaniceJsonDirectoryPath,
            postResolversLocations
        );
        const updatedFileToResolvedImportsMap: Record<string, FileToImportResolutions> = fileToResolvedImportsMap;
        const absoluteFilePaths: string[] = Object.keys(fileToResolvedImportsMap);
        for (const absoluteFilePath of absoluteFilePaths) {
            for (const postResolver of postResolvers) {
                const currentFileToImportResolutions: FileToImportResolutions | undefined = fileToResolvedImportsMap[absoluteFilePath];
                if (!currentFileToImportResolutions) {
                    continue;
                }
                fileToResolvedImportsMap[absoluteFilePath] = await postResolver.postProcess(
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
    ): YaniceImportBoundariesPostResolverV2[] {
        return postResolverLocations.map((postResolverLocation: string): YaniceImportBoundariesPostResolverV2 => {
            return require(path.join(yaniceJsonDirectoryPath, postResolverLocation));
        });
    }
}
