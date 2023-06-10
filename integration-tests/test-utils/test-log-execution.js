#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const INIT_CWD = process.env.INIT_CWD; // Will be set by npm; script is not supposed to be called directly

class TestLogExecution {
    static testLogFilePath = path.join(__dirname, './test-log.json');

    static main(projectName, identifier, initCwd) {
        TestLogExecution.assertTruthy('projectName', projectName);
        TestLogExecution.assertTruthy('initCwd', initCwd);
        TestLogExecution.assertTruthy('identifier', identifier);

        const existingTestLogRaw = fs.readFileSync(TestLogExecution.testLogFilePath, { encoding: 'utf-8' }).toString().trim();
        const existingTestLog = JSON.parse(existingTestLogRaw);

        TestLogExecution.assertTruthy('existingTestLog', existingTestLog);

        const logEntry = {
            cwd: initCwd,
            identifier
        };

        if (!!existingTestLog[projectName]) {
            const existingData = existingTestLog[projectName];
            TestLogExecution.assertIsArray('existingData', existingData);
            existingData.push(logEntry);
        } else {
            existingTestLog[projectName] = [logEntry];
        }

        fs.writeFileSync(TestLogExecution.testLogFilePath, JSON.stringify(existingTestLog, null, 4), { encoding: 'utf-8' });
    }

    static assertTruthy(variableName, variable) {
        if (!!variable) {
            return;
        }
        console.error(`Expected "${variableName}" to be truthy, got: ${variable}`);
        process.exit(1);
    }

    static assertIsArray(variableName, variable) {
        if (Array.isArray(variable)) {
            return;
        }
        console.error(`Expected "${variableName}" to be an array, got: ${variable}`);
        process.exit(1);
    }
}

TestLogExecution.main(args[0], args[1], INIT_CWD);
