import fs from 'node:fs';
import path from 'node:path';

import {
    FileImportMap,
    PackageLikeImportStatement,
    ParsedImportStatement,
    RelativeImportStatement
} from '../../api/import-resolver.interface';

export class ResolveImportStatements {
    public static resolveImportStatements(absoluteFilePath: string, parsedImportStatements: ParsedImportStatement[]): FileImportMap {
        const fileImportMap: FileImportMap = {
            createdBy: 'es6-import-resolver',
            absoluteFilePath,
            skippedImports: [],
            resolvedImports: [],
            resolvedPackageImports: [],
            unknownImports: []
        };
        parsedImportStatements.forEach((parsedImportStatement: ParsedImportStatement, index: number): void => {
            if (index > 0 && parsedImportStatements[index - 1]?.type === 'skip') {
                fileImportMap.skippedImports.push(parsedImportStatement);
            }
            if (parsedImportStatement.type === 'skip') {
                return;
            }
            if (parsedImportStatement.type === 'relative') {
                const resolvedImportOrNull: string | null = ResolveImportStatements.resolveRelativeImportStatement(
                    absoluteFilePath,
                    parsedImportStatement
                );
                if (resolvedImportOrNull) {
                    fileImportMap.resolvedImports.push({
                        parsedImportStatement,
                        resolvedAbsoluteFilePath: resolvedImportOrNull
                    });
                }
                fileImportMap.unknownImports.push(parsedImportStatement);
                return;
            }
            if (parsedImportStatement.type === 'package-like') {
                const resolvedPackageImportOrNull: string | null = ResolveImportStatements.resolvePackageLikeImport(parsedImportStatement);
                if (resolvedPackageImportOrNull) {
                    fileImportMap.resolvedPackageImports.push(resolvedPackageImportOrNull);
                }
                fileImportMap.unknownImports.push(parsedImportStatement);
                return;
            }
        });
        return fileImportMap;
    }

    private static resolveRelativeImportStatement(
        absoluteFilePath: string,
        relativeImportStatement: RelativeImportStatement
    ): string | null {
        const fromClause: string = relativeImportStatement.fromClause;
        const pathJoinedWithTsExtension: string = path.join(absoluteFilePath, fromClause, '.ts');
        if (fs.existsSync(pathJoinedWithTsExtension) && fs.lstatSync(pathJoinedWithTsExtension).isFile()) {
            return pathJoinedWithTsExtension;
        }

        const pathJoined: string = path.join(absoluteFilePath, fromClause);
        const pathJoinedWithIndexTs: string = path.join(absoluteFilePath, fromClause, 'index.ts');
        if (fs.existsSync(pathJoined) && fs.lstatSync(pathJoined).isDirectory()) {
            if (fs.existsSync(pathJoinedWithIndexTs) && fs.lstatSync(pathJoinedWithIndexTs).isFile()) {
                return pathJoinedWithIndexTs;
            }
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
}
