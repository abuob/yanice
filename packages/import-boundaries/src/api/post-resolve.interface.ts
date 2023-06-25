import { FileImportMap } from './import-resolver.interface';

export interface YaniceImportBoundariesPostResolver {
    postProcess: (fileImportMaps: FileImportMap[]) => Promise<FileImportMap[]>;
}
