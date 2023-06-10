import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class FindFileUtil {
    public static findFileInParentDirsRecursively(currentDir: string, fileName: string): string | null {
        const filePathForCurrentDir: string = path.join(currentDir, fileName);
        if (FindFileUtil.isFilePathValid(filePathForCurrentDir)) {
            // We found the file!
            return filePathForCurrentDir;
        }
        const parentDir: string = path.dirname(currentDir);
        if (parentDir === currentDir) {
            // We cannot go further up
            return null;
        }
        // Go up recursively
        return FindFileUtil.findFileInParentDirsRecursively(parentDir, fileName);
    }

    public static getGitRoot(yaniceJsonDirPath: string): string | null {
        try {
            return execSync('git rev-parse --show-toplevel', { cwd: yaniceJsonDirPath }).toString().trim();
        } catch (e) {
            return null;
        }
    }

    private static isFilePathValid(filePath: string): boolean {
        try {
            return fs.statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    }
}
