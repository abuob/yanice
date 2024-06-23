export type ParsedImportStatement = PackageLikeImportStatement | RelativeImportStatement;

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

export interface ImportResolutionResolvedImport {
    parsedImportStatement: ParsedImportStatement;
    resolvedAbsoluteFilePath: string;
}

export interface ImportResolutionResolvedPackageImport {
    importStatement: string;
    package: string;
    resolvedAbsoluteFilePath: string;
}

export interface ImportResolution {
    createdBy: string;
    resolvedImports: ImportResolutionResolvedImport[];
    resolvedPackageImports: ImportResolutionResolvedPackageImport[];
    unknownImports: ParsedImportStatement[];
}

export interface SkipNextLineStatement extends AbstractImportStatement {
    type: 'skip-next-line';
    raw: string;
}

export interface FileToImportResolutions {
    skippedImports: SkipNextLineStatement[];
    importResolutions: ImportResolution[];
}

export type FileToImportResolutionsMap = Record<string, FileToImportResolutions>;

export interface YaniceImportBoundariesImportResolver {
    name: string;
    getFileImportMap: (absoluteFilePath: string, fileContent: string) => Promise<ImportResolution | null>;
}
