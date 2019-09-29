import { IYaniceCommand } from '../config/config-parser';

const async = require('async');
const exec = require('child_process').exec;
const path = require('path');

export function execucteInParallelLimited(
    commands: IYaniceCommand[],
    MAX_CONCURRENCY: number,
    baseDirectory: string,
    initTaskCallback: (command: IYaniceCommand, workingDir: string) => void,
    afterTaskCallback: (command: IYaniceCommand, exitCode: number) => void,
    finalCallback: (exitCode: number) => void
) {
    let anyTaskFailed = false;

    async.eachLimit(
        commands,
        MAX_CONCURRENCY,
        (command: IYaniceCommand, done: () => void) => {
            const workingDir = path.resolve(baseDirectory, command.cwd);
            initTaskCallback(command, workingDir);
            exec(command.command, { cwd: workingDir }, (err: any, stdout: any, stderr: any): void => {
                if (err) {
                    anyTaskFailed = true;
                    afterTaskCallback(command, 1);
                } else {
                    afterTaskCallback(command, 0);
                }
                done();
            });
        },
        () => {
            if (anyTaskFailed) {
                finalCallback(1);
            } else {
                finalCallback(0);
            }
        }
    );
}
