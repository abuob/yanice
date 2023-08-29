import { expect } from 'chai';

import { FileReader } from '../file-reader';

describe('FileReader', () => {
    describe('readFile', () => {
        it('should be able to read a file', async () => {
            const thisTestFile: string = await FileReader.readFile(__filename);
            const firstLine: string | undefined = thisTestFile.split('\n')[0]?.trim();
            expect(firstLine).to.equal("import { expect } from 'chai';");
        });
    });
});
