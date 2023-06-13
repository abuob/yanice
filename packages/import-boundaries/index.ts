import { Phase3Result, YanicePlugin } from 'yanice';

import { ImportBoundariesExecutor } from './src/import-boundaries.executor';

const importBoundariesPlugin: YanicePlugin = {
    execute: (phase3Results: Phase3Result) => {
        ImportBoundariesExecutor.execute(phase3Results);
    }
};

module.exports = importBoundariesPlugin;
