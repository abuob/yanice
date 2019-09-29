#! /usr/bin/env node

import { YaniceExecutor } from './src/yanice-executor';

new YaniceExecutor()
    .loadConfiguration()
    .parseArgs(process.argv.slice(2))
    .outputAndExitIfIncludeAllProjects()
    .calculateChangedFiles()
    .calculateChangedProjects()
    .calculateDepGraphForGivenScope()
    .verifyDepGraphValidity()
    .calculateAffectedProjects()
    .filterOutUnsupportedProjectsIfNeeded()
    .outputAffectedAndExitIfOutputOnlyMode()
    .executeCommands();
