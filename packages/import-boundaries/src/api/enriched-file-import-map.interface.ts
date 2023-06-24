export interface EnrichedFileImportMap {
    createdByResolver: string;
    filePath: string;
    resolvedImports: {
        importStatement: string;
        filePath: string;
        projects: string[];
    }[];
    resolvedPackageImports: string[];
    skippedImports: string[];
    unknownImports: string[];
}
