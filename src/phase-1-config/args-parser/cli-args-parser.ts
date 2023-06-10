import {
    YaniceCliArgsOutputOnly,
    YaniceCliArgsPlugin,
    YaniceCliArgsRun,
    YaniceCliArgs,
    YaniceCliArgsVisualize,
    YaniceCliDefaultArgs
} from './cli-args.interface';
import { commandOutputOptionsType } from '../config/config.interface';

export class YaniceCliArgsParser {
    public static parseArgs(args: string[]): YaniceCliArgs | null {
        const firstParameter: string | undefined = args[0];
        if (!firstParameter) {
            return null;
        }
        switch (true) {
            case /^run$/.test(firstParameter):
                return YaniceCliArgsParser.handleRunArgs(args);
            case /^output-only$/.test(firstParameter):
                return YaniceCliArgsParser.handleOutputOnlyArgs(args);
            case /^visualize$/.test(firstParameter):
                return YaniceCliArgsParser.handleVisualizeArgs(args);
            case /^plugin:[a-zA-Z][0-9a-zA-Z-]*$/.test(firstParameter):
                return YaniceCliArgsParser.handlePluginArgs(args);
            default:
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
        const isResponsiblesMode: boolean = args.some((arg) => /^--responsibles$/.test(arg));
        const includeFiltered: boolean = args.some((arg) => /^--include-filtered$/.test(arg));
        return {
            type: 'output-only',
            isResponsiblesMode,
            includeFiltered,
            defaultArgs
        };
    }

    private static handleVisualizeArgs(args: string[]): YaniceCliArgsVisualize {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParser.handleDefaultArgs(args);
        const isSomeArgRendererVizJs: boolean = args.some((arg: string) => /^--renderer=vizjs$/.test(arg));
        const renderer: 'dagrejs' | 'vizjs' = isSomeArgRendererVizJs ? 'vizjs' : 'dagrejs';
        const saveVisualization: boolean = args.some((arg: string) => /^--save-visualization$/.test(arg));
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
                        type: 'import-boundaries'
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
        return {
            includeAllProjects: args.includes('--all'),
            diffTarget,
            scope,
            includeUncommitted
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
}
