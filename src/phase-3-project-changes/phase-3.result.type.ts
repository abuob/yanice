import { Phase2Result } from '../phase-2-file-changes/phase-2.result.type';

export interface Phase3Result {
    phase2Result: Phase2Result;
    changedProjects: string[];
    affectedProjects: string[];
    affectedProjectsUnfiltered: string[];
}
