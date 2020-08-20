const execSync = require('child_process').execSync;

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
        return execSync(gitCommand)
            .toString()
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)[0];
    }

    private static getGitDiffNameOnlyOutputAsArrayOfFiles(gitDiffCommand: string): string[] {
        return execSync(gitDiffCommand)
            .toString()
            .split('\n')
            .map((filePath: string) => filePath.trim())
            .filter((filePath: string) => filePath.length > 0);
    }
}
