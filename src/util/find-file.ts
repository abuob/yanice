import { statSync } from 'fs';
import * as path from 'path';

export class FindFileUtil {
    public static findFileInParentDirsFromInitialDir(fileName: string, initialDir: string): string | null {
        return FindFileUtil.findFileInParentDirsRecursively(initialDir, fileName);
    }

    private static findFileInParentDirsRecursively(currentDir: string, fileName: string): string | null {
        if (FindFileUtil.isFilePathValid(`${currentDir}/${fileName}`)) {
            // We found the file!
            return `${currentDir}/${fileName}`;
        }
        if (currentDir === '/' || path.dirname(currentDir) === currentDir) {
            // We cannot go further up
            return null;
        }
        // Go up recursively
        return FindFileUtil.findFileInParentDirsRecursively(path.dirname(currentDir), fileName);
    }

    private static isFilePathValid(filePath: string): boolean {
        try {
            return statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    }
}
