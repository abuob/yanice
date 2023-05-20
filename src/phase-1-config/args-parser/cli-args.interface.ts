export type YaniceCliArgsV2 = YaniceCliArgsOutputOnly | YaniceCliArgsPlugin | YaniceCliArgsRun | YaniceCliArgsVisualize;

export interface YaniceCliArgsRun {
    type: 'run';
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliArgsOutputOnly {
    type: 'output-only';
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliArgsVisualize {
    type: 'visualize';
    defaultArgs: YaniceCliDefaultArgs;
    renderer: 'dagrejs' | 'vizjs';
}

export interface YaniceCliArgsPlugin {
    type: 'plugin';
    defaultArgs: YaniceCliDefaultArgs;
}

export interface YaniceCliDefaultArgs {
    diffTarget: string | null;
    includeAllProjects: boolean;
    scope: string | null;
}
