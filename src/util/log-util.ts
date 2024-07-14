import { YaniceConfig } from '../phase-1-config/config/config.interface';
import { CommandExecutionResult } from '../phase-4-execution/types/command-execution-result.type';
import { commandOutputFilterType, OutputFilter } from './output-filter';
import { KarmaProgressSuccessFilter } from './output-filters/karma-progress-success-filter';
import { NpmErrorFilter } from './output-filters/npm-error-filter';

export class LogUtil {
    public static async writeToStdoutAsync(message: string): Promise<void> {
        return new Promise((resolve): void => {
            process.stdout.write(message, (): void => {
                resolve();
            });
        });
    }

    /**
     * @param shortMessage must be below 8192 bytes. Otherwise, if we call process.exit() immediately afterward,
     * the message might be logged only partially. Use `writeToStdoutAsync` for those cases.
     */
    public static log(shortMessage: string): void {
        LogUtil.consoleLog(shortMessage);
    }

    /**
     * @param shortMessage Can be any instead of just a string. Helpful if we want to use console.log's internal stringification of non-strings.
     * Generally, calls to the properly typed "log" should be preferred.
     */
    public static consoleLog(shortMessage: any): void {
        // eslint-disable-next-line no-console
        console.log(shortMessage);
    }

    public static printCommandSuccess(
        command: string,
        relativeCwd: string,
        commandExecutionResult: CommandExecutionResult,
        queueSize: number
    ): void {
        const commandInfo: string = LogUtil.getCommandInfoString(commandExecutionResult.executionDurationInMs, relativeCwd, queueSize);
        LogUtil.log(`  \x1B[1;32m ✔ ${command}\x1B[0m ${commandInfo}`);
    }

    public static printCommandFailure(
        command: string,
        relativeCwd: string,
        commandExecutionResult: CommandExecutionResult,
        queueSize: number
    ): void {
        const commandInfo: string = LogUtil.getCommandInfoString(commandExecutionResult.executionDurationInMs, relativeCwd, queueSize);
        LogUtil.log(`  \x1B[1;31m ✘ ${command}\x1B[0m ${commandInfo}`);
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

    public static getCommandInfoString(executionDurationInMs: number, relativeCwd: string, queueSize: number): string {
        const durationInfo: string = LogUtil.getCommandDurationString(executionDurationInMs);
        const relativeCwdInfo: string | null = LogUtil.getCwdInfo(relativeCwd);
        if (relativeCwdInfo) {
            return `(${durationInfo}s, cwd: ${relativeCwdInfo}, queue: ${queueSize})`;
        }
        return `(${durationInfo}s, queue: ${queueSize})`;
    }

    public static getCommandDurationString(executionDurationInMs: number): string {
        const durationInSeconds: number = executionDurationInMs / 1000;
        if (durationInSeconds < 1) {
            return durationInSeconds.toFixed(3);
        }
        if (durationInSeconds < 10) {
            return durationInSeconds.toFixed(2);
        }
        if (durationInSeconds < 100) {
            return durationInSeconds.toFixed(1);
        }
        return Math.round(durationInSeconds).toString();
    }

    private static getCwdInfo(relativeCwd: string): string | null {
        if (relativeCwd !== './') {
            return relativeCwd;
        }
        return null;
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
                LogUtil.log(line);
            });
    }

    private static getAllSelectedOutputFilters(commandOutputFilter: commandOutputFilterType[]): OutputFilter[] {
        const filters: OutputFilter[] = [new NpmErrorFilter(), new KarmaProgressSuccessFilter()];
        return filters.filter((filter) => commandOutputFilter.includes(filter.filterName));
    }
}
