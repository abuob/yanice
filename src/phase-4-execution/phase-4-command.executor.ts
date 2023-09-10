import { exec, ExecException } from 'node:child_process';
import * as path from 'node:path';

import { YaniceCliArgsRun } from '../phase-1-config/args-parser/cli-args.interface';
import { YaniceCommand, YaniceConfig, YaniceProject } from '../phase-1-config/config/config.interface';
import { DirectedGraph, DirectedGraphUtil } from '../phase-1-config/directed-graph/directed-graph';
import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { LogUtil } from '../util/log-util';
import { PromiseCreator, PromiseQueue, PromiseQueueEntry } from '../util/promise-queue';
import { AbstractPhase4Executor } from './phase-4.executor';

export interface CommandExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionDurationInMs: number;
}

export class Phase4CommandExecutor extends AbstractPhase4Executor {
    private commandExecutionResults: CommandExecutionResult[] = [];

    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result, yaniceRunArgs: YaniceCliArgsRun): void {
        new Phase4CommandExecutor(phase3Result).executeCommands(yaniceRunArgs);
    }

    public executeCommands(yaniceRunArgs: YaniceCliArgsRun): void {
        const yaniceConfig: YaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const baseDirectory: string = this.phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const affectedProjects: string[] = this.phase3Result.affectedProjects;
        const scope: string | null = yaniceRunArgs.defaultArgs.scope;
        const depGraph: DirectedGraph = this.phase3Result.phase2Result.phase1Result.depGraph;
        if (!scope) {
            return;
        }

        const projectsWithCommandsToExecute: YaniceProject[] = yaniceConfig.projects.filter((project: YaniceProject) =>
            affectedProjects.includes(project.projectName)
        );

        const promiseQueue: PromiseQueueEntry[] = projectsWithCommandsToExecute.reduce(
            (prev: PromiseQueueEntry[], currentProject: YaniceProject): PromiseQueueEntry[] => {
                const yaniceCommand: YaniceCommand | undefined = currentProject.commands[scope];
                if (!yaniceCommand) {
                    return prev;
                }
                const promiseQueueEntries: PromiseQueueEntry[] = yaniceCommand.commands.map(
                    (command: string, commandIndex: number): PromiseQueueEntry => {
                        const absoluteCwd: string = path.resolve(baseDirectory, yaniceCommand.cwd);
                        const promiseCreator: PromiseCreator = this.createPromiseCreatorForCommand(
                            command,
                            absoluteCwd,
                            async () => {},
                            async (commandExecutionResult: CommandExecutionResult): Promise<void> => {
                                if (commandExecutionResult.exitCode === 0) {
                                    LogUtil.printCommandSuccess(command, yaniceCommand.cwd, commandExecutionResult);
                                } else {
                                    LogUtil.printCommandFailure(command, yaniceCommand.cwd, commandExecutionResult);
                                }
                            }
                        );
                        const waitingFor: string[] = DirectedGraphUtil.getDescendantsAndSelfForSingleNode(
                            depGraph,
                            currentProject.projectName
                        ).reduce((acc: string[], currentProjectName: string): string[] => {
                            if (currentProjectName === currentProject.projectName || !affectedProjects.includes(currentProjectName)) {
                                return acc;
                            }
                            const correspondingProject: YaniceProject | undefined = yaniceConfig.projects.find((project) => {
                                return project.projectName === currentProjectName;
                            });
                            const correspondingProjectCommands = correspondingProject?.commands[scope]?.commands;
                            if (!correspondingProject || !correspondingProjectCommands) {
                                return acc;
                            }
                            const mappedNames: string[] = correspondingProjectCommands.map((_, index: number) => {
                                return this.mapProjectNameAndCommandIndexToIdentifier(correspondingProject.projectName, index);
                            });
                            return acc.concat(mappedNames);
                        }, []);
                        return {
                            name: this.mapProjectNameAndCommandIndexToIdentifier(currentProject.projectName, commandIndex),
                            promiseCreator,
                            waitingFor
                        };
                    }
                );
                return prev.concat(promiseQueueEntries);
            },
            []
        );

        PromiseQueue.startQueue(promiseQueue, yaniceRunArgs.concurrency).then((): void => {
            LogUtil.printOutputFormattedAfterAllCommandsCompleted(yaniceConfig, this.commandExecutionResults);
            if (this.commandExecutionResults.some((result: CommandExecutionResult): boolean => result.exitCode !== 0)) {
                this.exitYanice(1, null);
            }
        });
    }

    private mapProjectNameAndCommandIndexToIdentifier(projectName: string, index: number): string {
        return `${projectName}--${index}`;
    }

    private createPromiseCreatorForCommand(
        command: string,
        cwd: string,
        initTaskCallback: () => Promise<void>,
        afterTaskCallback: (commandExecutionResult: CommandExecutionResult) => Promise<void>
    ): PromiseCreator {
        return (): Promise<void> => {
            return new Promise(async (resolve): Promise<void> => {
                const startTime: number = Date.now();
                await initTaskCallback();
                exec(command, { cwd, encoding: 'utf-8' }, (err: ExecException | null, stdout: string, stderr: string): void => {
                    const endTime: number = Date.now();
                    const commandExecutionResult: CommandExecutionResult = {
                        stdout,
                        stderr,
                        exitCode: err ? (err.code ? err.code : 1) : 0,
                        executionDurationInMs: endTime - startTime
                    };
                    this.commandExecutionResults.push(commandExecutionResult);
                    afterTaskCallback(commandExecutionResult).then(() => {
                        resolve();
                    });
                });
            });
        };
    }
}
