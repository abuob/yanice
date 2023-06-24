import { FileImportMap, ParsedImportStatement, YaniceImportBoundariesImportResolver } from '../../api/import-resolver.interface';
import { ExtractImportStatementsEs6 } from './extract-import-statements.es6';
import { ImportStatementParser } from './parse-import-statements';
import { ResolveImportStatements } from './resolve-import-statements';

export const importResolverEs6: YaniceImportBoundariesImportResolver = {
    name: 'import-resolver-es6',
    getFileImportMap: (absoluteFilePath: string, fileContent: string): Promise<FileImportMap> => {
        const importStatements: string[] = ExtractImportStatementsEs6.extractImportStatements(fileContent);
        const parsedImportStatements: ParsedImportStatement[] = importStatements.map((importStatement: string) =>
            ImportStatementParser.parseImportStatement(importStatement)
        );
        return ResolveImportStatements.resolveImportStatements(absoluteFilePath, parsedImportStatements);
    }
};
