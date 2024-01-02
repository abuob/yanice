import { IntegrationTestUtil } from '../test-utils/integration-test.util';

export const fixtureFileToProjectsMap: Record<string, string[]> = {
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-plugin.ts')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-assertion.ts')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-resolver.ts')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/dummy-post-resolve.ts')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('custom-scripts/tsconfig.json')]: ['ALL-FILES'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/empty.txt')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-1.ts')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-A/project-a-2.ts')]: ['ALL-FILES', 'A'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/empty.txt')]: ['ALL-FILES', 'B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-B/project-b.ts')]: ['ALL-FILES', 'B'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/empty.txt')]: ['ALL-FILES', 'C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('project-C/project-c.ts')]: ['ALL-FILES', 'C'],
    [IntegrationTestUtil.getAbsoluteFilePathInTestProject('yanice.json')]: ['ALL-FILES']
};
