import { spawn } from 'node:child_process';

export class GitLsFilesUtil {
    public static async gitLsFiles(workingDirectory: string, lsFilesDirectoryParameter: string): Promise<string[]> {
        return new Promise((resolve): void => {
            const gitProcess = spawn('git', ['ls-files', lsFilesDirectoryParameter, '-c', '-o'], { cwd: workingDirectory });
            let gitProcessStdout: string = '';
            gitProcess.stdout.on('data', (data): void => {
                gitProcessStdout += data.toString();
            });
            gitProcess.stderr.on('data', (error): void => {
                throw new Error(error);
            });
            gitProcess.on('close', (code: number | null): void => {
                if (code !== 0 && !!code) {
                    process.exit(code);
                }
                const filePaths: string[] = gitProcessStdout
                    .split('\n')
                    .map((line: string): string => line.trim())
                    .filter((line: string): boolean => line.length > 0);
                resolve(filePaths);
            });
        });
    }
}
