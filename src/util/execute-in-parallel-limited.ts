import { exec, ExecException } from 'node:child_process';
import path from 'node:path';

import async from 'async';

export interface ICommandExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionDurationInMs: number;
}

export interface ParallelExecutionCommand {
    command: string;
    cwd: string;
}

export function execucteInParallelLimited(
    commandQueue: ParallelExecutionCommand[],
    MAX_CONCURRENCY: number,
    baseDirectory: string,
    initTaskCallback: (command: ParallelExecutionCommand, workingDir: string) => void,
    afterTaskCallback: (command: ParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult) => void,
    finalCallback: (commandExecutionResults: ICommandExecutionResult[]) => void
): void {
    const executionResults: ICommandExecutionResult[] = [];

    async.eachLimit(
        commandQueue,
        MAX_CONCURRENCY,
        (command: ParallelExecutionCommand, singleCommandDone: () => void) => {
            const workingDir = path.resolve(baseDirectory, command.cwd);
            initTaskCallback(command, workingDir);
            const startTime: number = Date.now();
            exec(
                command.command,
                { cwd: workingDir, encoding: 'utf-8' },
                (err: ExecException | null, stdout: string, stderr: string): void => {
                    const endTime: number = Date.now();
                    const commandExecutionResult: ICommandExecutionResult = {
                        stdout,
                        stderr,
                        exitCode: err ? (err.code ? err.code : 1) : 0,
                        executionDurationInMs: endTime - startTime
                    };
                    executionResults.push(commandExecutionResult);
                    afterTaskCallback(command, commandExecutionResult);
                    singleCommandDone();
                }
            );
        },
        () => {
            finalCallback(executionResults);
        }
    );
}
