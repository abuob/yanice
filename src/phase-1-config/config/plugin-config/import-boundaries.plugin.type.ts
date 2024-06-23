export interface YanicePluginImportBoundariesSkippedImportsOptions {
    mode: 'exact' | 'max';
    amount: number;
}

export interface YanicePluginImportBoundariesAccessViaEntryPointsOptions {
    allowWithinSameProject: boolean;
}

export interface YanicePluginImportBoundariesRestrictPackageImportsOptions {
    allPackagesMustBeListed?: boolean;
    allowConfiguration: {
        allowByDefault: string[];
        exceptions?: Record<string, string[]>;
    };
    blockConfiguration: {
        blockByDefault: string[];
        exceptions?: Record<string, string[]>;
    };
}

export type importBoundaryAssertionIdentifierType =
    | 'access-via-entrypoints'
    | 'max-skipped-imports'
    | 'only-direct-imports'
    | 'only-transitive-dependencies'
    | 'restrict-package-imports'
    | 'use-all-declared-dependencies';

export interface YanicePluginImportBoundariesOptions {
    importResolvers: Record<string, string[]>;
    postResolve?: string[];
    assertionOptions?: {
        skippedImports?: YanicePluginImportBoundariesSkippedImportsOptions;
        ignoredProjects?: string[];
        accessViaEntryPoints?: YanicePluginImportBoundariesAccessViaEntryPointsOptions;
        restrictPackageImports?: YanicePluginImportBoundariesRestrictPackageImportsOptions;
    };
    assertions?: importBoundaryAssertionIdentifierType[];
    customAssertions?: string[];
}
