export interface YanicePluginImportBoundariesOptionsInterface {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    assertions?: string[];
    excluded?: string[];
    exclusionGlobs?: string[];
}
