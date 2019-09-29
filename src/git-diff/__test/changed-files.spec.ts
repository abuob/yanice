import { ChangedFiles } from '../changed-files'
import { expect } from 'chai';
const execSync = require('child_process').execSync;

describe('ChangedFiles', () => {
    it('should be able to calculate the changed files between two commit hashes', () => {
        expect(ChangedFiles.filesChangedBetweenTwoCommitHashes('062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48', '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48')).to.have.same.members([]);
        expect(ChangedFiles.filesChangedBetweenTwoCommitHashes('062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48', '2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c')).to.have.same.members([
            ".gitignore"
        ]);
        expect(ChangedFiles.filesChangedBetweenTwoCommitHashes('2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c', '062f7b0a1ec63b81d229ef91e0db7cb75c9a1d48')).to.have.same.members([
            ".gitignore"
        ]);
        expect(ChangedFiles.filesChangedBetweenTwoCommitHashes('4736ab23290bb239c74cf483744462c7f0d0da3e', '2e8395ad8966fa01ad6e1eaa3aedd6c604bb9a2c')).to.have.same.members([
            ".gitignore",
            "package-lock.json",
            "package.json",
            "tsconfig.json",
            "tslint.json"
        ]);
    });

    describe('filesChangedBetweenCurrentAndGivenBranch', () => {
        it('should be able to calculate changed files between current branch and a given branch', () => {
            execSync('git branch TEST-BRANCH-SHOULD-BE-DELETED HEAD~1');
            expect(ChangedFiles.filesChangedBetweenCurrentAndGivenBranch('TEST-BRANCH-SHOULD-BE-DELETED', false)).to.have.same.members(
                execSync('git diff --name-only HEAD~1 HEAD').toString()
                    .split('\n')
                    .map((filePath:string) => filePath.trim())
                    .filter((filePath:string) => filePath.length > 0)
            );
        });

        it('should be able to calculate changed files between working tree and a given branch', () => {
            execSync('git branch TEST-BRANCH-SHOULD-BE-DELETED HEAD~1');
            expect(ChangedFiles.filesChangedBetweenCurrentAndGivenBranch('TEST-BRANCH-SHOULD-BE-DELETED', true)).to.have.same.members(
                execSync('git diff --name-only HEAD~1').toString()
                    .split('\n')
                    .map((filePath:string) => filePath.trim())
                    .filter((filePath:string) => filePath.length > 0)
            );
        });

        afterEach(() => {
            execSync('git branch -d TEST-BRANCH-SHOULD-BE-DELETED');
        });
    });
});
