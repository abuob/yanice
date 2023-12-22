import path from 'node:path';

import { expect } from 'chai';

import { GitLsFilesUtil } from '../git-ls-files.util';
describe('GitLsFilesUtil', (): void => {
    describe('gitLsFiles', (): void => {
        it('should return the file-name of this test-file when invoked on the containing directory', async (): Promise<void> => {
            const filePaths: string[] = await GitLsFilesUtil.gitLsFiles(__dirname, '.');
            const testFileName: string = path.basename(__filename);

            expect(filePaths.length).to.be.greaterThan(0);
            expect(filePaths).to.include(testFileName);
        });
    });
});
