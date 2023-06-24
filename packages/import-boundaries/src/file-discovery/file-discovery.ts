import fsPromises from 'fs/promises';
import path from 'path';
import { GlobTester } from 'yanice';

import { DirectoryContentNode, DirectoryNode, FileNode } from './file-discovery.type';

export class FileDiscovery {
    private static alwaysExcluded: string[] = ['.git', 'node_modules'];

    public static async getFilePathsRecursively(absoluteDirPath: string, exclusionGlobs: string[]): Promise<string[]> {
        const directoryNode: DirectoryNode = await FileDiscovery.createDirectoryTree(absoluteDirPath, exclusionGlobs);
        return FileDiscovery.getAllFilesInDirectoryRecursively(directoryNode);
    }

    /**
     * Only public for testing.
     */
    public static async createDirectoryTree(absoluteDirPath: string, exclusionGlobs: string[]): Promise<DirectoryNode> {
        const children: DirectoryContentNode[] = await FileDiscovery.getDirectoryContentTreeRecursively(absoluteDirPath, exclusionGlobs);
        return {
            type: 'directory',
            absolutePath: absoluteDirPath,
            children
        };
    }

    private static async getDirectoryContentTreeRecursively(
        absoluteDirPath: string,
        exclusionGlobs: string[]
    ): Promise<DirectoryContentNode[]> {
        const directoryContent: string[] = await fsPromises.readdir(absoluteDirPath);
        const filteredDirectoryContent: string[] = directoryContent.filter((fileOrDirectory: string) => {
            return !FileDiscovery.isMatchingExclusion(absoluteDirPath, fileOrDirectory, exclusionGlobs);
        });
        const entireDirectoryPromises: Promise<DirectoryContentNode>[] = filteredDirectoryContent.map(
            (fileOrDirectory: string): Promise<DirectoryContentNode> => {
                const absolutePathForFileOrDirectory: string = path.join(absoluteDirPath, fileOrDirectory);
                return fsPromises.stat(absolutePathForFileOrDirectory).then((fileOrDirectoryStats): Promise<DirectoryContentNode> => {
                    if (fileOrDirectoryStats.isDirectory()) {
                        return FileDiscovery.getDirectoryContentTreeRecursively(absolutePathForFileOrDirectory, exclusionGlobs).then(
                            (directoryContentNodes: DirectoryContentNode[]): DirectoryNode => {
                                return {
                                    type: 'directory',
                                    absolutePath: absolutePathForFileOrDirectory,
                                    children: directoryContentNodes
                                };
                            }
                        );
                    }
                    const file: FileNode = {
                        type: 'file',
                        absolutePath: absolutePathForFileOrDirectory,
                        fileName: fileOrDirectory
                    };
                    return Promise.resolve(file);
                });
            }
        );
        return Promise.all(entireDirectoryPromises);
    }

    private static getAllFilesInDirectoryRecursively(directoryContentNode: DirectoryNode): string[] {
        return directoryContentNode.children.reduce((prev: string[], curr: DirectoryContentNode): string[] => {
            if (curr.type === 'file') {
                return prev.concat(curr.absolutePath);
            }
            const filesInDirectory: string[] = FileDiscovery.getAllFilesInDirectoryRecursively(curr);
            return prev.concat(filesInDirectory);
        }, []);
    }

    private static isMatchingExclusion(absoluteDirPath: string, fileOrDirectoryName: string, exclusionGlobs: string[]): boolean {
        if (FileDiscovery.alwaysExcluded.includes(fileOrDirectoryName)) {
            return true;
        }
        const absolutePath: string = path.join(absoluteDirPath, fileOrDirectoryName);
        return exclusionGlobs.some((exclusionGlob: string) => GlobTester.isGlobMatching(absolutePath, exclusionGlob));
    }
}
