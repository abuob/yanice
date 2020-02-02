import { statSync } from 'fs';
import * as path from 'path';

export class FindFileUtil {
    public static findFileInParentDirsFromInitialDir(fileName: string, initialDir: string): string | null {
        return this.findFileInParentDirsRecursively(initialDir, fileName);
    }

    /**
     * @deprecated
     * TODO Remove
     */
    public static findFileInParentDirs(fileName: string): string | null {
        return this.findFileInParentDirsRecursively(process.cwd(), fileName);
    }

    private static findFileInParentDirsRecursively(currentDir: string, fileName: string): string | null {
        if (this.isFilePathValid(`${currentDir}/${fileName}`)) {
            // We found the file!
            return `${currentDir}/${fileName}`;
        }
        if (currentDir === '/' || path.dirname(currentDir) === currentDir) {
            // We cannot go further up
            return null;
        }
        // Go up recursively
        return this.findFileInParentDirsRecursively(path.dirname(currentDir), fileName);
    }

    private static isFilePathValid(filePath: string): boolean {
        try {
            return statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    }
}
