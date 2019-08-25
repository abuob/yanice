export interface IYaniceArgs {
    givenScope: string;
    diffTarget: {
        branch: string | null;
        commit: string | null;
    };
    includeUncommitted: boolean;
}

export class ArgsParser {
    /**
     *
     * @param argv: process.argv.slice(2)
     */
    public static parseArgs(argv: string[]): IYaniceArgs {
        const resultArgs: IYaniceArgs = {
            givenScope: argv[0],
            diffTarget: {
                branch: null,
                commit: null
            },
            includeUncommitted: true
        };
        argv.slice(1).forEach(arg => {
            if (/^--branch=.+$/.test(arg)) {
                resultArgs.diffTarget.branch = arg.replace(/--branch=/, '');
            }
            if (/^--commit=.+$/.test(arg)) {
                resultArgs.diffTarget.commit = arg.replace(/--commit=/, '');
            }
            if (/^--includeUncommitted=true$/.test(arg)) {
                resultArgs.includeUncommitted = true;
            }
            if (/^--includeUncommitted=false$/.test(arg)) {
                resultArgs.includeUncommitted = false;
            }
        });
        return resultArgs;
    }
}
