#! /usr/bin/env node

import { YaniceExecutor } from './src/yanice-executor';

new YaniceExecutor()
    .loadConfiguration()
    .parseArgs(process.argv.slice(2))
    .calculateChangedFiles()
    .calculateChangedProjects()
    .calculateDepGraphForGivenScope()
    .verifyDepGraphValidity()
    .calculateAffectedProjects()
    .calculateResponsibles()
    .outputResponsiblesAndExitIfShowResponsiblesMode()
    .filterOutUnsupportedProjectsIfNeeded()
    .outputAffectedAndExitIfOutputOnlyMode()
    .executeCommands();
