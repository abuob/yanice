export type ParsedImportStatement = PackageLikeImportStatement | RelativeImportStatement | SkipNextImportStatement | UnknownStatement;

export interface RelativeImportStatement {
    type: 'relative';
    raw: string;
    fromClause: string;
}

export interface PackageLikeImportStatement {
    type: 'package-like';
    raw: string;
    fromClause: string;
}

export interface SkipNextImportStatement {
    type: 'skip';
    raw: string;
}

export interface UnknownStatement {
    type: 'unknown';
    raw: string;
}

export interface FileImportMap {
    createdBy: string;
    absoluteFilePath: string;
    resolvedImports: {
        parsedImportStatement: ParsedImportStatement;
        resolvedAbsoluteFilePath: string;
    }[];
    resolvedPackageImports: string[];
    skippedImports: ParsedImportStatement[];
    unknownImports: ParsedImportStatement[];
}

export interface YaniceImportBoundariesImportResolver {
    name: string;
    getFileImportMap: (absoluteFilePath: string, fileContent: string) => Promise<FileImportMap | null>;
}
