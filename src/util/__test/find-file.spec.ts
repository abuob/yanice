import { expect } from 'chai';

import { FindFileUtil } from '../find-file';

describe('FindFileUtil', () => {
    describe('findFileInParentDirsFromInitialDir', () => {
        it('should be able to find some configuration files at the root of this repo', () => {
            expect(FindFileUtil.findFileInParentDirsRecursively(__dirname, 'tsconfig.json')).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirsRecursively(__dirname, '.eslintrc.cjs')).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirsRecursively(__dirname, 'package.json')).to.not.equal(null);
        });

        it('should return null if it cannot find a file', () => {
            expect(FindFileUtil.findFileInParentDirsRecursively(__dirname, 'this-file-totally-does-not-exist')).to.equal(null);
        });
    });
});
