import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { AbstractPhase4Executor } from './phase-4.executor';
import { execucteInParallelLimited, ICommandExecutionResult, ParallelExecutionCommand } from '../util/execute-in-parallel-limited';
import { YaniceCommand, YaniceProject } from '../phase-1-config/config/config.interface';
import { LogUtil } from '../util/log-util';

export class Phase4CommandExecutor extends AbstractPhase4Executor {
    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result): void {
        new Phase4CommandExecutor(phase3Result).executeCommands();
    }

    public executeCommands(): Phase4CommandExecutor {
        const yaniceArgs = this.phase3Result.phase2Result.phase1Result.yaniceArgs;
        const yaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const baseDirectory = this.phase3Result.phase2Result.phase1Result.baseDirectory;
        const affectedProjects = this.phase3Result.affectedProjects;
        if (yaniceConfig && yaniceArgs && baseDirectory && !(yaniceArgs.visualizeDepGraph || yaniceArgs.saveDepGraphVisualization)) {
            const scope: string = yaniceArgs.givenScope;
            const parallelExecutionCommands: ParallelExecutionCommand[] = yaniceConfig.projects
                .filter((project: YaniceProject) => affectedProjects.includes(project.projectName))
                .map((project: YaniceProject): YaniceCommand | undefined => project.commands[scope])
                .reduce((prev: ParallelExecutionCommand[], curr: YaniceCommand | undefined): ParallelExecutionCommand[] => {
                    if (!curr) {
                        return prev;
                    }
                    const commands: ParallelExecutionCommand[] = curr.commands.map(
                        (command: string): ParallelExecutionCommand => ({ command, cwd: curr.cwd })
                    );
                    return prev.concat(commands);
                }, []);

            execucteInParallelLimited(
                parallelExecutionCommands,
                yaniceArgs.concurrency,
                baseDirectory,
                (_command: ParallelExecutionCommand, _dir: string) => {
                    return;
                },
                (command: ParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult) => {
                    if (commandExecutionResult.exitCode === 0) {
                        LogUtil.printCommandSuccess(command, commandExecutionResult);
                    } else {
                        LogUtil.printCommandFailure(command, commandExecutionResult);
                    }
                },
                (commandsExecutionResults: ICommandExecutionResult[]) => {
                    LogUtil.printOutputFormattedAfterAllCommandsCompleted(yaniceConfig, commandsExecutionResults);
                    if (commandsExecutionResults.some((result: ICommandExecutionResult) => result.exitCode !== 0)) {
                        this.exitYanice(1, null);
                    }
                }
            );
        }
        return this;
    }
}
