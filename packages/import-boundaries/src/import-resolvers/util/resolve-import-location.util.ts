import fs from 'node:fs/promises';
import path from 'node:path';

import {
    ImportResolution,
    PackageLikeImportStatement,
    ParsedImportStatement,
    RelativeImportStatement
} from '../../api/import-resolver.interface';

export class ResolveImportLocationUtil {
    public static async resolveImportStatements(
        absoluteFilePath: string,
        parsedImportStatements: ParsedImportStatement[],
        importResolverName: string
    ): Promise<ImportResolution> {
        const fileImportMap: ImportResolution = {
            createdBy: importResolverName,
            resolvedImports: [],
            resolvedPackageImports: [],
            unknownImports: []
        };

        const relativeImportPromises: Promise<void>[] = [];
        parsedImportStatements.forEach((parsedImportStatement: ParsedImportStatement): void => {
            if (parsedImportStatement.type === 'relative') {
                const resolveRelativeImportStatementPromise: Promise<void> = ResolveImportLocationUtil.resolveRelativeImportStatement(
                    absoluteFilePath,
                    parsedImportStatement
                ).then((resolvedImportOrNull: string | null): Promise<void> => {
                    if (resolvedImportOrNull) {
                        fileImportMap.resolvedImports.push({
                            parsedImportStatement,
                            resolvedAbsoluteFilePath: resolvedImportOrNull
                        });
                    } else {
                        fileImportMap.unknownImports.push(parsedImportStatement);
                    }
                    return Promise.resolve();
                });
                relativeImportPromises.push(resolveRelativeImportStatementPromise);
                return;
            }
            if (parsedImportStatement.type === 'package-like') {
                const resolvedPackageImportOrNull: string | null =
                    ResolveImportLocationUtil.resolvePackageLikeImport(parsedImportStatement);
                if (resolvedPackageImportOrNull) {
                    fileImportMap.resolvedPackageImports.push({
                        importStatement: parsedImportStatement.raw,
                        package: parsedImportStatement.fromClause,
                        resolvedAbsoluteFilePath: resolvedPackageImportOrNull
                    });
                } else {
                    fileImportMap.unknownImports.push(parsedImportStatement);
                }
                return;
            }
        });
        await Promise.all(relativeImportPromises);
        return fileImportMap;
    }

    private static async resolveRelativeImportStatement(
        absoluteFilePath: string,
        relativeImportStatement: RelativeImportStatement
    ): Promise<string | null> {
        const directoryPath: string = path.dirname(absoluteFilePath);
        const fromClause: string = relativeImportStatement.fromClause;
        const pathJoinedWithTsExtension: string = path.join(directoryPath, `${fromClause}.ts`);
        const isRelativeDirectImport: boolean = await ResolveImportLocationUtil.isFile(pathJoinedWithTsExtension);
        if (isRelativeDirectImport) {
            return pathJoinedWithTsExtension;
        }

        const pathJoined: string = path.join(directoryPath, fromClause);
        const pathJoinedWithIndexTs: string = path.join(directoryPath, fromClause, 'index.ts');
        const isRelativeIndexTsImport: boolean = await Promise.all([
            ResolveImportLocationUtil.isDirectory(pathJoined),
            ResolveImportLocationUtil.isFile(pathJoinedWithIndexTs)
        ]).then(([isRelativeDirectoryImport, doesIndexTsFileExist]) => {
            return isRelativeDirectoryImport && doesIndexTsFileExist;
        });
        if (isRelativeIndexTsImport) {
            return pathJoinedWithIndexTs;
        }

        // Attempt to resolve JS with node:
        try {
            return require.resolve(pathJoined);
        } catch (e) {
            return null;
        }
    }

    private static resolvePackageLikeImport(packageLikeImportStatement: PackageLikeImportStatement): string | null {
        try {
            return require.resolve(packageLikeImportStatement.fromClause);
        } catch (e) {
            return null;
        }
    }

    private static async isDirectory(absolutePath: string): Promise<boolean> {
        try {
            const lstat = await fs.lstat(absolutePath);
            return lstat.isDirectory();
        } catch (e) {
            return false;
        }
    }

    private static async isFile(absolutePath: string): Promise<boolean> {
        try {
            const lstat = await fs.lstat(absolutePath);
            return lstat.isFile();
        } catch (e) {
            return false;
        }
    }
}
