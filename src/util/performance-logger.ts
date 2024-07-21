import { LogUtil } from './log-util';

export class YanicePerformanceLogger<stopWatchIdentifier extends string> {
    private startTimes: Partial<Record<stopWatchIdentifier, number>> = {};
    private isEnabled: boolean = false;

    constructor(
        private context: string,
        isEnabled: boolean
    ) {
        this.isEnabled = isEnabled;
    }

    public setEnabled(isEnabled: boolean): void {
        this.isEnabled = isEnabled;
    }

    public startStopwatch(identifier: stopWatchIdentifier): void {
        if (!this.isEnabled) {
            return;
        }
        this.startTimes[identifier] = Date.now();
    }

    public stopStopwatchAndLog(identifier: stopWatchIdentifier, message: string): void {
        if (!this.isEnabled) {
            return;
        }
        const startTime: number | null = this.startTimes[identifier] ?? null;
        if (startTime === null) {
            throw new Error(
                `Stopwatch with identifier ${identifier} does not exist and can therefore not be stopped; did you forget to start the stopwatch?`
            );
        }
        const executionDurationInMs: number = Date.now() - startTime;
        const duration: string = LogUtil.getCommandDurationString(executionDurationInMs);
        LogUtil.log(`[${this.context}] ${message} ${duration}s`);
        this.startTimes[identifier] = undefined;
    }
}
