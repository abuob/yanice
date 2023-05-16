import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { expect } from 'chai';

type allProjectsType = 'project-A' | 'project-B' | 'project-C';

export class IntegrationTestUtil {
    public static executeYaniceWithArgs(args: string): string {
        const pathToBin: string = path.join(__dirname, '../dist/bin.js');
        const pathToTestProject: string = path.join(__dirname, './test-project');
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
    }

    public static touchProject(project: allProjectsType): void {
        const absoluteFilePath: string = IntegrationTestUtil.mapProjectNameToAbsoluteFileName(project);
        fs.writeFileSync(absoluteFilePath, 'dummy-change, must be reverted!', { encoding: 'utf-8' });
    }

    public static resetChanges(): void {
        const allFilePaths: string[] = IntegrationTestUtil.getAllEmptyFilePaths();
        allFilePaths.forEach((filePath): void => {
            fs.writeFileSync(filePath, '', { encoding: 'utf-8' });
        });
    }

    private static getAllEmptyFilePaths(): string[] {
        const allProjects: allProjectsType[] = ['project-A', 'project-B', 'project-C'];
        return allProjects.map((project: allProjectsType) => IntegrationTestUtil.mapProjectNameToAbsoluteFileName(project));
    }

    private static mapProjectNameToAbsoluteFileName(project: allProjectsType): string {
        return path.join(__dirname, 'test-project', project, 'empty.txt');
    }
}
