import { PhaseExecutor } from '../util/phase-executor';
import { YaniceArgs } from '../phase-1-config/config/args-parser';
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
        const yaniceArgs: YaniceArgs = this.phase1Result.yaniceArgs;
        if (yaniceArgs.diffTarget.branch || yaniceArgs.diffTarget.rev) {
            const commitSHA: string = ChangedFiles.gitCommandWithRevisionShaAsOutput(
                `git rev-parse ${yaniceArgs.diffTarget.branch || yaniceArgs.diffTarget.rev}`
            );
            this.changedFiles = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(commitSHA, yaniceArgs.includeUncommitted);
        }
        if (yaniceArgs.diffTarget.commit && this.changedFiles.length === 0) {
            this.changedFiles = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(
                yaniceArgs.diffTarget.commit,
                yaniceArgs.includeUncommitted
            );
        }
        return this;
    }
}
