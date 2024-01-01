import type { Phase3Result, YanicePlugin } from 'yanice';

const dummyPlugin: YanicePlugin = {
    execute: (phase3Result: Phase3Result): void => {
        // eslint-disable-next-line no-console
        console.log('[DUMMY-PLUGIN] triggered');
        // eslint-disable-next-line no-console
        console.log(phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath);
    }
};

module.exports = dummyPlugin;
