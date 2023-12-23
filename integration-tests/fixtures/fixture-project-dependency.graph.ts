export const fixtureProjectDependencyGraph: Record<string, string[]> = {
    'ALL-FILES': ['B', 'A', 'C'],
    A: ['ALL-FILES', 'B'],
    B: ['ALL-FILES', 'C'],
    C: []
};
