import { SkipNextLineStatement } from '../../../api/import-resolver.interface';

export interface SkipStatementHandlingResult {
    inputWithoutSkipStatements: string;
    skipStatements: SkipNextLineStatement[];
}

export class SkipStatementsUtil {
    public static handleSkipStatements(input: string): SkipStatementHandlingResult {
        const skipNextLineRegExp: RegExp = /@yanice:import-boundaries ignore-next-line[ \r]*\n(.|\r)*(\n|$)/g;
        const matches: Iterable<RegExpMatchArray> = input.matchAll(skipNextLineRegExp);
        const skipStatements: SkipNextLineStatement[] = [];
        for (const match of matches) {
            const skipNextLineStatement: SkipNextLineStatement = {
                type: 'skip-next-line',
                raw: match[0]
            };
            skipStatements.push(skipNextLineStatement);
        }
        if (skipStatements.length === 0) {
            return {
                inputWithoutSkipStatements: input,
                skipStatements: []
            };
        }
        const inputWithoutSkips: string = input.replaceAll(skipNextLineRegExp, '');
        return {
            inputWithoutSkipStatements: inputWithoutSkips,
            skipStatements
        };
    }
}
