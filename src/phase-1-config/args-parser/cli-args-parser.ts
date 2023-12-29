import { commandOutputOptionsType } from '../config/config.interface';
import {
    YaniceCliArgs,
    YaniceCliArgsOutputOnly,
    YaniceCliArgsPlugin,
    YaniceCliArgsRun,
    YaniceCliArgsVisualize,
    YaniceCliDefaultArgs,
    YaniceModeType
} from './cli-args.interface';
import { YaniceImportBoundariesModeType } from './plugin.type';

export class YaniceCliArgsParser {
    public static determineYaniceMode(firstParameter: string | null | undefined): YaniceModeType | null {
        if (!firstParameter) {
            return null;
        }
        switch (true) {
            case /^run$/.test(firstParameter):
                return 'run';
            case /^output-only$/.test(firstParameter):
                return 'output-only';
            case /^visualize$/.test(firstParameter):
                return 'visualize';
            case /^plugin:[a-zA-Z][0-9a-zA-Z-]*$/.test(firstParameter):
                return 'plugin';
            default:
                return null;
        }
    }

    public static parseArgs(args: string[]): YaniceCliArgs | null {
        const yaniceMode: YaniceModeType | null = YaniceCliArgsParser.determineYaniceMode(args[0]);
        switch (yaniceMode) {
            case 'run':
                return YaniceCliArgsParser.handleRunArgs(args);
            case 'output-only':
                return YaniceCliArgsParser.handleOutputOnlyArgs(args);
            case 'visualize':
                return YaniceCliArgsParser.handleVisualizeArgs(args);
            case 'plugin':
                return YaniceCliArgsParser.handlePluginArgs(args);
            case null:
                return null;
        }
    }

    private static handleRunArgs(args: string[]): YaniceCliArgsRun {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParser.handleDefaultArgs(args);
        const concurrencyParameter: string | undefined = args.find((arg: string) => {
            return /^--concurrency=(\d)+$/.test(arg);
        });
        const concurrency: number = (concurrencyParameter && parseInt(concurrencyParameter.replace(/--concurrency=/, ''), 10)) || 1;

        const outputModeParameter: string | undefined = args.find((arg: string) => {
            return /^--output-mode=/.test(arg);
        });

        const outputMode: YaniceCliArgsRun['outputMode'] = YaniceCliArgsParser.getOutputMode(outputModeParameter);
        return {
            type: 'run',
            defaultArgs,
            concurrency,
            outputMode
        };
    }

    private static handleOutputOnlyArgs(args: string[]): YaniceCliArgsOutputOnly {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParser.handleDefaultArgs(args);
        const isResponsiblesMode: boolean = YaniceCliArgsParser.hasArgument(args, /^--responsibles$/);
        const includeFiltered: boolean = YaniceCliArgsParser.hasArgument(args, /^--include-filtered$/);
        return {
            type: 'output-only',
            isResponsiblesMode,
            includeFiltered,
            defaultArgs
        };
    }

    private static handleVisualizeArgs(args: string[]): YaniceCliArgsVisualize {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParser.handleDefaultArgs(args);
        const isSomeArgRendererVizJs: boolean = YaniceCliArgsParser.hasArgument(args, /^--renderer=vizjs$/);
        const renderer: 'dagrejs' | 'vizjs' = isSomeArgRendererVizJs ? 'vizjs' : 'dagrejs';
        const saveVisualization: boolean = YaniceCliArgsParser.hasArgument(args, /^--save-visualization$/);
        return {
            type: 'visualize',
            defaultArgs,
            renderer,
            saveVisualization
        };
    }

    private static handlePluginArgs(args: string[]): YaniceCliArgsPlugin {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParser.handleDefaultArgs(args);
        const pluginName: string | undefined = args[0]?.split(':')?.[1];
        switch (pluginName) {
            case 'import-boundaries': {
                return {
                    type: 'plugin',
                    selectedPlugin: {
                        type: 'import-boundaries',
                        mode: YaniceCliArgsParser.getImportBoundariesModeArgument(args),
                        skipPostResolvers: YaniceCliArgsParser.hasArgument(args, /^--skip-post-resolvers$/)
                    },
                    defaultArgs
                };
            }
        }
        return {
            type: 'plugin',
            selectedPlugin: {
                type: 'custom',
                cliArgs: args,
                pluginName: pluginName ?? '' // TODO: Handle error
            },
            defaultArgs
        };
    }

    private static handleDefaultArgs(args: string[]): YaniceCliDefaultArgs {
        const scope: string | null = args[1] ?? null;
        const argsWithoutRunTypeAndScope: string[] = args.slice(2);
        const diffTargetParameter: string | undefined = argsWithoutRunTypeAndScope.find((arg: string) => {
            return /^--(commit|branch|rev)=/.test(arg);
        });
        const diffTarget: string | null = diffTargetParameter ? diffTargetParameter.replace(/--.*?=/, '') : null;
        const includeUncommitted: boolean = !args.some((arg: string) => /^--exclude-uncommitted$/.test(arg));
        const isPerformanceLoggingEnabled: boolean = YaniceCliArgsParser.hasArgument(args, /^--(performance-logging|perf-log)$/);
        return {
            includeAllProjects: args.includes('--all'),
            diffTarget,
            scope,
            includeUncommitted,
            isPerformanceLoggingEnabled
        };
    }

    private static getOutputMode(outputModeArg: string | undefined): commandOutputOptionsType | null {
        const outputModeValue: string | undefined = outputModeArg?.replace('--output-mode=', '');
        switch (outputModeValue) {
            case 'append-at-end':
                return 'append-at-end';
            case 'append-at-end-on-error':
                return 'append-at-end-on-error';
            case 'ignore':
                return 'ignore';
        }
        return null;
    }

    private static getImportBoundariesModeArgument(args: string[]): YaniceImportBoundariesModeType {
        if (YaniceCliArgsParser.hasArgument(args, /^--print-file-imports$/)) {
            return 'print-file-imports';
        }
        if (YaniceCliArgsParser.hasArgument(args, /^--print-assertion-data$/)) {
            return 'print-assertion-data';
        }
        if (YaniceCliArgsParser.hasArgument(args, /^--generate$/)) {
            return 'generate';
        }
        return 'assert';
    }

    private static hasArgument(args: string[], argRegExp: RegExp): boolean {
        return args.some((arg: string): boolean => argRegExp.test(arg));
    }
}
