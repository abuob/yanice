import { PhaseExecutor } from '../util/phase-executor';
import { ChangedFiles } from './changed-files';
import { Phase1Result } from '../phase-1-config/phase1.result.type';
import { Phase2Result } from './phase-2.result.type';

export class Phase2Executor extends PhaseExecutor {
    public changedFiles: string[] = [];

    constructor(private readonly phase1Result: Phase1Result) {
        super();
    }

    public static execute(phase1Result: Phase1Result): Phase2Result {
        return new Phase2Executor(phase1Result).calculateChangedFiles().createPhaseResult();
    }

    private createPhaseResult(): Phase2Result {
        return {
            phase1Result: this.phase1Result,
            changedFiles: this.changedFiles
        };
    }

    private calculateChangedFiles(): Phase2Executor {
        if (!this.phase1Result) {
            return this;
        }
        const diffTarget: string | null = this.phase1Result.yaniceCliArgs.defaultArgs.diffTarget;
        const includeUncommitted: boolean = this.phase1Result.yaniceCliArgs.defaultArgs.includeUncommitted;
        if (diffTarget) {
            const commitSHA: string = ChangedFiles.gitCommandWithRevisionShaAsOutput(`git rev-parse ${diffTarget}`);
            this.changedFiles = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(commitSHA, includeUncommitted);
        }
        return this;
    }
}
