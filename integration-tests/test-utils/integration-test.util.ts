import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { expect } from 'chai';

interface TestLogEntry {
    cwd: string;
    identifier: string;
}
type allProjectsType = 'project-A' | 'project-B' | 'project-C';
type TestLog = Partial<Record<allProjectsType, TestLogEntry[]>>;

export class IntegrationTestUtil {
    private static readonly allProjects: allProjectsType[] = ['project-A', 'project-B', 'project-C'];
    private static readonly repoRoot: string = path.join(__dirname, '../../');
    private static readonly testLogPath: string = path.join(__dirname, './test-log.json');

    public static executeYaniceWithArgs(args: string): string {
        const pathToBin: string = path.join(__dirname, '../../dist/bin.js');
        const pathToTestProject: string = path.join(__dirname, '../test-project');
        return execSync(`node ${pathToBin} ${args}`, { cwd: pathToTestProject }).toString();
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
        const absoluteFilePath: string = IntegrationTestUtil.mapProjectNameToAbsoluteFileName(project);
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

    private static getAllEmptyFilePathsRelativeToRoot(): string[] {
        const allProjects: allProjectsType[] = IntegrationTestUtil.allProjects;
        return allProjects.map((project: allProjectsType) => IntegrationTestUtil.mapProjectNameToRelativePathToRoot(project));
    }

    private static mapProjectNameToRelativePathToRoot(project: allProjectsType): string {
        return path.join(`integration-tests/test-project/${project}/empty.txt`);
    }

    private static getAllEmptyFilePaths(): string[] {
        const allProjects: allProjectsType[] = IntegrationTestUtil.allProjects;
        return allProjects.map((project: allProjectsType) => IntegrationTestUtil.mapProjectNameToAbsoluteFileName(project));
    }

    private static mapProjectNameToAbsoluteFileName(project: allProjectsType): string {
        return path.join(__dirname, '../test-project', project, 'empty.txt');
    }

    private static getTestLog(): TestLog {
        const existingTestLogRaw: string = fs.readFileSync(IntegrationTestUtil.testLogPath, { encoding: 'utf-8' }).toString().trim();
        return JSON.parse(existingTestLogRaw);
    }
}