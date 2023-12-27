import { ParsedImportStatement } from '../../../api/import-resolver.interface';

export class ImportStatementParserV2 {
    public static parseImportStatement(statement: string): ParsedImportStatement {
        const fromClause: string = ImportStatementParserV2.extractFromClause(statement);
        if (/^\./.test(fromClause)) {
            return {
                type: 'relative',
                raw: statement,
                fromClause
            };
        }
        return {
            type: 'package-like',
            raw: statement,
            fromClause
        };
    }

    public static extractFromClause(statement: string): string {
        return statement
            .replace(/.+([ ]from)/, '')
            .trim()
            .replace(/['";]/g, '');
    }
}
