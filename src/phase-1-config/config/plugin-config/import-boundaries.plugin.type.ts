export interface YanicePluginImportBoundariesSkippedImportsOptions {
    mode: 'exact' | 'max';
    amount: number;
}

export interface YanicePluginImportBoundariesOptions {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    assertionOptions?: {
        skippedImports?: YanicePluginImportBoundariesSkippedImportsOptions;
        ignoredProjects: string[];
    };
    assertions?: string[];
    excluded?: string[];
    exclusionGlobs?: string[];
}
