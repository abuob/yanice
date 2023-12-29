import { expect } from 'chai';

import { YaniceCliArgs } from '../cli-args.interface';
import { YaniceCliArgsParser } from '../cli-args-parser';

describe('YaniceCliArgsParser', () => {
    describe('bad input', () => {});
    it('should handle bad input properly', () => {
        expect(YaniceCliArgsParser.parseArgs([])).to.equal(null);
        expect(YaniceCliArgsParser.parseArgs(['invalid'])).to.equal(null);
    });

    describe('run', () => {
        it('should handle input for run', () => {
            const expected: YaniceCliArgs = {
                type: 'run',
                concurrency: 4,
                outputMode: null,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: false,
                    includeUncommitted: true,
                    isPerformanceLoggingEnabled: false
                }
            };
            expect(YaniceCliArgsParser.parseArgs(['run', 'some-scope', '--concurrency=4'])).to.deep.equal(expected);
        });

        it('should parse --output-mode correctly', () => {
            const expectedAppendAtEnd: YaniceCliArgs = {
                type: 'run',
                concurrency: 1,
                outputMode: 'append-at-end',
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: false,
                    includeUncommitted: true,
                    isPerformanceLoggingEnabled: false
                }
            };
            const expectedAppendAtEndOnError: YaniceCliArgs = {
                ...expectedAppendAtEnd,
                outputMode: 'append-at-end-on-error'
            };
            const expectedIgnore: YaniceCliArgs = {
                ...expectedAppendAtEnd,
                outputMode: 'ignore'
            };
            const expectedNull: YaniceCliArgs = {
                ...expectedAppendAtEnd,
                outputMode: null
            };
            expect(YaniceCliArgsParser.parseArgs(['run', 'some-scope', '--output-mode=append-at-end-on-error'])).to.deep.equal(
                expectedAppendAtEndOnError
            );
            expect(YaniceCliArgsParser.parseArgs(['run', 'some-scope', '--output-mode=append-at-end'])).to.deep.equal(expectedAppendAtEnd);
            expect(YaniceCliArgsParser.parseArgs(['run', 'some-scope', '--output-mode=ignore'])).to.deep.equal(expectedIgnore);
            expect(YaniceCliArgsParser.parseArgs(['run', 'some-scope'])).to.deep.equal(expectedNull);
        });
    });

    describe('output-only', () => {
        it('should handle input for output-only', () => {
            const expected: YaniceCliArgs = {
                type: 'output-only',
                isResponsiblesMode: true,
                includeFiltered: false,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: null,
                    includeAllProjects: true,
                    includeUncommitted: true,
                    isPerformanceLoggingEnabled: true
                }
            };
            expect(YaniceCliArgsParser.parseArgs(['output-only', 'some-scope', '--all', '--responsibles', '--perf-log'])).to.deep.equal(
                expected
            );
        });
    });

    describe('visualize', () => {
        it('should handle input for visualize', () => {
            const expected: YaniceCliArgs = {
                type: 'visualize',
                renderer: 'vizjs',
                saveVisualization: true,
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: 'HEAD',
                    includeAllProjects: false,
                    includeUncommitted: true,
                    isPerformanceLoggingEnabled: false
                }
            };
            expect(
                YaniceCliArgsParser.parseArgs(['visualize', 'some-scope', '--rev=HEAD', '--renderer=vizjs', '--save-visualization'])
            ).to.deep.equal(expected);
        });
    });

    describe('plugin', () => {
        it('should handle input for plugin', () => {
            const expected: YaniceCliArgs = {
                type: 'plugin',
                selectedPlugin: {
                    type: 'custom',
                    pluginName: 'dummy-plugin',
                    cliArgs: ['plugin:dummy-plugin', 'some-scope', '--branch=origin/main', '--exclude-uncommitted']
                },
                defaultArgs: {
                    scope: 'some-scope',
                    diffTarget: 'origin/main',
                    includeAllProjects: false,
                    includeUncommitted: false,
                    isPerformanceLoggingEnabled: false
                }
            };
            expect(
                YaniceCliArgsParser.parseArgs(['plugin:dummy-plugin', 'some-scope', '--branch=origin/main', '--exclude-uncommitted'])
            ).to.deep.equal(expected);
        });
    });
});
