import { execSync } from 'node:child_process';

import { expect } from 'chai';

import { ChangedFiles } from './changed-files';

describe('ChangedFiles', () => {
    describe('filesChangedBetweenTwoCommitHashes', () => {
        it('should be able to calculate the changed files between two commit hashes', () => {
            expect(
                ChangedFiles.filesChangedBetweenTwoCommitHashes(
                    '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48',
                    '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48'
                )
            ).to.have.same.members([]);
            expect(
                ChangedFiles.filesChangedBetweenTwoCommitHashes(
                    '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48',
                    '2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c'
                )
            ).to.have.same.members(['.gitignore']);
            expect(
                ChangedFiles.filesChangedBetweenTwoCommitHashes(
                    '2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c',
                    '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48'
                )
            ).to.have.same.members(['.gitignore']);
            expect(
                ChangedFiles.filesChangedBetweenTwoCommitHashes(
                    '4736ab23290bb239c74cf483744462c7f0d0da3e',
                    '2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c'
                )
            ).to.have.same.members(['.gitignore', 'package-lock.json', 'package.json', 'tsconfig.json', 'tslint.json']);
        });
    });

    describe('gitCommandWithRevisionShaAsOutput', () => {
        it('should be able to invoke git rev-parse and parse its output properly', () => {
            expect(ChangedFiles.gitCommandWithRevisionShaAsOutput('git rev-parse b23ded520')).to.equal(
                'b23ded5203046efc559d18a9846b21d610120533'
            );
            expect(ChangedFiles.gitCommandWithRevisionShaAsOutput('git rev-parse 0bd7920d8')).to.equal(
                '0bd7920d8df462e2da289bd8dc097a2d8e3191a2'
            );
        });
    });

    describe('filesChangedBetweenCurrentAndGivenBranch', () => {
        const temporaryBranchName = 'TEST-BRANCH-SHOULD-BE-DELETED';

        it('should be able to calculate changed files between current HEAD and a given branch', () => {
            execSync(`git branch ${temporaryBranchName} HEAD~1`);
            const commitSHA = ChangedFiles.gitCommandWithRevisionShaAsOutput(`git rev-parse ${temporaryBranchName}`);
            expect(ChangedFiles.filesChangedBetweenHeadAndGivenCommit(commitSHA, false)).to.have.same.members(
                execSync('git diff --name-only HEAD~1 HEAD')
                    .toString()
                    .split('\n')
                    .map((filePath: string) => filePath.trim())
                    .filter((filePath: string) => filePath.length > 0)
            );
        });

        afterEach(() => {
            execSync(`git branch -d ${temporaryBranchName}`);
        });
    });

    describe('gitFilePathRelativeToYaniceJson', () => {
        it('should return the original git-file-paths when yanice.json is in the repository-root', () => {
            expect(
                ChangedFiles.gitFilePathRelativeToYaniceJson('git/repo/root', 'git/repo/root', 'yanice/dir/some/path/file.json')
            ).to.equal('yanice/dir/some/path/file.json');
            expect(ChangedFiles.gitFilePathRelativeToYaniceJson('git/repo/root', 'git/repo/root', 'yanice.json')).to.equal('yanice.json');
        });

        it('should convert relative-file-paths to the repo-root to paths relative to yanice.json when yanice.json is not in root', () => {
            expect(
                ChangedFiles.gitFilePathRelativeToYaniceJson(
                    'git/repo/root/',
                    'git/repo/root/yanice-dir/',
                    'yanice-dir/some/path/file.json'
                )
            ).to.equal('some/path/file.json');
            expect(
                ChangedFiles.gitFilePathRelativeToYaniceJson('git/repo/root', 'git/repo/root/yanice-dir', 'yanice-dir/some/path/')
            ).to.equal('some/path');
            expect(
                ChangedFiles.gitFilePathRelativeToYaniceJson('git/repo/root', 'git/repo/root/yanice-dir', 'yanice-dir/some/path')
            ).to.equal('some/path');
        });

        it('should return null if the file is not in a subdirectory of the directory with the yanice.json file', () => {
            expect(
                ChangedFiles.gitFilePathRelativeToYaniceJson('git/repo/root/', 'git/repo/root/yanice-dir/', 'some-path-somewhere.json')
            ).to.equal(null);
        });
    });
});
