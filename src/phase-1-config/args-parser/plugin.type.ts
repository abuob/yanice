export type YanicePluginArgs = CustomYanicePluginArgs | ImportBoundariesYanicePluginArgs;

export interface CustomYanicePluginArgs {
    type: 'custom';
    pluginName: string;
    cliArgs: string[];
}

export interface ImportBoundariesYanicePluginArgs {
    type: 'import-boundaries';
}
