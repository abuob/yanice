import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureFileToProjectsMap: Record<string, string[]> = {
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('dummy-plugin.js')]: [],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('dummy-resolver.js')]: [],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('post-resolve.js')]: [],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/empty.txt')]: ['A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts')]: ['A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')]: ['A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')]: ['B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')]: ['B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/empty.txt')]: ['C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')]: ['C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('yanice.json')]: []
};
