export class ExtractImportStatementsJavascript {
    public static extractImportStatements(fileContent: string): string[] {
        const preparedFileContent = ExtractImportStatementsJavascript.stripBlockComments(fileContent);
        const importStatementRegex: RegExp = /import[ \t\n](.|\n|\r)*?from[ \t\n]+?['"].*?['"]/g;
        let match: RegExpExecArray | null = null;
        const importStatements: string[] = [];
        while ((match = importStatementRegex.exec(preparedFileContent)) !== null) {
            importStatements.push(match[0]);
        }
        return importStatements.map((importStatement: string) =>
            ExtractImportStatementsJavascript.normalizeImportStatement(importStatement)
        );
    }

    private static stripBlockComments(fileContent: string): string {
        return fileContent.replace(/[/][*](.|\n|\r)*?[*][/]/g, '');
    }

    private static normalizeImportStatement(importStatement: string): string {
        return importStatement
            .trim()
            .replace(/[\t\n\r]/g, ' ')
            .replace(/[ ]*from[ ]*/, ' from ')
            .replace(/[ ]*import[ ]*/, 'import ');
    }
}
