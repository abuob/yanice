const execSync = require('child_process').execSync;

export class ChangedFiles {
    public static filesChangedBetweenTwoCommitHashes(sha1: string, sha2: string): string[] {
        return this.getGitDiffNameOnlyOutputAsArrayOfFiles(`git diff --name-only ${sha1} ${sha2}`);
    }

    private static getGitDiffNameOnlyOutputAsArrayOfFiles(gitDiffCommand: string): string[] {
        return execSync(gitDiffCommand).toString()
            .split('\n')
            .map((filePath:string) => filePath.trim())
            .filter((filePath:string) => filePath.length > 0);
    }
}
