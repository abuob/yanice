import { expect } from 'chai';

import { LogUtil } from '../log-util';
import { KarmaProgressSuccessFilter } from '../output-filters/karma-progress-success-filter';
import { NpmErrorFilter } from '../output-filters/npm-error-filter';

describe('LogUtil', () => {
    describe('isOutputLineOkayToPrint', () => {
        it('should return true if at least one of the filters returns true for a given string', () => {
            const npmErrorFilter = new NpmErrorFilter();
            const karmaProgressSuccessFilter = new KarmaProgressSuccessFilter();

            const sampleLine0 = 'this one should be ok';
            const sampleLine1 = 'Executed 1 of 2 SUCCESS';
            const sampleLine2 = 'npm ERR! derp!';

            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter, karmaProgressSuccessFilter], sampleLine0)).to.equal(true);
            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter], sampleLine0)).to.equal(true);
            expect(LogUtil.isOutputLineOkayToPrint([karmaProgressSuccessFilter], sampleLine0)).to.equal(true);
            expect(LogUtil.isOutputLineOkayToPrint([], sampleLine0)).to.equal(true);

            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter, karmaProgressSuccessFilter], sampleLine1)).to.equal(false);
            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter], sampleLine1)).to.equal(true);
            expect(LogUtil.isOutputLineOkayToPrint([karmaProgressSuccessFilter], sampleLine1)).to.equal(false);
            expect(LogUtil.isOutputLineOkayToPrint([], sampleLine1)).to.equal(true);

            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter, karmaProgressSuccessFilter], sampleLine2)).to.equal(false);
            expect(LogUtil.isOutputLineOkayToPrint([npmErrorFilter], sampleLine2)).to.equal(false);
            expect(LogUtil.isOutputLineOkayToPrint([karmaProgressSuccessFilter], sampleLine2)).to.equal(true);
            expect(LogUtil.isOutputLineOkayToPrint([], sampleLine2)).to.equal(true);
        });
    });
});
