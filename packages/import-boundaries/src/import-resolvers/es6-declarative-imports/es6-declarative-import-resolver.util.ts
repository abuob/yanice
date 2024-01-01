import { ParsedImportStatement } from '../../api/import-resolver.interface';

export class Es6DeclarativeImportResolverUtil {
    public static extractImportStatements(fileContent: string): string[] {
        const preparedFileContent: string = Es6DeclarativeImportResolverUtil.stripBlockComments(fileContent);
        const relevantStatementRegex: RegExp = /(^|\s|;)import\s(.|\s)*?from\s+?['"].*?['"]/g;
        let match: RegExpExecArray | null = null;
        const importStatements: string[] = [];
        while ((match = relevantStatementRegex.exec(preparedFileContent)) !== null) {
            importStatements.push(match[0]);
        }
        return importStatements.map((importStatement: string) =>
            Es6DeclarativeImportResolverUtil.normalizeImportStatement(importStatement)
        );
    }

    public static parseImportStatement(statement: string): ParsedImportStatement {
        const fromClause: string = Es6DeclarativeImportResolverUtil.extractFromClause(statement);
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

    private static stripBlockComments(fileContent: string): string {
        return fileContent.replace(/[/][*](.|\s)*?[*][/]/g, '');
    }

    private static normalizeImportStatement(importStatement: string): string {
        return importStatement
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/;?import\s/, 'import ');
    }
}
