/**
 * Example:
 * {
 *     "resolvedImports": {
 *         "B": ["file/b/1", "file/b/2"],
 *         "C": ["file/c/1"]
 *     },
 *     "unknownImports": ["some/weird/import"]
 * }
 */
export interface FileToProjectImportMap {
    resolvedImports: Record<string, string[] | undefined>;
    unknownImports: string[];
}

/**
 * Example:
 * {
 *     "A": {
 *         "file/a/1": {
 *             "resolvedImports": {
 *                 "B": ["file/b/1", "file/b/2"],
 *                 "C": ["file/c/1"]
 *             },
 *             "unknownImports": ["some/weird/import"]
 *         }
 *     },
 *     "B": {
 *         "file/b/1": {
 *             "resolvedImports": {
 *                 "A": ["file/a/1", "file/a/2"]
 *             },
 *             "unknownImports": []
 *         }
 *     }
 * }
 */
export type ProjectImportMap = Record<string, Record<string, FileToProjectImportMap | undefined> | undefined>;
