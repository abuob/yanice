import { expect } from 'chai';

import { SkipNextLineStatement } from '../../../api/import-resolver.interface';
import { SkipStatementHandlingResult, SkipStatementsUtil } from '../skip-statements.util';

describe('SkipStatementsUtil', () => {
    describe('handleSkipStatements', () => {
        it('should return', () => {
            const input: string =
                'some-line\n' +
                '@yanice:import-boundaries ignore-next-line\n' +
                'ignored-line\n' +
                'some-line\n' +
                '@yanice:import-boundaries ignore-next-line    \n' +
                '   ignored-line   \r  \r\n' +
                'some-line\n' +
                '@yanice:import-boundaries ignore-next-line    \n' +
                '   ignored-line';
            const actual: SkipStatementHandlingResult = SkipStatementsUtil.handleSkipStatements(input);

            const expectedNonIgnoredOutput: string = 'some-line\nsome-line\nsome-line\n';
            const expectedSkippedStatements: SkipNextLineStatement[] = [
                {
                    raw: '@yanice:import-boundaries ignore-next-line\nignored-line\n',
                    type: 'skip-next-line'
                },
                {
                    raw: '@yanice:import-boundaries ignore-next-line    \n   ignored-line   \r  \r\n',
                    type: 'skip-next-line'
                },
                {
                    raw: '@yanice:import-boundaries ignore-next-line    \n   ignored-line',
                    type: 'skip-next-line'
                }
            ];
            expect(actual.inputWithoutSkipStatements).to.equal(expectedNonIgnoredOutput);
            expect(actual.skipStatements).to.deep.equal(expectedSkippedStatements);
        });
    });
});
