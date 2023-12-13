export type ParsedImportStatement = PackageLikeImportStatement | RelativeImportStatement | SkipNextImportStatement | UnknownStatement;

interface AbstractImportStatement {
    raw: string;
}

export interface RelativeImportStatement extends AbstractImportStatement {
    type: 'relative';
    fromClause: string;
}

export interface PackageLikeImportStatement extends AbstractImportStatement {
    type: 'package-like';
    fromClause: string;
}

export interface SkipNextImportStatement extends AbstractImportStatement {
    type: 'skip';
}

export interface UnknownStatement extends AbstractImportStatement {
    type: 'unknown';
}

export interface ImportResolutionResolvedImport {
    parsedImportStatement: ParsedImportStatement;
    resolvedAbsoluteFilePath: string;
}

export interface ImportResolutions {
    createdBy: string;
    resolvedImports: ImportResolutionResolvedImport[];
    resolvedPackageImports: {
        package: string;
        resolvedAbsoluteFilePath: string;
    }[];
    skippedImports: ParsedImportStatement[];
    unknownImports: ParsedImportStatement[];
}

export interface YaniceImportBoundariesImportResolver {
    name: string;
    getFileImportMap: (absoluteFilePath: string, fileContent: string) => Promise<ImportResolutions | null>;
}
