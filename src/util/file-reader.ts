import util from 'node:util';

import gracefulFs from 'graceful-fs';

const fsReadFile = util.promisify(gracefulFs.readFile);

export class FileReader {
    public static async readFile(absoluteFilePath: string): Promise<string> {
        return fsReadFile(absoluteFilePath, { encoding: 'utf-8' });
    }
}
