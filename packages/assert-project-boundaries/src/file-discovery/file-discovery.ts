import fsPromises from 'fs/promises';
import path from 'path';
import { DirectoryContentNode, DirectoryNode, FileNode } from './file-discovery.type';

export class FileDiscovery {
    public static async getFilePathsRecursively(absoluteDirPath: string, exclusions: string[]): Promise<string[]> {
        const directoryNode: DirectoryNode = await FileDiscovery.createDirectoryTree(absoluteDirPath, exclusions);
        return FileDiscovery.getAllFilesInDirectoryRecursively(directoryNode);
    }

    public static async createDirectoryTree(absoluteDirPath: string, exclusions: string[]): Promise<DirectoryNode> {
        const children: DirectoryContentNode[] = await FileDiscovery.getDirectoryContentTreeRecursively(absoluteDirPath, exclusions);
        return {
            type: 'directory',
            absolutePath: absoluteDirPath,
            children
        };
    }

    public static async getDirectoryContentTreeRecursively(absoluteDirPath: string, exclusions: string[]): Promise<DirectoryContentNode[]> {
        const directoryContent: string[] = await fsPromises.readdir(absoluteDirPath);
        const filteredDirectoryContent: string[] = directoryContent.filter(
            (fileOrDirectory: string) => !exclusions.includes(fileOrDirectory)
        );
        const entireDirectoryPromises: Promise<DirectoryContentNode>[] = filteredDirectoryContent.map(
            (fileOrDirectory: string): Promise<DirectoryContentNode> => {
                const absolutePathForFileOrDirectory: string = path.join(absoluteDirPath, fileOrDirectory);
                return fsPromises.stat(absolutePathForFileOrDirectory).then((fileOrDirectoryStats): Promise<DirectoryContentNode> => {
                    if (fileOrDirectoryStats.isDirectory()) {
                        return FileDiscovery.getDirectoryContentTreeRecursively(absolutePathForFileOrDirectory, exclusions).then(
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
}
