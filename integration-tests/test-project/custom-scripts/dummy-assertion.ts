import type {
    ImportBoundaryAssertionData,
    YaniceImportBoundariesAssertion,
    YaniceImportBoundariesAssertionViolation
} from '@yanice/import-boundaries';
import type { Phase3Result, YaniceCliArgs, YanicePluginImportBoundariesOptions } from 'yanice';

const dummyAssertion: YaniceImportBoundariesAssertion = {
    assertBoundaries: (
        phase3Results: Phase3Result,
        _importBoundariesPluginConfig: YanicePluginImportBoundariesOptions,
        _assertionData: ImportBoundaryAssertionData
    ): Promise<YaniceImportBoundariesAssertionViolation[]> => {
        const cliArgs: YaniceCliArgs = phase3Results.phase2Result.phase1Result.yaniceCliArgs;
        const scope: string | null = cliArgs.defaultArgs.scope;
        if (scope === 'dummy-assertion-fail') {
            const customViolation: YaniceImportBoundariesAssertionViolation = {
                type: 'custom-assertion-violation',
                message: '[DUMMY-ASSERTION] dummy-assertion-fail'
            };
            return Promise.resolve([customViolation]);
        }
        return Promise.resolve([]);
    }
};

module.exports = dummyAssertion;
