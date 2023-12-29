import { commandOutputOptionsType } from '../config/config.interface';
import { YanicePluginArgs } from './plugin.type';

export type YaniceCliArgs = YaniceCliArgsOutputOnly | YaniceCliArgsPlugin | YaniceCliArgsRun | YaniceCliArgsVisualize;

export type YaniceModeType = YaniceCliArgs['type'];

export interface YaniceCliArgsRun {
    type: 'run';
    concurrency: number;
    outputMode: commandOutputOptionsType | null;
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliArgsOutputOnly {
    type: 'output-only';
    isResponsiblesMode: boolean;
    includeFiltered: boolean;
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliArgsVisualize {
    type: 'visualize';
    defaultArgs: YaniceCliDefaultArgs;
    renderer: 'dagrejs' | 'vizjs';
    saveVisualization: boolean;
}

export interface YaniceCliArgsPlugin {
    type: 'plugin';
    selectedPlugin: YanicePluginArgs;
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliDefaultArgs {
    diffTarget: string | null;
    includeAllProjects: boolean;
    includeUncommitted: boolean;
    scope: string | null;
    isPerformanceLoggingEnabled: boolean;
}
