import { YaniceConfig } from '../config/config.interface';
import { ICommandExecutionResult, IParallelExecutionCommand } from './execute-in-parallel-limited';
import { log } from './log';
import { commandOutputFilterType, OutputFilter } from './output-filter';
import { KarmaProgressSuccessFilter } from './output-filters/karma-progress-success-filter';
import { NpmErrorFilter } from './output-filters/npm-error-filter';

export class LogUtil {
    public static printCommandSuccess(executionCommand: IParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult): void {
        const durationMessage: string = LogUtil.createDurationInfoInBrackets(commandExecutionResult);
        log('  \x1B[1;32m ✔ ' + executionCommand.command + '\x1B[0m ' + durationMessage);
    }

    public static printCommandFailure(executionCommand: IParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult): void {
        const durationMessage: string = ` ${LogUtil.createDurationInfoInBrackets(commandExecutionResult)}`;
        const cwdInfoIfNotRoot: string = executionCommand.cwd !== './' ? ` (cwd: ${executionCommand.cwd})` : '';
        log('  \x1B[1;31m ✘ ' + executionCommand.command + '\x1B[0m' + cwdInfoIfNotRoot + durationMessage);
    }

    private static createDurationInfoInBrackets(commandExecutionResult: ICommandExecutionResult): string {
        const durationInSeconds: number = Math.floor(commandExecutionResult.executionDurationInMs / 1000);
        return `(${durationInSeconds}s)`;
    }

    public static printOutputFormattedAfterAllCommandsCompleted(
        yaniceConfig: YaniceConfig,
        commandExecutionResults: ICommandExecutionResult[]
    ): void {
        const allSelectedFilters = LogUtil.getAllSelectedOutputFilters(yaniceConfig.options.outputFilters);
        const ignoreStdout: boolean = yaniceConfig.options.outputFilters.includes('ignoreStdout');
        const ignoreStderr: boolean = yaniceConfig.options.outputFilters.includes('ignoreStderr');

        switch (yaniceConfig.options.commandOutput) {
            case 'ignore':
                return;
            case 'append-at-end':
                commandExecutionResults.forEach((result) => {
                    LogUtil.printOutputChunkFilteredUnlessIgnored(result.stdout, allSelectedFilters, ignoreStdout);
                    LogUtil.printOutputChunkFilteredUnlessIgnored(result.stderr, allSelectedFilters, ignoreStderr);
                });
                break;
            case 'append-at-end-on-error':
                commandExecutionResults.forEach((result) => {
                    if (result.exitCode !== 0) {
                        LogUtil.printOutputChunkFilteredUnlessIgnored(result.stdout, allSelectedFilters, ignoreStdout);
                        LogUtil.printOutputChunkFilteredUnlessIgnored(result.stderr, allSelectedFilters, ignoreStderr);
                    }
                });
                break;
        }
    }

    public static isOutputLineOkayToPrint(appliedFilters: OutputFilter[], outputLine: string): boolean {
        return appliedFilters.reduce((prev: boolean, curr): boolean => prev && curr.filterOutputLine(outputLine), true);
    }

    private static printOutputChunkFilteredUnlessIgnored(chunk: string, appliedFilters: OutputFilter[], ignoreFlag: boolean): void {
        if (ignoreFlag) {
            return;
        }
        chunk
            .trim()
            .split('\n')
            .filter((line) => LogUtil.isOutputLineOkayToPrint(appliedFilters, line))
            .forEach((line) => {
                log(line);
            });
    }

    private static getAllSelectedOutputFilters(commandOutputFilter: commandOutputFilterType[]): OutputFilter[] {
        const filters: OutputFilter[] = [new NpmErrorFilter(), new KarmaProgressSuccessFilter()];
        return filters.filter((filter) => commandOutputFilter.includes(filter.filterName));
    }
}
