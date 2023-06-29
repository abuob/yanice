export interface YanicePluginImportBoundariesOptionsInterface {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    assertionOptions?: {
        maximumSkippedImports?: number;
    };
    assertions?: string[];
    excluded?: string[];
    exclusionGlobs?: string[];
}
