export type DirectoryContentNode = DirectoryNode | FileNode;

export interface FileNode {
    type: 'file';
    absolutePath: string;
    fileName: string;
}

export interface DirectoryNode {
    type: 'directory';
    absolutePath: string;
    children: DirectoryContentNode[];
}
