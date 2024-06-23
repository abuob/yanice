import { ParsedImportStatement } from '../../api/import-resolver.interface';

export class Es6DeclarativeImportResolverUtil {
    /**
     * Extracts all import-statements. Note that aggregated export statements are "implicit imports",
     * therefore they have to be considered as well.
     * E.g. "export * from './some-file'" implicitly imports everything from './some-file'.
     */
    public static extractImportStatements(fileContent: string): string[] {
        const preparedFileContent: string = Es6DeclarativeImportResolverUtil.stripBlockComments(fileContent);
        const declarativeImportStatementRegExp: RegExp = /(^|[ \t\n\r]|;)import[ \t\n\r](.|\n|\r)*?from[ \t\n\r]+?['"].*?['"]/g;
        const aggregatedExportStatementRegExp: RegExp =
            /(^|[ \t\n\r]|;)export((?![ \t\n\r]+(const|let|function|class|import|default|;))[ \t\n\r]+)(.|\n|\r)*?from[ \t\n\r]+?['"].*?['"]/g;

        let match: RegExpExecArray | null = null;
        const importStatements: string[] = [];
        while ((match = declarativeImportStatementRegExp.exec(preparedFileContent)) !== null) {
            importStatements.push(match[0]);
        }
        while ((match = aggregatedExportStatementRegExp.exec(preparedFileContent)) !== null) {
            importStatements.push(match[0]);
        }
        return importStatements.map((importStatement: string): string =>
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
        return fileContent.replace(/[/][*](.|\n|\r)*?[*][/]/g, '');
    }

    private static normalizeImportStatement(importStatement: string): string {
        return importStatement
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/;?import\s/, 'import ');
    }
}
