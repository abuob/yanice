import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { AbstractPhase4Executor } from './phase-4.executor';
import { YaniceCliArgsPlugin } from '../phase-1-config/args-parser/cli-args.interface';
import { YanicePluginArgs } from '../phase-1-config/args-parser/plugin.type';
import { YanicePlugin } from './phase-4.plugin.executor.interface';
import { YaniceCustomPluginOptions } from '../phase-1-config/config/plugin-config/custom.plugin.type';
import path from 'path';

export class Phase4PluginExecutor extends AbstractPhase4Executor {
    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result, yaniceCliArgsPlugin: YaniceCliArgsPlugin): void {
        new Phase4PluginExecutor(phase3Result).runPlugin(yaniceCliArgsPlugin.selectedPlugin, phase3Result);
    }

    private runPlugin(yanicePluginCliArgs: YanicePluginArgs, phase3Result: Phase3Result): void {
        const pluginExecutor: YanicePlugin = this.importPlugin(yanicePluginCliArgs, phase3Result);
        pluginExecutor.execute(phase3Result);
    }

    private importPlugin(yanicePluginCliArgs: YanicePluginArgs, phase3Result: Phase3Result): YanicePlugin {
        // TODO: Handle this better
        switch (yanicePluginCliArgs.type) {
            case 'import-boundaries': {
                return require('@yanice/import-boundaries');
            }
            case 'custom': {
                const yaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
                const yaniceJsonDirectoryPath: string = phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
                const pluginName = yanicePluginCliArgs.pluginName;
                const pluginOptions: YaniceCustomPluginOptions<unknown> | undefined = yaniceConfig.plugins.custom[pluginName];
                if (!pluginOptions) {
                    // TODO: Handle this better
                    throw new Error(`Unable to find configuration for plugin "${yanicePluginCliArgs.pluginName}" in yanice.json`);
                }
                const scriptLocation: string = pluginOptions.scriptLocation;
                const scriptLocationAbsolute: string = path.join(yaniceJsonDirectoryPath, scriptLocation);
                return require(scriptLocationAbsolute); // TODO: Add some sanity checks
            }
        }
    }
}
