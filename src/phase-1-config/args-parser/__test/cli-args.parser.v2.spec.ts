import { YaniceCliArgsParserV2 } from '../cli-args-parser.v2';
import { expect } from 'chai';
import { YaniceCliArgsV2 } from '../cli-args.interface';

describe('YaniceCliArgsParserV2', () => {
    describe('bad input', () => {});
    it('should handle bad input properly', () => {
        expect(YaniceCliArgsParserV2.parseArgsV2([])).to.equal(null);
        expect(YaniceCliArgsParserV2.parseArgsV2(['invalid'])).to.equal(null);
    });

    describe('run', () => {
        it('should handle input for run', () => {
            const expected: YaniceCliArgsV2 = {
                type: 'run',
                concurrency: 4,
                outputMode: null,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: false,
                    includeUncommitted: true
                }
            };
            expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope', '--concurrency=4'])).to.deep.equal(expected);
        });

        it('should parse --output-mode correctly', () => {
            const expectedAppendAtEnd: YaniceCliArgsV2 = {
                type: 'run',
                concurrency: 1,
                outputMode: 'append-at-end',
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: false,
                    includeUncommitted: true
                }
            };
            const expectedAppendAtEndOnError: YaniceCliArgsV2 = {
                ...expectedAppendAtEnd,
                outputMode: 'append-at-end-on-error'
            };
            const expectedIgnore: YaniceCliArgsV2 = {
                ...expectedAppendAtEnd,
                outputMode: 'ignore'
            };
            const expectedNull: YaniceCliArgsV2 = {
                ...expectedAppendAtEnd,
                outputMode: null
            };
            expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope', '--output-mode=append-at-end-on-error'])).to.deep.equal(
                expectedAppendAtEndOnError
            );
            expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope', '--output-mode=append-at-end'])).to.deep.equal(
                expectedAppendAtEnd
            );
            expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope', '--output-mode=ignore'])).to.deep.equal(expectedIgnore);
            expect(YaniceCliArgsParserV2.parseArgsV2(['run', 'some-scope'])).to.deep.equal(expectedNull);
        });
    });

    describe('output-only', () => {
        it('should handle input for output-only', () => {
            const expected: YaniceCliArgsV2 = {
                type: 'output-only',
                isResponsiblesMode: true,
                includeFiltered: false,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: true,
                    includeUncommitted: true
                }
            };
            expect(YaniceCliArgsParserV2.parseArgsV2(['output-only', 'some-scope', '--all', '--responsibles'])).to.deep.equal(expected);
        });
    });

    describe('visualize', () => {
        it('should handle input for visualize', () => {
            const expected: YaniceCliArgsV2 = {
                type: 'visualize',
                renderer: 'vizjs',
                saveVisualization: true,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: 'HEAD',
                    includeAllProjects: false,
                    includeUncommitted: true
                }
            };
            expect(
                YaniceCliArgsParserV2.parseArgsV2(['visualize', 'some-scope', '--rev=HEAD', '--renderer=vizjs', '--save-visualization'])
            ).to.deep.equal(expected);
        });
    });

    describe('plugin', () => {
        it('should handle input for plugin', () => {
            const expected: YaniceCliArgsV2 = {
                type: 'plugin',
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: 'origin/main',
                    includeAllProjects: false,
                    includeUncommitted: false
                }
            };
            expect(
                YaniceCliArgsParserV2.parseArgsV2(['plugin', 'some-scope', '--branch=origin/main', '--exclude-uncommitted'])
            ).to.deep.equal(expected);
        });
    });
});
