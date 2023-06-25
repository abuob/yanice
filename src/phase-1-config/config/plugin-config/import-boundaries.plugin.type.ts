export interface YanicePluginImportBoundariesOptionsInterface {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    excluded?: string[];
    exclusionGlobs?: string[];
}
