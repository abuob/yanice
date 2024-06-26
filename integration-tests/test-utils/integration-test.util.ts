import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';

interface TestLogEntry {
    cwd: string;
    identifier: string;
}
type allProjectsType = 'project-A' | 'project-B' | 'project-C';
type TestLog = Partial<Record<allProjectsType, TestLogEntry[]>>;

interface CommandResult {
    statusCode: number | null;
    stdout: string;
    stderr: string | null;
}

export class IntegrationTestUtil {
    private static readonly allProjects: allProjectsType[] = ['project-A', 'project-B', 'project-C'];
    private static readonly repoRoot: string = path.join(__dirname, '../../');
    private static readonly testLogPath: string = path.join(__dirname, './test-log.json');

    public static async executeYaniceWithArgsAsync(args: string): Promise<CommandResult> {
        const pathToBin: string = path.join(__dirname, '../../dist/bin.js');
        const pathToTestProject: string = path.join(__dirname, '../test-project');
        return new Promise((resolve): void => {
            const yaniceProcess = spawn('node', [pathToBin, ...args.split(' ')], {
                cwd: pathToTestProject
            });
            let yaniceProcessStdout: string = '';
            let yaniceProcessStderr: string = '';
            yaniceProcess.stdout.on('data', (data): void => {
                yaniceProcessStdout += data.toString();
            });
            yaniceProcess.stderr.on('data', (error): void => {
                yaniceProcessStderr += error.toString();
            });
            yaniceProcess.on('close', (code: number | null): void => {
                const commandResult: CommandResult = {
                    stdout: yaniceProcessStdout,
                    stderr: yaniceProcessStderr.length > 0 ? yaniceProcessStderr : null,
                    statusCode: code
                };
                resolve(commandResult);
            });
        });
    }

    public static getNonEmptyLines(input: string): string[] {
        return input
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
    }

    public static assertCleanFiles(): void {
        const allFilePaths: string[] = IntegrationTestUtil.getAllEmptyFilePaths();
        const fileContents: string[] = allFilePaths.map((filePath: string): string => fs.readFileSync(filePath, { encoding: 'utf-8' }));
        fileContents.forEach((fileContent: string) => {
            expect(fileContent).to.equal('');
        });
        const testLog: TestLog = IntegrationTestUtil.getTestLog();
        expect(testLog).to.deep.equal({});
    }

    public static touchProject(project: allProjectsType): void {
        const absoluteFilePath: string = IntegrationTestUtil.mapProjectNameToEmptyTxt(project);
        fs.writeFileSync(absoluteFilePath, 'dummy-change, must be reverted!', { encoding: 'utf-8' });
    }

    public static resetChanges(): void {
        const relativeToRootPaths: string[] = IntegrationTestUtil.getAllEmptyFilePathsRelativeToRoot();
        relativeToRootPaths.forEach((relativePath: string): void => {
            execSync(`git checkout -- ${relativePath}`, { cwd: IntegrationTestUtil.repoRoot });
        });
        execSync(`git checkout -- integration-tests/test-utils/test-log.json`, { cwd: IntegrationTestUtil.repoRoot });
    }

    public static getTestLogByProject(project: allProjectsType): TestLogEntry[] {
        const testLog: TestLog = IntegrationTestUtil.getTestLog();
        return testLog[project] ?? [];
    }

    public static getAbsoluteFilePathInTestProject(relativePathToTestProject: string): string {
        return path.join(__dirname, '../test-project', relativePathToTestProject);
    }

    public static getAbsoluteFileFromRepoRoot(relativePathToRepoRoot: string): string {
        return path.join(IntegrationTestUtil.repoRoot, relativePathToRepoRoot);
    }

    public static mapProjectNameToEmptyTxt(project: allProjectsType): string {
        return IntegrationTestUtil.getAbsoluteFilePathInTestProject(path.join(project, 'empty.txt'));
    }

    public static normalizeTextOutput(textOutput: string): string {
        // Keep test CRLF-agnostic
        return textOutput.replace(/\r\n/g, '\n');
    }

    public static getTextFixtureContent(fileName: string): string {
        const fileContent: string = fs.readFileSync(path.join(__dirname, '../fixtures', fileName), { encoding: 'utf-8' });
        return IntegrationTestUtil.normalizeTextOutput(fileContent);
    }

    public static getAmountOfImportBoundaryViolations(stdout: string): number {
        // counting occurrences of ".ts:" is not ideal; we want to count the amount of violations in the output:
        return stdout.match(/\.ts:/g)?.length ?? 0;
    }

    private static getAllEmptyFilePathsRelativeToRoot(): string[] {
        const allProjects: allProjectsType[] = IntegrationTestUtil.allProjects;
        return allProjects.map((project: allProjectsType) => IntegrationTestUtil.mapProjectNameToRelativePathToRoot(project));
    }

    private static mapProjectNameToRelativePathToRoot(project: allProjectsType): string {
        return path.join(`integration-tests/test-project/${project}/empty.txt`);
    }

    private static getAllEmptyFilePaths(): string[] {
        const allProjects: allProjectsType[] = IntegrationTestUtil.allProjects;
        return allProjects.map((project: allProjectsType) => IntegrationTestUtil.mapProjectNameToEmptyTxt(project));
    }

    private static getTestLog(): TestLog {
        const existingTestLogRaw: string = fs.readFileSync(IntegrationTestUtil.testLogPath, { encoding: 'utf-8' }).toString().trim();
        return JSON.parse(existingTestLogRaw);
    }
}
