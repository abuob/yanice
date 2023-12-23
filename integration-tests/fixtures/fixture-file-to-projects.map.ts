import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureFileToProjectsMap: Record<string, string[]> = {
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('dummy-plugin.js')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('dummy-resolver.js')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('post-resolve.js')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/empty.txt')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')]: ['ALL-FILES', 'B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')]: ['ALL-FILES', 'B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/empty.txt')]: ['ALL-FILES', 'C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')]: ['ALL-FILES', 'C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('yanice.json')]: ['ALL-FILES']
};
