#! /usr/bin/env node

import { ArgsParser, IYaniceArgs } from './src/config/args-parser';
import { ConfigParser, IYaniceConfig } from './src/config/config-parser';
import { DirectedGraphUtil, IDirectedGraph } from './src/dep-graph/directed-graph';
import { ChangedFiles } from './src/git-diff/changed-files';
import { ChangedProjects } from './src/git-diff/changed-projects';
import { FindFileUtil } from './src/util/find-file';

function log(message: any): void {
    // TODO Handle this better
    // tslint:disable-next-line:no-console
    console.log(message);
}

const yaniceConfigPath = FindFileUtil.findFileInParentDirs('yanice.json');
if (!yaniceConfigPath) {
    log('yanice.json not found!');
    // TODO This is awful
    process.exit(1);
}

const yaniceConfigJson: IYaniceConfig = require(yaniceConfigPath!);
const yaniceArgs: IYaniceArgs = ArgsParser.parseArgs(process.argv.slice(2));

let changedFiles: string[] = [];
if (yaniceArgs.diffTarget.branch) {
    changedFiles = ChangedFiles.filesChangedBetweenCurrentAndGivenBranch(yaniceArgs.diffTarget.branch, yaniceArgs.includeUncommitted);
}

const changedProjectsRaw = ChangedProjects.getChangedProjectsRaw(yaniceConfigJson.projects, changedFiles);
const depGraph: IDirectedGraph | null = ConfigParser.getDepGraphFromConfigByScope(yaniceConfigJson, yaniceArgs.givenScope);
if (!depGraph) {
    log('dep-graph cannot be constructed!');
    process.exit(1);
}
const affected = DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(depGraph!, changedProjectsRaw);
DirectedGraphUtil.sortTopologically(depGraph!, affected).forEach(projectName => log(projectName));
