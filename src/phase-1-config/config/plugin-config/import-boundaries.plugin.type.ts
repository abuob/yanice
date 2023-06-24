export interface YanicePluginImportBoundariesOptionsInterface {
    importResolvers: Record<string, string[]>;
    excluded?: string[];
    exclusionGlobs?: string[];
}
