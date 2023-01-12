import { expect } from 'chai';
import { FindFileUtil } from '../find-file';

describe('FindFileUtil', () => {
    describe('findFileInParentDirsFromInitialDir', () => {
        it('should be able to find some configuration files at the root of this repo', () => {
            expect(FindFileUtil.findFileInParentDirsFromInitialDir('tsconfig.json', __dirname)).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirsFromInitialDir('.eslintrc.cjs', __dirname)).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirsFromInitialDir('package.json', __dirname)).to.not.equal(null);
        });

        it('should return null if it cannot find a file', () => {
            expect(FindFileUtil.findFileInParentDirsFromInitialDir('this-file-totally-does-not-exist', __dirname)).to.equal(null);
        });
    });
});
