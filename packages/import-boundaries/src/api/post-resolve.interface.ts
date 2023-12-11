import { ImportResolutions } from './import-resolver.interface';

export interface YaniceImportBoundariesPostResolverV2 {
    postProcess: (absoluteFilePath: string, resolvedImports: ImportResolutions[]) => Promise<ImportResolutions[]>;
}
