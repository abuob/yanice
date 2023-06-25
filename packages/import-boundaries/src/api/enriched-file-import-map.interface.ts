import { FileImportMap } from './import-resolver.interface';

export interface EnrichedFileImportMap {
    createdByResolver: string;
    filePath: string;
    resolvedImports: {
        importStatement: string;
        filePath: string;
        projects: string[];
    }[];
    resolvedPackageImports: FileImportMap['resolvedPackageImports'];
    skippedImports: string[];
    unknownImports: string[];
}
