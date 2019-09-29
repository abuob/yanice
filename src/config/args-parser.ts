import { log } from '../util/log';

export interface IYaniceArgs {
    givenScope: string;
    diffTarget: {
        branch: string | null;
        commit: string | null;
    };
    includeUncommitted: boolean;
    includeAllProjects: boolean;
    includeCommandSupportedOnly: boolean;
    outputOnly: boolean;
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
            includeUncommitted: true,
            includeAllProjects: false,
            includeCommandSupportedOnly: false,
            outputOnly: false
        };
        argv.slice(1).forEach(arg => {
            if (/^--branch=.+$/.test(arg)) {
                resultArgs.diffTarget.branch = arg.replace(/--branch=/, '');
                return;
            }
            if (/^--commit=.+$/.test(arg)) {
                resultArgs.diffTarget.commit = arg.replace(/--commit=/, '');
                return;
            }
            if (/^--includeUncommitted=true$/.test(arg)) {
                resultArgs.includeUncommitted = true;
                return;
            }
            if (/^--includeUncommitted=false$/.test(arg)) {
                resultArgs.includeUncommitted = false;
                return;
            }
            if (/^--includeCommandSupportedOnly=false$/.test(arg)) {
                resultArgs.includeCommandSupportedOnly = false;
                return;
            }
            if (/^--includeCommandSupportedOnly=true$/.test(arg)) {
                resultArgs.includeCommandSupportedOnly = true;
                return;
            }
            if (/^--outputOnly=false$/.test(arg)) {
                resultArgs.outputOnly = false;
                return;
            }
            if (/^--outputOnly=true$/.test(arg)) {
                resultArgs.outputOnly = true;
                return;
            }
            if (/^--all$/.test(arg)) {
                resultArgs.includeAllProjects = true;
                return;
            }
            log(`Detected unknown parameter: "${arg}", ignore and continue...`);
        });
        return resultArgs;
    }
}
