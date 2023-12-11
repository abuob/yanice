import { ImportResolutions, ParsedImportStatement, YaniceImportBoundariesImportResolver } from '../../api/import-resolver.interface';
import { ExtractImportStatementsEs6 } from './util/extract-import-statements.es6';
import { ImportStatementParserV2 } from './util/parse-import-statements';
import { ResolveImportStatements } from './util/resolve-import-statements';

const IMPORT_RESOLVER_ES6_NAME: string = 'import-resolver-es6';

export const importResolverEs6: YaniceImportBoundariesImportResolver = {
    name: IMPORT_RESOLVER_ES6_NAME,
    getFileImportMap: (absoluteFilePath: string, fileContent: string): Promise<ImportResolutions> => {
        const importStatements: string[] = ExtractImportStatementsEs6.extractImportStatements(fileContent);
        const parsedImportStatements: ParsedImportStatement[] = importStatements.map((importStatement: string) =>
            ImportStatementParserV2.parseImportStatement(importStatement)
        );
        return ResolveImportStatements.resolveImportStatements(absoluteFilePath, parsedImportStatements, IMPORT_RESOLVER_ES6_NAME);
    }
};
