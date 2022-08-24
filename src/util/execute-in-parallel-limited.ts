import { ExecException } from 'child_process';

const async = require('async');
const exec = require('child_process').exec;
const path = require('path');

export interface ICommandExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionDurationInMs: number;
}

export interface IParallelExecutionCommand {
    command: string;
    cwd: string;
}

export function execucteInParallelLimited(
    commandQueue: IParallelExecutionCommand[],
    MAX_CONCURRENCY: number,
    baseDirectory: string,
    initTaskCallback: (command: IParallelExecutionCommand, workingDir: string) => void,
    afterTaskCallback: (command: IParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult) => void,
    finalCallback: (commandExecutionResults: ICommandExecutionResult[]) => void
) {
    const executionResults: ICommandExecutionResult[] = [];

    async.eachLimit(
        commandQueue,
        MAX_CONCURRENCY,
        (command: IParallelExecutionCommand, singleCommandDone: () => void) => {
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
