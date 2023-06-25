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
        return PostResolver.applyPostResolversRecursively(postResolvers, fileImportMaps);
    }

    private static async applyPostResolversRecursively(
        postResolvers: YaniceImportBoundariesPostResolver[],
        fileImportMaps: FileImportMap[]
    ): Promise<FileImportMap[]> {
        const nextResolver: YaniceImportBoundariesPostResolver | undefined = postResolvers[0];
        if (postResolvers.length === 0 || !nextResolver) {
            return Promise.resolve(fileImportMaps);
        }
        const newFileImportMaps: FileImportMap[] = await nextResolver.postProcess(fileImportMaps);
        return PostResolver.applyPostResolversRecursively(postResolvers.slice(1), newFileImportMaps);
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
