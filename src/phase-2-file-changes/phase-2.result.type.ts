import { Phase1Result } from '../phase-1-config/phase1.result.type';

export interface Phase2Result {
    phase1Result: Phase1Result;
    changedFiles: string[];
}
