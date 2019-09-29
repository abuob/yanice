import { expect } from "chai";
import { FindFileUtil } from '../find-file'

describe('FindFileUtil', () => {
    describe('findFileInParentDirs', () => {
        it('should be able to find some configuration files in this repo', () => {
            expect(FindFileUtil.findFileInParentDirs('tsconfig.json')).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirs('tslint.json')).to.not.equal(null);
            expect(FindFileUtil.findFileInParentDirs('package.json')).to.not.equal(null);
        });
    });
});
