import path from 'node:path';

import { FileImportMap } from '../api/import-resolver.interface';
import { YaniceImportBoundariesPostResolver } from '../api/post-resolve.interface';

export class PostResolver {
    public static async postResolveProcessing(
        fileImportMaps: FileImportMap[],
        yaniceJsonDirectoryPath: string,
        postResolversLocations: string[]
    ): Promise<FileImportMap[]> {
        const postResolvers: YaniceImportBoundariesPostResolver[] = PostResolver.loadPostResolvers(
            yaniceJsonDirectoryPath,
            postResolversLocations
        );
        let updatedFileImportMaps: FileImportMap[] = fileImportMaps;
        for (const postResolver of postResolvers) {
            updatedFileImportMaps = await postResolver.postProcess(updatedFileImportMaps);
        }
        return updatedFileImportMaps;
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
