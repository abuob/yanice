import { YaniceConfig } from '../phase-1-config/config/config.interface';
import { CommandExecutionResult } from '../phase-4-execution/phase-4-command.executor';
import { log } from './log';
import { commandOutputFilterType, OutputFilter } from './output-filter';
import { KarmaProgressSuccessFilter } from './output-filters/karma-progress-success-filter';
import { NpmErrorFilter } from './output-filters/npm-error-filter';

export class LogUtil {
    public static log(message: string): void {
        log(message);
    }

    public static printCommandSuccess(command: string, relativeCwd: string, commandExecutionResult: CommandExecutionResult): void {
        const durationMessage: string = LogUtil.createDurationInfoInBrackets(commandExecutionResult);
        const cwdInfoIfNotRoot: string = relativeCwd !== './' ? ` (cwd: ${relativeCwd})` : '';
        log(`  \x1B[1;32m ✔ ${command}\x1B[0m ${durationMessage}${cwdInfoIfNotRoot} `);
    }

    public static printCommandFailure(command: string, relativeCwd: string, commandExecutionResult: CommandExecutionResult): void {
        const durationMessage: string = ` ${LogUtil.createDurationInfoInBrackets(commandExecutionResult)}`;
        const cwdInfoIfNotRoot: string = relativeCwd !== './' ? ` (cwd: ${relativeCwd})` : '';
        log(`  \x1B[1;31m ✘ ${command}\x1B[0m ${durationMessage}${cwdInfoIfNotRoot}`);
    }

    public static printOutputFormattedAfterAllCommandsCompleted(
        yaniceConfig: YaniceConfig,
        commandExecutionResults: CommandExecutionResult[]
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

    private static createDurationInfoInBrackets(commandExecutionResult: CommandExecutionResult): string {
        const durationInSeconds: number = commandExecutionResult.executionDurationInMs / 1000;
        if (durationInSeconds < 1) {
            return `(${durationInSeconds.toFixed(3)}s)`;
        }
        if (durationInSeconds < 10) {
            return `(${durationInSeconds.toFixed(2)}s)`;
        }
        if (durationInSeconds < 100) {
            return `(${durationInSeconds.toFixed(1)}s)`;
        }
        return `(${Math.round(durationInSeconds)}s)`;
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
