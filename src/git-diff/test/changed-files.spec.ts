import { ChangedFiles } from '../changed-files'
import { expect } from 'chai';

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
});
