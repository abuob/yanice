import { EnrichedFileImportMap } from './enriched-file-import-map.interface';

export type ProjectImportByFilesMap = Record<string, EnrichedFileImportMap[] | undefined>;
