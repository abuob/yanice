import { expect } from 'chai';

import { PromiseCreator, PromiseQueue, PromiseQueueEntry, PromiseQueueEntryExecutionResult } from '../promise-queue';

describe('PromiseQueue', (): void => {
    const TASK_DURATION: number = 5;
    const ACCURACY_WIGGLE_ROOM: number = 1;
    const promiseCreator: PromiseCreator = async (): Promise<void> => {
        return new Promise((resolve: Function) => {
            setTimeout(() => {
                resolve();
            }, TASK_DURATION);
        });
    };

    it('should execute all tasks sequentially if concurrency=1', async () => {
        const queue: PromiseQueueEntry[] = [
            { name: 'a', waitingFor: [], promiseCreator },
            { name: 'b', waitingFor: [], promiseCreator },
            { name: 'c', waitingFor: [], promiseCreator },
            { name: 'd', waitingFor: [], promiseCreator }
        ];
        const promiseQueue = PromiseQueue.createQueue(queue, 1);
        const results = await promiseQueue.startQueue();
        const resultA = getResultWithName(results, 'a');
        const resultB = getResultWithName(results, 'b');
        const resultC = getResultWithName(results, 'c');
        const resultD = getResultWithName(results, 'd');
        expect(resultB.startTime - resultA.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(TASK_DURATION);
        expect(resultC.startTime - resultB.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(TASK_DURATION);
        expect(resultD.startTime - resultC.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(TASK_DURATION);
    });

    it('should execute all tasks sequentially if concurrency=1, and respect dependency-order', async () => {
        const queue: PromiseQueueEntry[] = [
            { name: 'a', waitingFor: [], promiseCreator }, // order: a -> c -> b -> d
            { name: 'b', waitingFor: ['c'], promiseCreator },
            { name: 'c', waitingFor: ['a'], promiseCreator },
            { name: 'd', waitingFor: ['b'], promiseCreator }
        ];
        const promiseQueue = PromiseQueue.createQueue(queue, 1);
        const results = await promiseQueue.startQueue();
        const resultA = getResultWithName(results, 'a');
        const resultB = getResultWithName(results, 'b');
        const resultC = getResultWithName(results, 'c');
        const resultD = getResultWithName(results, 'd');
        // a first
        expect(resultB.startTime - resultA.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
        expect(resultC.startTime - resultA.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
        expect(resultD.startTime - resultA.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
        // c second
        expect(resultB.startTime - resultC.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
        expect(resultD.startTime - resultC.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
        // b third
        expect(resultD.startTime - resultB.startTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThan(0);
    });

    it('should execute all tasks in parallel up to the limit', async () => {
        const queue: PromiseQueueEntry[] = [
            { name: 'a', waitingFor: [], promiseCreator },
            { name: 'b', waitingFor: [], promiseCreator },
            { name: 'c', waitingFor: [], promiseCreator },
            { name: 'd', waitingFor: [], promiseCreator }
        ];
        const promiseQueue = PromiseQueue.createQueue(queue, 2);
        const results = await promiseQueue.startQueue();
        const resultA = getResultWithName(results, 'a');
        const resultB = getResultWithName(results, 'b');
        const resultC = getResultWithName(results, 'c');
        const resultD = getResultWithName(results, 'd');
        // a and b first, then c and d
        expect(resultC.startTime - resultA.stopTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(0);
        expect(resultD.startTime - resultA.stopTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(0);
        expect(resultC.startTime - resultB.stopTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(0);
        expect(resultD.startTime - resultB.stopTime + ACCURACY_WIGGLE_ROOM).to.be.greaterThanOrEqual(0);
    });

    function getResultWithName(results: PromiseQueueEntryExecutionResult[], name: string): PromiseQueueEntryExecutionResult {
        const foundEntry = results.find((result) => result.name === name);
        if (!foundEntry) {
            throw new Error(`Assertion error: Result with name "${name}" must be defined!`);
        }
        return foundEntry;
    }
});
