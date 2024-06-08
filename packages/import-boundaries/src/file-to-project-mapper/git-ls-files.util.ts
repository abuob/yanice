import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export class GitLsFilesUtil {
    public static async getAllAbsoluteFilePathsInYaniceRoot(gitRepoRootPath: string, yaniceJsonDirectoryPath: string): Promise<string[]> {
        const allFilesInYaniceRootRelativeToGitRoot: string[] = await GitLsFilesUtil.gitLsFiles(gitRepoRootPath, yaniceJsonDirectoryPath);
        return allFilesInYaniceRootRelativeToGitRoot
            .map((filePathRelativeToGitRoot: string): string => {
                return path.join(gitRepoRootPath, filePathRelativeToGitRoot);
            })
            .filter((absoluteFilePath: string): boolean => {
                // When a file is deleted but the change is not yet staged, git-ls-files still returns that file.
                // Could probably be suppressed with the correct incantation of git-flags,
                // but that is unfortunately infinitely less trivial than this check here...
                return fs.existsSync(absoluteFilePath);
            });
    }

    public static async gitLsFiles(workingDirectory: string, lsFilesDirectoryParameter: string): Promise<string[]> {
        return new Promise((resolve): void => {
            const gitProcess = spawn('git', ['ls-files', lsFilesDirectoryParameter, '-c', '-o', '--exclude-standard'], {
                cwd: workingDirectory
            });
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
