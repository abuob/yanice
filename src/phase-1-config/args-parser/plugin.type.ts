export type YanicePluginArgs = CustomYanicePluginArgs | ImportBoundariesYanicePluginArgs;

export type YaniceImportBoundariesModeType = 'assert' | 'generate' | 'print-assertion-data' | 'print-file-imports';

export interface CustomYanicePluginArgs {
    type: 'custom';
    pluginName: string;
    cliArgs: string[];
}

export interface ImportBoundariesYanicePluginArgs {
    type: 'import-boundaries';
    mode: YaniceImportBoundariesModeType;
    skipPostResolvers: boolean;
}
