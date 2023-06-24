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
});
