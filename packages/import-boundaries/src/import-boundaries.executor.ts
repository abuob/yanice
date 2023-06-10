import { LogUtil, Phase3Result, YaniceConfig, YanicePluginImportBoundariesOptionsInterface } from 'yanice';

export class ImportBoundariesExecutor {
    public static execute(phase3Result: Phase3Result): void {
        const yaniceConfig: YaniceConfig = phase3Result.phase2Result.phase1Result.yaniceConfig;
        const importBoundariesPluginConfig: YanicePluginImportBoundariesOptionsInterface | null =
            yaniceConfig.plugins.officiallySupported['import-boundaries'];
        if (!importBoundariesPluginConfig) {
            ImportBoundariesExecutor.exitPlugin(1, 'Plugin "import-boundaries" not configured in yanice.json!');
        }
    }

    private static exitPlugin(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
