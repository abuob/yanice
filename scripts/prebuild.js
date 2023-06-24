#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const execSync = require('node:child_process').execSync;

const repoRoot = path.join(__dirname, '../');
const yaniceDistPath = path.join(repoRoot, 'dist');

const isYaniceAlreadyBuilt = fs.existsSync(yaniceDistPath) && fs.lstatSync(yaniceDistPath).isDirectory();

/**
 * In case yanice is not yet built, we need to build it in order to use yanice to build itself
 */
if (!isYaniceAlreadyBuilt) {
    console.info('First time usage of yanice it seems; building yanice to use yanice to build yanice...');
    execSync('npm run build-for-local', { cwd: repoRoot, stdio: 'inherit' });
}
