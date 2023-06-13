export type YanicePluginArgs = CustomYanicePluginArgs | ImportBoundariesYanicePluginArgs;

export type YaniceImportBoundariesModeType = 'assert' | 'print-file-imports' | 'print-project-imports';

export interface CustomYanicePluginArgs {
    type: 'custom';
    pluginName: string;
    cliArgs: string[];
}

export interface ImportBoundariesYanicePluginArgs {
    type: 'import-boundaries';
    mode: YaniceImportBoundariesModeType;
}
