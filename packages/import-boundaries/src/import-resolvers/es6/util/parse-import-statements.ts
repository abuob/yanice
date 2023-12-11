import { ParsedImportStatement } from '../../../api/import-resolver.interface';

export class ImportStatementParserV2 {
    public static parseImportStatement(statement: string): ParsedImportStatement {
        if (/@yanice:import-boundaries ignore-next-statement/.test(statement)) {
            return {
                type: 'skip',
                raw: statement
            };
        }
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
