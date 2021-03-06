#! /usr/bin/env node

import { FindFileUtil } from './src/util/find-file';
import { log } from './src/util/log';
import { YaniceExecutor } from './src/yanice-executor';

const yaniceConfigPath = FindFileUtil.findFileInParentDirsFromInitialDir('yanice.json', process.cwd());
if (!yaniceConfigPath) {
    log('yanice.json not found!');
    process.exit(1);
}

const baseDirectory = yaniceConfigPath.replace(/yanice\.json/, '');
const yaniceJson = require(yaniceConfigPath);

new YaniceExecutor()
    .loadConfigAndParseArgs(process.argv.slice(2), baseDirectory, yaniceJson)
    .calculateChangedFiles()
    .calculateChangedProjects()
    .calculateDepGraphForGivenScope()
    .verifyDepGraphValidity()
    .calculateAffectedProjectsUnfiltered()
    .calculateResponsibles()
    .outputResponsiblesAndExitIfShowResponsiblesMode()
    .filterOutUnsupportedProjectsIfNeeded()
    .outputAffectedAndExitIfOutputOnlyMode()
    .visualizeDepGraphIfInVisualizationMode()
    .executeCommands();
