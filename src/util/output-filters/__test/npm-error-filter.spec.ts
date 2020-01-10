import { NpmErrorFilter } from '../npm-error-filter'
import { expect } from 'chai';

describe('NpmErrorFilter', () => {
    it('should only return true if a given output line contains npm error info', () => {
        const filter = new NpmErrorFilter();
        const output = 'hello world!\nnpm ERR! code ELIFECYCLE\nnpm ERR! errno 1';

        const filteredOutput = output.split('\n').filter(line => filter.filterOutputLine(line));
        expect(filteredOutput).to.have.same.members(['hello world!']);
    });
});
