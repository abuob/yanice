export class ExtractImportStatementsEs6 {
    public static extractImportStatements(fileContent: string): string[] {
        const preparedFileContent = ExtractImportStatementsEs6.stripBlockComments(fileContent);
        const relevantStatementRegex: RegExp =
            /(import[ \t\n](.|\n|\r)*?from[ \t\n]+?['"].*?['"]|\/\/[ ]*@yanice:import-boundaries ignore-next-statement)/g;
        let match: RegExpExecArray | null = null;
        const importStatements: string[] = [];
        while ((match = relevantStatementRegex.exec(preparedFileContent)) !== null) {
            importStatements.push(match[0]);
        }
        return importStatements.map((importStatement: string) => ExtractImportStatementsEs6.normalizeImportStatement(importStatement));
    }

    private static stripBlockComments(fileContent: string): string {
        return fileContent.replace(/[/][*](.|\n|\r)*?[*][/]/g, '');
    }

    private static normalizeImportStatement(importStatement: string): string {
        return importStatement
            .trim()
            .replace(/[\t\n\r]/g, ' ')
            .replace(/[\s\t]+from[\s\t]+/, ' from ')
            .replace(/[\s\t]*import[\s\t]+/, 'import ');
    }
}
