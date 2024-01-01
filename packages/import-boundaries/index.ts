import { Phase3Result, YanicePlugin } from 'yanice';

import type { YaniceImportBoundariesAssertion } from './src/api/assertion.interface';
import type {
    FileToImportResolutions,
    ImportResolution,
    ImportResolutionResolvedImport,
    YaniceImportBoundariesImportResolver
} from './src/api/import-resolver.interface';
import type { YaniceImportBoundariesPostResolver } from './src/api/post-resolve.interface';
import { ImportBoundariesExecutor } from './src/import-boundaries.executor';

const importBoundariesPlugin: YanicePlugin = {
    execute: (phase3Results: Phase3Result): void => {
        ImportBoundariesExecutor.execute(phase3Results);
    }
};

module.exports = importBoundariesPlugin;

/**
 * type-only exports. These will be elided in the emitted JS.
 * They are primarily intended to be consumed when writing e.g. custom assertion rules in typescript.
 */
export type {
    FileToImportResolutions,
    ImportResolution,
    ImportResolutionResolvedImport,
    YaniceImportBoundariesAssertion,
    YaniceImportBoundariesImportResolver,
    YaniceImportBoundariesPostResolver
};
