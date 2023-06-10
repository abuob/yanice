import { ImportBoundariesExecutor } from './src/import-boundaries.executor';
import { YanicePlugin, Phase3Result } from 'yanice';

const importBoundariesPlugin: YanicePlugin = {
    execute: (phase3Results: Phase3Result) => {
        ImportBoundariesExecutor.execute(phase3Results);
    }
};

export default importBoundariesPlugin;
