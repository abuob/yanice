import {
    YaniceCliArgsOutputOnly,
    YaniceCliArgsPlugin,
    YaniceCliArgsRun,
    YaniceCliArgsV2,
    YaniceCliArgsVisualize,
    YaniceCliDefaultArgs
} from './cli-args.interface';
import { commandOutputOptionsType } from '../config/config.interface';

export class YaniceCliArgsParserV2 {
    public static parseArgsV2(args: string[]): YaniceCliArgsV2 | null {
        const firstParameter: string | undefined = args[0];
        switch (firstParameter) {
            case 'run':
                return YaniceCliArgsParserV2.handleRunArgs(args);
            case 'output-only':
                return YaniceCliArgsParserV2.handleOutputOnlyArgs(args);
            case 'visualize':
                return YaniceCliArgsParserV2.handleVisualizeArgs(args);
            case 'plugin':
                return YaniceCliArgsParserV2.handlePluginArgs(args);
            default:
                return null;
        }
    }

    private static handleRunArgs(args: string[]): YaniceCliArgsRun {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParserV2.handleDefaultArgs(args);
        const concurrencyParameter: string | undefined = args.find((arg: string) => {
            return /^--concurrency=(\d)+$/.test(arg);
        });
        const concurrency: number = (concurrencyParameter && parseInt(concurrencyParameter.replace(/--concurrency=/, ''), 10)) || 1;

        const outputModeParameter: string | undefined = args.find((arg: string) => {
            return /^--output-mode=/.test(arg);
        });

        const outputMode: YaniceCliArgsRun['outputMode'] = YaniceCliArgsParserV2.getOutputMode(outputModeParameter);
        return {
            type: 'run',
            defaultArgs,
            concurrency,
            outputMode
        };
    }

    private static handleOutputOnlyArgs(args: string[]): YaniceCliArgsOutputOnly {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParserV2.handleDefaultArgs(args);
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
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParserV2.handleDefaultArgs(args);
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
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParserV2.handleDefaultArgs(args);
        return {
            type: 'plugin',
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

    private static getOutputMode(outputModeParameter: string | undefined): commandOutputOptionsType | null {
        switch (outputModeParameter) {
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
