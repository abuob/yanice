import { Phase1Result } from '../phase-1-config/phase-1.result.type';
import { PhaseExecutor } from '../util/phase-executor';
import { ChangedFiles } from './changed-files/changed-files';
import { Phase2Result } from './phase-2.result.type';

export class Phase2Executor extends PhaseExecutor {
    public changedFilesRelativeToRepoRoot: string[] = [];
    public changedFiles: string[] = [];

    constructor(private readonly phase1Result: Phase1Result) {
        super();
    }

    public static execute(phase1Result: Phase1Result): Phase2Result {
        return new Phase2Executor(phase1Result)
            .getChangedFilesRelativeToGitRoot()
            .getChangesFilesRelativeToYaniceJsonDirectory()
            .createPhaseResult();
    }

    private createPhaseResult(): Phase2Result {
        return {
            phase1Result: this.phase1Result,
            changedFiles: this.changedFiles
        };
    }

    private getChangedFilesRelativeToGitRoot(): Phase2Executor {
        if (!this.phase1Result) {
            return this;
        }
        const diffTarget: string | null = this.phase1Result.yaniceCliArgs.defaultArgs.diffTarget;
        const includeUncommitted: boolean = this.phase1Result.yaniceCliArgs.defaultArgs.includeUncommitted;
        if (diffTarget) {
            const commitSHA: string = ChangedFiles.gitCommandWithRevisionShaAsOutput(`git rev-parse ${diffTarget}`);
            this.changedFilesRelativeToRepoRoot = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(commitSHA, includeUncommitted);
        }
        return this;
    }

    private getChangesFilesRelativeToYaniceJsonDirectory(): Phase2Executor {
        if (!this.phase1Result) {
            return this;
        }
        const yaniceJsonDirectoryPath: string = this.phase1Result.yaniceJsonDirectoryPath;
        const gitRepoRootPath: string = this.phase1Result.gitRepoRootPath;
        this.changedFiles = this.changedFilesRelativeToRepoRoot
            .map((changedFileRelativeToRepoRoot: string): string | null => {
                return ChangedFiles.gitFilePathRelativeToYaniceJson(
                    gitRepoRootPath,
                    yaniceJsonDirectoryPath,
                    changedFileRelativeToRepoRoot
                );
            })
            .filter((filePathOrNull: string | null): filePathOrNull is string => {
                return !!filePathOrNull;
            });
        return this;
    }
}
