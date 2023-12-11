import path from 'node:path';

import { ChangedProjects, YaniceProject } from 'yanice';

export class FileToProjectMapper {
    public static getFileToProjectsMap(
        absoluteFilePaths: string[],
        yaniceJsonDirectoryPath: string,
        yaniceProjects: YaniceProject[]
    ): Record<string, string[]> {
        const fileToProjectsMap: Record<string, string[]> = {};
        absoluteFilePaths.forEach((absoluteFilePath: string): void => {
            const relativePathToYaniceJson: string = FileToProjectMapper.convertAbsolutePathToYaniceJsonPath(
                yaniceJsonDirectoryPath,
                absoluteFilePath
            );
            fileToProjectsMap[absoluteFilePath] = ChangedProjects.getChangedProjectsRaw(yaniceProjects, [relativePathToYaniceJson]);
        });
        return fileToProjectsMap;
    }

    private static convertAbsolutePathToYaniceJsonPath(yaniceJsonDir: string, absoluteFilePath: string): string {
        return path.relative(yaniceJsonDir, absoluteFilePath);
    }
}
