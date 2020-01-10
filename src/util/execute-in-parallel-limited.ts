import { ExecException } from 'child_process';
import { IYaniceCommand } from '../config/config-parser';

const async = require('async');
const exec = require('child_process').exec;
const path = require('path');

export interface ICommandExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export function execucteInParallelLimited(
    commands: IYaniceCommand[],
    MAX_CONCURRENCY: number,
    baseDirectory: string,
    initTaskCallback: (command: IYaniceCommand, workingDir: string) => void,
    afterTaskCallback: (command: IYaniceCommand, commandExecutionResult: ICommandExecutionResult) => void,
    finalCallback: (commandExecutionResults: ICommandExecutionResult[]) => void
) {
    const executionResults: ICommandExecutionResult[] = [];

    async.eachLimit(
        commands,
        MAX_CONCURRENCY,
        (command: IYaniceCommand, singleCommandDone: () => void) => {
            const workingDir = path.resolve(baseDirectory, command.cwd);
            initTaskCallback(command, workingDir);
            exec(
                command.command,
                { cwd: workingDir, encoding: 'utf-8' },
                (err: ExecException | null, stdout: string, stderr: string): void => {
                    const commandExecutionResult: ICommandExecutionResult = {
                        stdout,
                        stderr,
                        exitCode: err ? (err.code ? err.code : 1) : 0
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
