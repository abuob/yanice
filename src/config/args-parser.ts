export interface IYaniceArgs {
    givenScope: string;
    diffTarget: {
        branch: string | null;
        commit: string | null;
    };
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
            }
        };
        argv.slice(1).forEach(arg => {
            if (/--branch=.+/.test(arg)) {
                resultArgs.diffTarget.branch = arg.replace(/--branch=/, '');
            }
            if (/--commit=.+/.test(arg)) {
                resultArgs.diffTarget.commit = arg.replace(/--commit=/, '');
            }
        });
        return resultArgs;
    }
}
