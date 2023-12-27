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

export interface ImportResolution {
    createdBy: string;
    resolvedImports: ImportResolutionResolvedImport[];
    resolvedPackageImports: {
        package: string;
        resolvedAbsoluteFilePath: string;
    }[];
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

export interface YaniceImportBoundariesImportResolver {
    name: string;
    getFileImportMap: (absoluteFilePath: string, fileContent: string) => Promise<ImportResolution | null>;
}
