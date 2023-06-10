import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';

export interface YanicePlugin {
    execute: (phase3Result: Phase3Result) => void;
}
