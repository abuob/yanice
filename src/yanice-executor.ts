import { YaniceJsonType } from './phase-1-config/config/config.interface';
import { Phase1Result } from './phase-1-config/phase-1.result.type';
import { Phase1Executor } from './phase-1-config/phase-1.executor';
import { Phase2Result } from './phase-2-file-changes/phase-2.result.type';
import { Phase2Executor } from './phase-2-file-changes/phase-2.executor';
import { Phase3Executor } from './phase-3-project-changes/phase-3.executor';
import { Phase3Result } from './phase-3-project-changes/phase-3.result.type';
import { Phase4VisualizerExecutor } from './phase-4-execution/phase-4-visualizer.executor';
import { Phase4OutputOnlyExecutor } from './phase-4-execution/phase-4-output-only.executor';
import { Phase4CommandExecutor } from './phase-4-execution/phase-4-command.executor';
import { Phase4PluginExecutor } from './phase-4-execution/phase-4-plugin.executor';

export class YaniceExecutor {
    public phase1Result: Phase1Result | null = null;
    public phase2Result: Phase2Result | null = null;
    public phase3Result: Phase3Result | null = null;

    public executePhase1(
        args: string[],
        yaniceJsonDirectoryPath: string,
        gitRepoRootPath: string,
        yaniceJson: YaniceJsonType
    ): YaniceExecutor {
        this.phase1Result = Phase1Executor.execute(args, yaniceJsonDirectoryPath, gitRepoRootPath, yaniceJson);
        return this;
    }

    public executePhase2(): YaniceExecutor {
        if (!this.phase1Result) {
            return this;
        }
        this.phase2Result = Phase2Executor.execute(this.phase1Result);
        return this;
    }

    public executePhase3(): YaniceExecutor {
        if (!this.phase2Result) {
            return this;
        }
        this.phase3Result = Phase3Executor.execute(this.phase2Result);
        return this;
    }

    public executePhase4(): void {
        if (!this.phase3Result) {
            return;
        }
        const yaniceCliArgs = this.phase3Result.phase2Result.phase1Result.yaniceCliArgs;
        if (yaniceCliArgs.type === 'output-only') {
            Phase4OutputOnlyExecutor.execute(this.phase3Result, yaniceCliArgs);
            return;
        }
        if (yaniceCliArgs.type === 'visualize') {
            Phase4VisualizerExecutor.execute(this.phase3Result, yaniceCliArgs);
            return;
        }
        if (yaniceCliArgs.type === 'plugin') {
            Phase4PluginExecutor.execute(this.phase3Result, yaniceCliArgs);
            return;
        }
        if (yaniceCliArgs.type === 'run') {
            Phase4CommandExecutor.execute(this.phase3Result, yaniceCliArgs);
            return;
        }
    }

    /**
     * For testing only. Allows to skip invocation of git-diff and provide
     * a hardcoded set of changed files instead.
     */
    public skipPhase2ForTests(changedFiles: string[]): YaniceExecutor {
        if (!this.phase1Result) {
            return this;
        }
        this.phase2Result = {
            phase1Result: this.phase1Result,
            changedFiles
        };
        return this;
    }
}
