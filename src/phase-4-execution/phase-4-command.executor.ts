import { exec, ExecException } from 'node:child_process';
import * as path from 'node:path';

import { YaniceCliArgsRun } from '../phase-1-config/args-parser/cli-args.interface';
import { YaniceCommand, YaniceConfig, YaniceProject } from '../phase-1-config/config/config.interface';
import { DirectedGraph, DirectedGraphUtil } from '../phase-1-config/directed-graph/directed-graph';
import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { LogUtil } from '../util/log-util';
import { PromiseCreator, PromiseQueue, PromiseQueueEntry } from '../util/promise-queue';
import { AbstractPhase4Executor } from './phase-4.executor';
import { CommandExecutionResult } from './types/command-execution-result.type';

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

        const promiseQueueEntries: PromiseQueueEntry[] = projectsWithCommandsToExecute.reduce(
            (prev: PromiseQueueEntry[], currentProject: YaniceProject): PromiseQueueEntry[] => {
                const yaniceCommand: YaniceCommand | undefined = currentProject.commands[scope];
                if (!yaniceCommand) {
                    return prev;
                }
                const promiseQueueEntriesForProject: PromiseQueueEntry[] = yaniceCommand.commands.map(
                    (command: string, commandIndex: number): PromiseQueueEntry => {
                        const absoluteCwd: string = path.resolve(baseDirectory, yaniceCommand.cwd);
                        const promiseCreator: PromiseCreator = this.createPromiseCreatorForCommand(command, absoluteCwd, yaniceCommand.cwd);
                        const waitingFor: string[] = Phase4CommandExecutor.getWaitingForDependencies(
                            depGraph,
                            affectedProjects,
                            currentProject.projectName,
                            yaniceConfig.projects,
                            scope
                        );
                        return {
                            name: Phase4CommandExecutor.mapProjectNameAndCommandIndexToIdentifier(currentProject.projectName, commandIndex),
                            promiseCreator,
                            waitingFor
                        };
                    }
                );
                return prev.concat(promiseQueueEntriesForProject);
            },
            []
        );

        const promiseQueue: PromiseQueue = PromiseQueue.createQueue(promiseQueueEntries, yaniceRunArgs.concurrency);

        promiseQueue.startQueue().then((): void => {
            LogUtil.printOutputFormattedAfterAllCommandsCompleted(yaniceConfig, this.commandExecutionResults);
            if (this.commandExecutionResults.some((result: CommandExecutionResult): boolean => result.exitCode !== 0)) {
                this.exitYanice(1, null);
            }
        });
    }

    private static getWaitingForDependencies(
        depGraph: DirectedGraph,
        affectedProjects: string[],
        currentYaniceProjectName: string,
        yaniceProjects: YaniceProject[],
        scope: string
    ): string[] {
        return DirectedGraphUtil.getDescendantsAndSelfForSingleNode(depGraph, currentYaniceProjectName).reduce(
            (acc: string[], currentProjectName: string): string[] => {
                if (currentProjectName === currentYaniceProjectName || !affectedProjects.includes(currentProjectName)) {
                    return acc;
                }
                const correspondingProject: YaniceProject | undefined = yaniceProjects.find((project: YaniceProject): boolean => {
                    return project.projectName === currentProjectName;
                });
                const correspondingProjectCommands: string[] | undefined = correspondingProject?.commands[scope]?.commands;
                if (!correspondingProject || !correspondingProjectCommands) {
                    return acc;
                }
                const mappedNames: string[] = correspondingProjectCommands.map((_: string, index: number) => {
                    return Phase4CommandExecutor.mapProjectNameAndCommandIndexToIdentifier(correspondingProject.projectName, index);
                });
                return acc.concat(mappedNames);
            },
            []
        );
    }

    private static mapProjectNameAndCommandIndexToIdentifier(projectName: string, index: number): string {
        return `${projectName}--${index}`;
    }

    private createPromiseCreatorForCommand(command: string, absoluteCwd: string, relativeCwdToBaseDir: string): PromiseCreator {
        const afterTaskCallback: (
            commandExecutionResult: CommandExecutionResult,
            getRemainingQueueSize: () => number
        ) => Promise<void> = async (commandExecutionResult: CommandExecutionResult, getRemainingQueueSize: () => number): Promise<void> => {
            if (commandExecutionResult.exitCode === 0) {
                LogUtil.printCommandSuccess(command, relativeCwdToBaseDir, commandExecutionResult, getRemainingQueueSize());
            } else {
                LogUtil.printCommandFailure(command, relativeCwdToBaseDir, commandExecutionResult, getRemainingQueueSize());
            }
        };

        return (getRemainingQueueSize: () => number): Promise<void> => {
            return new Promise(async (resolve): Promise<void> => {
                const startTime: number = Date.now();
                exec(
                    command,
                    { cwd: absoluteCwd, encoding: 'utf-8' },
                    (err: ExecException | null, stdout: string, stderr: string): void => {
                        const endTime: number = Date.now();
                        const commandExecutionResult: CommandExecutionResult = {
                            stdout,
                            stderr,
                            exitCode: err ? (err.code ? err.code : 1) : 0,
                            executionDurationInMs: endTime - startTime
                        };
                        this.commandExecutionResults.push(commandExecutionResult);
                        afterTaskCallback(commandExecutionResult, getRemainingQueueSize).then(() => {
                            resolve();
                        });
                    }
                );
            });
        };
    }
}
