import { expect } from 'chai';

import { KarmaProgressSuccessFilter } from '../karma-progress-success-filter';

describe('KarmaProgressSuccessFilter', () => {
    it('should only return true if a given output line contains karma progress partial success info (progress-reporter)', () => {
        const filter = new KarmaProgressSuccessFilter();
        const output = 'hello world!\nExecuted 1 of 2 SUCCESS\nExecuted 2 of 2 SUCCESS';

        const filteredOutput = output.split('\n').filter((line) => filter.filterOutputLine(line));
        expect(filteredOutput).to.have.same.members(['hello world!']);
    });
});
