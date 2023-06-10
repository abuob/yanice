import { execSync } from 'node:child_process';
import path from 'node:path';

export class ChangedFiles {
    public static filesChangedBetweenTwoCommitHashes(sha1: string, sha2: string): string[] {
        return ChangedFiles.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${sha1} ${sha2}`);
    }

    public static uncommittedFiles(): string[] {
        return ChangedFiles.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff-index --name-only HEAD`);
    }

    public static filesChangedBetweenHeadAndGivenCommit(commitSHA: string, includeUncommitted: boolean): string[] {
        if (includeUncommitted) {
            return [
                ...ChangedFiles.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${commitSHA}...HEAD`),
                ...ChangedFiles.uncommittedFiles()
            ].reduce((prev: string[], curr): string[] => (prev.includes(curr) ? prev : prev.concat(curr)), []);
        }
        return ChangedFiles.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${commitSHA}...HEAD`);
    }

    public static gitCommandWithRevisionShaAsOutput(gitCommand: string): string {
        const output = execSync(gitCommand).toString();
        const nonEmptyLines: string[] = output
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
        const revisionSha: string | undefined = nonEmptyLines[0];
        if (!revisionSha) {
            throw new Error(`Unable to determine commitId: Unexpected output for "${gitCommand}", received:\n${output}`);
        }
        return revisionSha;
    }

    public static gitFilePathRelativeToYaniceJson(gitRepoRootPath: string, yaniceJsonDirPath: string, gitFilePath: string): string | null {
        const absoluteFilePath: string = path.join(gitRepoRootPath, gitFilePath);
        const filePathRelativeToYaniceJons = path.relative(yaniceJsonDirPath, absoluteFilePath);
        if (filePathRelativeToYaniceJons.startsWith('..')) {
            return null;
        }
        return filePathRelativeToYaniceJons.replace(/\\/g, '/');
    }

    private static getGitDiffNameOnlyOutputAsArrayOfFiles(gitDiffCommand: string): string[] {
        return execSync(gitDiffCommand)
            .toString()
            .split('\n')
            .map((filePath: string) => filePath.trim())
            .filter((filePath: string) => filePath.length > 0);
    }
}
