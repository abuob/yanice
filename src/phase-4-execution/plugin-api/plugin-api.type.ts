import { Phase3Result } from '../../phase-3-project-changes/phase-3.result.type';

export type YanicePluginExecuteFunction = (phase3Result: Phase3Result) => void;

export interface YanicePlugin {
    execute: YanicePluginExecuteFunction;
}
