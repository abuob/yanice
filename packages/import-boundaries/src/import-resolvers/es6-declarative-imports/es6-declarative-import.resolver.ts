import { ImportResolution, ParsedImportStatement, YaniceImportBoundariesImportResolver } from '../../api/import-resolver.interface';
import { ResolveImportLocationUtil } from '../util/resolve-import-location.util';
import { Es6DeclarativeImportResolverUtil } from './es6-declarative-import-resolver.util';

const ES6_DECLARATIVE_IMPORT_RESOLVER_NAME: string = 'es6-declarative-import-resolver';

export const es6DeclarativeImportResolver: YaniceImportBoundariesImportResolver = {
    name: ES6_DECLARATIVE_IMPORT_RESOLVER_NAME,
    getFileImportMap: (absoluteFilePath: string, fileContent: string): Promise<ImportResolution> => {
        const importStatements: string[] = Es6DeclarativeImportResolverUtil.extractImportStatements(fileContent);
        const parsedImportStatements: ParsedImportStatement[] = importStatements.map((importStatement: string) =>
            Es6DeclarativeImportResolverUtil.parseImportStatement(importStatement)
        );
        return ResolveImportLocationUtil.resolveImportStatements(
            absoluteFilePath,
            parsedImportStatements,
            ES6_DECLARATIVE_IMPORT_RESOLVER_NAME
        );
    }
};
