export interface YanicePluginImportBoundariesSkippedImportsOptions {
    mode: 'exact' | 'max';
    amount: number;
}

export type importBoundaryAssertionIdentifierType =
    | 'access-via-entrypoints'
    | 'max-skipped-imports'
    | 'only-direct-imports'
    | 'only-transitive-dependencies'
    | 'use-all-declared-dependencies';

export interface YanicePluginImportBoundariesOptions {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    assertionOptions?: {
        skippedImports?: YanicePluginImportBoundariesSkippedImportsOptions;
        ignoredProjects?: string[];
    };
    assertions?: importBoundaryAssertionIdentifierType[];
    customAssertions?: string[];
}
