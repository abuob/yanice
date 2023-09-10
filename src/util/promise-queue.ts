export type PromiseCreator = () => Promise<void>;

export interface PromiseQueueEntry {
    name: string;
    waitingFor: string[];
    promiseCreator: PromiseCreator;
}

export interface PromiseQueueEntryExecutionResult {
    name: string;
    startTime: number;
    stopTime: number;
    durationInMilliSeconds: number;
}

interface InternalPromiseQueueEntry {
    entry: PromiseQueueEntry;
    isInExecutionOrExecuted: boolean;
    result: PromiseQueueEntryExecutionResult | null;
}

export class PromiseQueue {
    private currentExecutionAmount: number = 0;

    constructor(private maxConcurrency: number, private internalQueue: InternalPromiseQueueEntry[]) {}

    public static async startQueue(
        promiseQueueEntries: PromiseQueueEntry[],
        concurrency: number
    ): Promise<PromiseQueueEntryExecutionResult[]> {
        const internalQueue: InternalPromiseQueueEntry[] = promiseQueueEntries.map(
            (entry: PromiseQueueEntry): InternalPromiseQueueEntry => {
                return {
                    entry,
                    isInExecutionOrExecuted: false,
                    result: null
                };
            }
        );
        const promiseQueue: PromiseQueue = new PromiseQueue(concurrency, internalQueue);
        return promiseQueue.populateQueueEntriesRecursively();
    }

    public static async startSimpleQueue(
        promiseCreators: PromiseCreator[],
        concurrency: number
    ): Promise<PromiseQueueEntryExecutionResult[]> {
        const internalQueue: InternalPromiseQueueEntry[] = promiseCreators.map(
            (promiseCreator: PromiseCreator, index: number): InternalPromiseQueueEntry => {
                return {
                    entry: {
                        name: index.toString(),
                        promiseCreator,
                        waitingFor: []
                    },
                    isInExecutionOrExecuted: false,
                    result: null
                };
            }
        );
        const promiseQueue: PromiseQueue = new PromiseQueue(concurrency, internalQueue);
        return promiseQueue.populateQueueEntriesRecursively();
    }

    private static async executePromise(promiseQueueEntry: PromiseQueueEntry): Promise<PromiseQueueEntryExecutionResult> {
        const startTime: number = Date.now();
        return promiseQueueEntry.promiseCreator().then((): PromiseQueueEntryExecutionResult => {
            const stopTime: number = Date.now();
            return {
                name: promiseQueueEntry.name,
                startTime,
                stopTime,
                durationInMilliSeconds: stopTime - startTime
            };
        });
    }

    private static getReadyEntries(internalQueue: InternalPromiseQueueEntry[]): InternalPromiseQueueEntry[] {
        return internalQueue.filter((internalPromiseQueueEntry: InternalPromiseQueueEntry): boolean => {
            const isInExecutionOrAlreadyExecuted: boolean =
                internalPromiseQueueEntry.isInExecutionOrExecuted || internalPromiseQueueEntry.result !== null;
            if (isInExecutionOrAlreadyExecuted) {
                return false;
            }
            const isEveryWaitingForConditionSatisfied: boolean = internalPromiseQueueEntry.entry.waitingFor.every(
                (waitingForName: string) => {
                    return internalQueue.some(
                        (entry: InternalPromiseQueueEntry) => entry.entry.name === waitingForName && entry.result !== null
                    );
                }
            );
            return isEveryWaitingForConditionSatisfied;
        });
    }

    private async populateQueueEntriesRecursively(): Promise<PromiseQueueEntryExecutionResult[]> {
        const availableExecutionSlots: number = this.maxConcurrency - this.currentExecutionAmount;
        if (availableExecutionSlots <= 0) {
            return Promise.resolve([]);
        }
        const promisesToExecute: InternalPromiseQueueEntry[] = PromiseQueue.getReadyEntries(this.internalQueue).slice(
            0,
            availableExecutionSlots
        );
        if (promisesToExecute.length === 0) {
            const promisesStillInQueue: InternalPromiseQueueEntry[] = this.internalQueue.filter((entry) => {
                return !entry.isInExecutionOrExecuted;
            });
            if (this.currentExecutionAmount === 0 && promisesStillInQueue.length > 0) {
                throw new Error(
                    `DEADLOCK: No item in queue can be executed due to dependencies, but queue is not empty (${promisesStillInQueue.length} items remaining)`
                );
            }
            return Promise.resolve([]);
        }
        const promisesInExecution: Promise<PromiseQueueEntryExecutionResult[]>[] = [];
        promisesToExecute.forEach((internalQueueEntry: InternalPromiseQueueEntry) => {
            internalQueueEntry.isInExecutionOrExecuted = true;
            this.currentExecutionAmount++;
            const executionPromise: Promise<PromiseQueueEntryExecutionResult[]> = PromiseQueue.executePromise(
                internalQueueEntry.entry
            ).then(async (result: PromiseQueueEntryExecutionResult): Promise<PromiseQueueEntryExecutionResult[]> => {
                this.currentExecutionAmount--;
                internalQueueEntry.result = result;
                return this.populateQueueEntriesRecursively().then((results): PromiseQueueEntryExecutionResult[] => {
                    return [result, ...results];
                });
            });
            promisesInExecution.push(executionPromise);
        });
        return Promise.all(promisesInExecution).then(
            (results: PromiseQueueEntryExecutionResult[][]): PromiseQueueEntryExecutionResult[] => {
                return results.flat();
            }
        );
    }
}
