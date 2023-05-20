import { YaniceCliArgsParserV2 } from '../cli-args-parser.v2';
import { expect } from 'chai';
import { YaniceCliArgsV2 } from '../cli-args.interface';

describe('YaniceCliArgsParserV2', () => {
    it('should handle bad input properly', () => {
        expect(YaniceCliArgsParserV2.parseArgsV2([])).to.equal(null);
        expect(YaniceCliArgsParserV2.parseArgsV2(['invalid'])).to.equal(null);
    });

    it('should handle input for run', () => {
        const expected: YaniceCliArgsV2 = {
            type: 'run',
            defaultArgs: {
                scope: 'some-scope',
                diffTarget: null,
                includeAllProjects: false
            }
        };
        expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope'])).to.deep.equal(expected);
    });

    it('should handle input for output-only', () => {
        const expected: YaniceCliArgsV2 = {
            type: 'output-only',
            defaultArgs: {
                scope: 'some-scope',
                diffTarget: null,
                includeAllProjects: true
            }
        };
        expect(YaniceCliArgsParserV2.parseArgsV2(['output-only', 'some-scope', '--all'])).to.deep.equal(expected);
    });

    it('should handle input for visualize', () => {
        const expected: YaniceCliArgsV2 = {
            type: 'visualize',
            renderer: 'vizjs',
            defaultArgs: {
                scope: 'some-scope',
                diffTarget: 'HEAD',
                includeAllProjects: false
            }
        };
        expect(YaniceCliArgsParserV2.parseArgsV2(['visualize', 'some-scope', '--rev=HEAD', '--renderer=vizjs'])).to.deep.equal(expected);
    });

    it('should handle input for plugin', () => {
        const expected: YaniceCliArgsV2 = {
            type: 'plugin',
            defaultArgs: {
                scope: 'some-scope',
                diffTarget: 'origin/main',
                includeAllProjects: false
            }
        };
        expect(YaniceCliArgsParserV2.parseArgsV2(['plugin', 'some-scope', '--branch=origin/main'])).to.deep.equal(expected);
    });
});
