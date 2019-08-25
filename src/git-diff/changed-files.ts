const execSync = require('child_process').execSync;

export class ChangedFiles {
    public static filesChangedBetweenTwoCommitHashes(sha1: string, sha2: string): string[] {
        return this.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${sha1} ${sha2}`);
    }

    public static uncommittedFiles(): string[] {
        return this.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only HEAD`);
    }

    public static filesChangedBetweenCurrentAndGivenBranch(branch: string, includeUncommitted: boolean): string[] {
        if (includeUncommitted) {
            return this.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only $(git merge-base --fork-point ${branch})`);
        }
        return this.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${branch}...HEAD`);
    }

    private static getGitDiffNameOnlyOutputAsArrayOfFiles(gitDiffCommand: string): string[] {
        return execSync(gitDiffCommand)
            .toString()
            .split('\n')
            .map((filePath: string) => filePath.trim())
            .filter((filePath: string) => filePath.length > 0);
    }
}
