#!/usr/bin/env node

import path from 'node:path';

import { FindFileUtil } from './src/util/find-file';
import { LogUtil } from './src/util/log-util';
import { YaniceExecutor } from './src/yanice-executor';

const yaniceJsonPath = FindFileUtil.findFileInParentDirsRecursively(process.cwd(), 'yanice.json');
if (!yaniceJsonPath) {
    LogUtil.log('yanice.json not found!');
    process.exit(1);
}
const yaniceJsonDirectory: string = path.dirname(yaniceJsonPath);
const gitRepoRootPath: string | null = FindFileUtil.getGitRoot(yaniceJsonDirectory);
if (!gitRepoRootPath) {
    LogUtil.log('Could not find a .git folder, is the yanice.json inside a git-repository?');
    process.exit(1);
}

const yaniceJson = require(yaniceJsonPath);

new YaniceExecutor()
    .executePhase1(process.argv.slice(2), yaniceJsonDirectory, gitRepoRootPath, yaniceJson)
    .executePhase2()
    .executePhase3()
    .executePhase4();
