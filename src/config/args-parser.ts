import { log } from '../util/log';
import { commandOutputOptionsType } from './config.interface';

export type graphRendererType = 'DAGREJS' | 'VIZJS';

export interface YaniceArgs {
    givenScope: string;
    diffTarget: {
        branch: string | null;
        commit: string | null;
        rev: string | null;
    };
    includeUncommitted: boolean;
    includeAllProjects: boolean;
    includeCommandSupportedOnly: boolean;
    outputOnly: boolean;
    outputResponsibles: boolean;
    visualizeDepGraph: boolean;
    saveDepGraphVisualization: boolean;
    graphRenderer: graphRendererType;
    concurrency: number;
    commandOutputMode: commandOutputOptionsType | null;
}

export class ArgsParser {
    /**
     *
     * @param argv: process.argv.slice(2)
     */
    public static parseArgs(argv: string[]): YaniceArgs {
        const resultArgs: YaniceArgs = {
            givenScope: argv[0] ?? '',
            diffTarget: {
                branch: null,
                commit: null,
                rev: null
            },
            includeUncommitted: true,
            includeAllProjects: false,
            includeCommandSupportedOnly: true,
            outputOnly: false,
            outputResponsibles: false,
            visualizeDepGraph: false,
            saveDepGraphVisualization: false,
            graphRenderer: 'DAGREJS',
            commandOutputMode: null,
            concurrency: 1
        };
        argv.slice(1).forEach((arg) => {
            if (/^--branch=.+$/.test(arg)) {
                resultArgs.diffTarget.branch = arg.replace(/--branch=/, '');
                return;
            }
            if (/^--commit=.+$/.test(arg)) {
                resultArgs.diffTarget.commit = arg.replace(/--commit=/, '');
                return;
            }
            if (/^--rev=.+$/.test(arg)) {
                resultArgs.diffTarget.rev = arg.replace(/--rev=/, '');
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
            if (/^--include-uncommitted$/.test(arg)) {
                resultArgs.includeUncommitted = true;
                return;
            }
            if (/^--exclude-uncommitted$/.test(arg)) {
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
            if (/^--output-only$/.test(arg)) {
                resultArgs.outputOnly = true;
                return;
            }
            if (/^--concurrency=(\d)+$/.test(arg)) {
                resultArgs.concurrency = parseInt(arg.replace(/--concurrency=/, ''), 10);
                return;
            }
            if (/^--responsibles$/.test(arg)) {
                resultArgs.outputResponsibles = true;
                return;
            }
            if (/^--visualize$/.test(arg)) {
                resultArgs.visualizeDepGraph = true;
                return;
            }
            if (/^--save-visualization$/.test(arg)) {
                resultArgs.saveDepGraphVisualization = true;
                return;
            }
            if (/^--renderer=dagre$/.test(arg)) {
                resultArgs.graphRenderer = 'DAGREJS';
                return;
            }
            if (/^--renderer=vizjs$/.test(arg)) {
                resultArgs.graphRenderer = 'VIZJS';
                return;
            }
            if (/^--output-mode=ignore$/.test(arg)) {
                resultArgs.commandOutputMode = 'ignore';
                return;
            }
            if (/^--output-mode=append-at-end$/.test(arg)) {
                resultArgs.commandOutputMode = 'append-at-end';
                return;
            }
            if (/^--output-mode=append-at-end-on-error$/.test(arg)) {
                resultArgs.commandOutputMode = 'append-at-end-on-error';
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

    public static verifyDiffTargetPresence(yaniceArgs: YaniceArgs): void {
        if (
            yaniceArgs.diffTarget.commit === null &&
            yaniceArgs.diffTarget.branch === null &&
            yaniceArgs.diffTarget.rev === null &&
            !yaniceArgs.includeAllProjects &&
            !yaniceArgs.visualizeDepGraph &&
            !yaniceArgs.saveDepGraphVisualization
        ) {
            yaniceArgs.includeAllProjects = true;
            log('No diff target detected!');
            log('Use e.g. --rev=HEAD or --branch=master to let yanice know what to compare with.');
            log('See https://github.com/abuob/yanice#commands for details.');
            log('Defaulting to "--all" as if all files have changed...');
        }
    }
}
