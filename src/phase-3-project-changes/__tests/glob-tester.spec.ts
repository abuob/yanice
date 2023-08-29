import { expect } from 'chai';

import { GlobTester } from '../glob-tester';

describe('GlobTester', () => {
    describe('isGlobMatching', () => {
        it('should return true when the glob matches', () => {
            expect(GlobTester.isGlobMatching('some/path/file.ext', '**')).to.equal(true);
            expect(GlobTester.isGlobMatching('some/path/file.ext', '**/*.ext')).to.equal(true);
            expect(GlobTester.isGlobMatching('some/path/.file.ext', '**/*.ext')).to.equal(true);
            expect(GlobTester.isGlobMatching('some/.path/file.ext', '**/*.ext')).to.equal(true);
            expect(GlobTester.isGlobMatching('some/.path/file.ext', 'some/**')).to.equal(true);
        });
        it('should return false when the glob does not match', () => {
            expect(GlobTester.isGlobMatching('some/path/file.ext', '*.wrong')).to.equal(false);
        });
    });

    describe('filterByPattern', () => {
        it('should return all inputs, as they match the glob', () => {
            const pattern: string = 'some/path/**';
            const inputs: string[] = ['some/path/some.file', 'some/path/somedir'];
            const expected: string[] = inputs;
            const actual: string[] = GlobTester.filterByPattern(inputs, pattern);
            expect(actual).to.have.length(expected.length);
            expect(actual).to.have.same.ordered.members(expected);
        });

        it('should return no input, as they do not match the glob', () => {
            const pattern: string = 'some/path/**';
            const inputs: string[] = ['not-a-match', 'some/path-but-different'];
            const expected: string[] = [];
            const actual: string[] = GlobTester.filterByPattern(inputs, pattern);
            expect(actual).to.have.length(expected.length);
            expect(actual).to.have.same.ordered.members(expected);
        });
    });
});
