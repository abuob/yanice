import {
    YaniceCliArgsOutputOnly,
    YaniceCliArgsPlugin,
    YaniceCliArgsRun,
    YaniceCliArgsV2,
    YaniceCliArgsVisualize,
    YaniceCliDefaultArgs
} from './cli-args.interface';

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
        return {
            type: 'run',
            defaultArgs
        };
    }

    private static handleOutputOnlyArgs(args: string[]): YaniceCliArgsOutputOnly {
        const defaultArgs: YaniceCliDefaultArgs = YaniceCliArgsParserV2.handleDefaultArgs(args);
        return {
            type: 'output-only',
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
        return {
            includeAllProjects: args.includes('--all'),
            diffTarget,
            scope
        };
    }
}
