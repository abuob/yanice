import fs from 'node:fs/promises';
import path from 'node:path';

import {
    FileImportMap,
    PackageLikeImportStatement,
    ParsedImportStatement,
    RelativeImportStatement
} from '../../api/import-resolver.interface';

export class ResolveImportStatements {
    public static async resolveImportStatements(
        absoluteFilePath: string,
        parsedImportStatements: ParsedImportStatement[]
    ): Promise<FileImportMap> {
        const fileImportMap: FileImportMap = {
            createdBy: 'import-resolver-es6',
            absoluteFilePath,
            skippedImports: [],
            resolvedImports: [],
            resolvedPackageImports: [],
            unknownImports: []
        };

        const relativeImportPromises: Promise<void>[] = [];
        parsedImportStatements.forEach((parsedImportStatement: ParsedImportStatement, index: number): void => {
            if (index > 0 && parsedImportStatements[index - 1]?.type === 'skip') {
                fileImportMap.skippedImports.push(parsedImportStatement);
                return;
            }
            if (parsedImportStatement.type === 'skip') {
                return;
            }
            if (parsedImportStatement.type === 'relative') {
                const resolveRelativeImportStatementPromise: Promise<void> = ResolveImportStatements.resolveRelativeImportStatement(
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
                const resolvedPackageImportOrNull: string | null = ResolveImportStatements.resolvePackageLikeImport(parsedImportStatement);
                if (resolvedPackageImportOrNull) {
                    fileImportMap.resolvedPackageImports.push({
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
        const isRelativeDirectImport: boolean = await ResolveImportStatements.isFile(pathJoinedWithTsExtension);
        if (isRelativeDirectImport) {
            return pathJoinedWithTsExtension;
        }

        const pathJoined: string = path.join(directoryPath, fromClause);
        const pathJoinedWithIndexTs: string = path.join(directoryPath, fromClause, 'index.ts');
        const isRelativeIndexTsImport: boolean = await Promise.all([
            ResolveImportStatements.isDirectory(pathJoined),
            ResolveImportStatements.isFile(pathJoinedWithIndexTs)
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
