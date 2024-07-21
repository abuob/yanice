import { expect } from 'chai';

import yaniceJson2 from '../../../__fixtures/valid-2.yanice.json';
import yaniceJson3 from '../../../__fixtures/valid-3.yanice.json';
import { YaniceCliArgs, YaniceCliArgsRun } from '../../args-parser/cli-args.interface';
import { DirectedGraph, DirectedGraphUtil } from '../../directed-graph/directed-graph';
import { ConfigParser } from '../config-parser';

describe('ConfigParser', () => {
    const yaniceCliArgs: YaniceCliArgs = {
        type: 'run',
        concurrency: 1,
        outputMode: null,
        defaultArgs: {
            scope: 'lint',
            diffTarget: null,
            includeAllProjects: false,
            includeUncommitted: false,
            isPerformanceLoggingEnabled: false
        }
    };

    describe('getYaniceConfig', () => {
        it('should set the options to default values if none are specified', () => {
            const actualConfigForLint = ConfigParser.getYaniceConfig(
                yaniceJson2 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'lint')
            );
            expect(actualConfigForLint.options.outputFilters).to.have.same.members([]);
            expect(actualConfigForLint.options.commandOutput).to.equal('ignore');
            expect(actualConfigForLint.options.outputFolder).to.equal('./.yanice-output');
            expect(actualConfigForLint.options.port).to.equal(4567);
        });

        it('should override default options with global options when defined in yanice.json', () => {
            const actualConfigForBuild = ConfigParser.getYaniceConfig(
                yaniceJson3 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'build-some')
            );
            expect(actualConfigForBuild.options.outputFilters).to.have.same.members(['npmError']);
            expect(actualConfigForBuild.options.commandOutput).to.equal('append-at-end');
            expect(actualConfigForBuild.options.outputFolder).to.equal('./.yanice-graph-output');
            expect(actualConfigForBuild.options.port).to.equal(7777);
        });

        it('should override global options with options defined on scope-level', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson3 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'test')
            );
            expect(actualConfigForTest.options.commandOutput).to.equal('append-at-end-on-error');
            expect(actualConfigForTest.options.port).to.equal(8888);
        });

        it('should override scope options if they are overridden via cli-arguments', () => {
            const runArgs: YaniceCliArgsRun = {
                type: 'run',
                outputMode: 'ignore',
                defaultArgs: yaniceCliArgs.defaultArgs,
                concurrency: 1
            };
            const actualConfigForTest = ConfigParser.getYaniceConfig(yaniceJson3 as any, runArgs);
            expect(actualConfigForTest.options.commandOutput).to.equal('ignore');
        });

        it('should have empty dependencies if there are none listed (treat empty array same as undefined; except defaultDependencies)', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson3 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'empty-deps')
            );
            expect(actualConfigForTest.dependencies).to.deep.equal({
                'project-A': [],
                'project-B': [],
                'lib-1': [],
                'lib-2': []
            });
        });

        it('should add the defaultDependencies where no dependencies are defined', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson2 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'scope-3')
            );
            expect(actualConfigForTest.dependencies).to.deep.equal({
                A: [],
                B: ['C'],
                C: ['A', 'D'],
                D: ['A'],
                E: ['A']
            });
        });

        it('should add the defaultDependencies where no dependencies are defined, and not introduce cycles', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson2 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'scope-4')
            );
            expect(actualConfigForTest.dependencies).to.deep.equal({
                A: [],
                B: [],
                C: ['A', 'B'],
                D: ['A', 'B'],
                E: ['A', 'B']
            });
        });

        it('should add the defaultDependencies and not introduce cycles', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson2 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'scope-5')
            );
            expect(actualConfigForTest.dependencies).to.deep.equal({
                A: [],
                B: ['C'],
                C: ['A', 'D'],
                D: ['A', 'B'],
                E: ['A', 'B']
            });
        });

        it('should load the dependencies of the scope which is extended', () => {
            const actualConfigForTest = ConfigParser.getYaniceConfig(
                yaniceJson3 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'extended-scope')
            );
            expect(actualConfigForTest.dependencies).to.deep.equal({
                'lib-1': ['lib-2'],
                'lib-2': [],
                'project-A': ['lib-1'],
                'project-B': ['lib-2']
            });
        });

        it('should properly map commands-cwd', () => {
            const yaniceConfig = ConfigParser.getYaniceConfig(yaniceJson2, yaniceCliArgs);
            const yaniceProject1 = yaniceConfig.projects.find((project) => project.projectName === 'A');
            const yaniceProject2 = yaniceConfig.projects.find((project) => project.projectName === 'B');
            expect(yaniceProject1?.commands.lint).to.deep.equal({
                commands: ['lint A1', 'lint A2'],
                cwd: 'path/to/dir/A'
            });
            expect(yaniceProject1?.commands.test).to.equal(undefined);
            expect(yaniceProject1?.commands).to.have.same.keys('lint');
            expect(yaniceProject2?.commands.lint).to.deep.equal({
                commands: ['lint B'],
                cwd: './'
            });
        });

        it('should properly read plugin options', () => {
            const actualConfigForBuild = ConfigParser.getYaniceConfig(
                yaniceJson3 as any,
                createYaniceCliArgsWithScope(yaniceCliArgs, 'build-some')
            );
            const expected = {
                scriptLocation: './dummy-plugin.js'
            };
            expect(actualConfigForBuild.plugins.custom['dummy-plugin']).to.deep.equal(expected);
        });
    });

    describe('getDepGraphFromConfig', () => {
        it('should properly create a directed graph when there are no dependencies', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson2, createYaniceCliArgsWithScope(yaniceCliArgs, 'lint'))
            );
            const actualNodeNames: string[] = Array.from(actualGraph?.nodes ?? []).map((n) => n.name);
            expect(actualNodeNames).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
        });

        it('should properly create a directed graph with some dependencies', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson3 as any, createYaniceCliArgsWithScope(yaniceCliArgs, 'test'))
            );
            expect(actualGraph).to.not.equal(null);
            expect(getChildrenOf(actualGraph, 'project-A')).to.have.same.members(['lib-1']);
            expect(getChildrenOf(actualGraph, 'lib-1')).to.have.same.members([]);
            expect(getParentsOf(actualGraph, 'project-A')).to.have.same.members([]);
            expect(getParentsOf(actualGraph, 'lib-1')).to.have.same.members(['project-A']);
        });

        it('should properly create a directed graph when given a scope-definition', () => {
            const actualGraphForTestScope = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson2, createYaniceCliArgsWithScope(yaniceCliArgs, 'test'))
            );
            expect(actualGraphForTestScope).to.not.equal(null);
            expect(getChildrenOf(actualGraphForTestScope, 'A')).to.have.same.members(['B', 'C']);
            expect(getChildrenOf(actualGraphForTestScope, 'B')).to.have.same.members(['D']);
            expect(getChildrenOf(actualGraphForTestScope, 'C')).to.have.same.members(['D']);
            expect(getChildrenOf(actualGraphForTestScope, 'D')).to.have.same.members(['E']);
            expect(getChildrenOf(actualGraphForTestScope, 'E')).to.have.same.members([]);
        });

        it('should properly create a directed graph even when given a scope-definition containing an illegal cycle', () => {
            const actualGraphForIllegalCycleScope = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson2, createYaniceCliArgsWithScope(yaniceCliArgs, 'illegalCycle'))
            );
            expect(actualGraphForIllegalCycleScope).to.not.equal(null);
            expect(getChildrenOf(actualGraphForIllegalCycleScope, 'A')).to.have.same.members(['B']);
            expect(getChildrenOf(actualGraphForIllegalCycleScope, 'B')).to.have.same.members(['C']);
            expect(getChildrenOf(actualGraphForIllegalCycleScope, 'C')).to.have.same.members(['D']);
            expect(getChildrenOf(actualGraphForIllegalCycleScope, 'D')).to.have.same.members(['E']);
            expect(getChildrenOf(actualGraphForIllegalCycleScope, 'E')).to.have.same.members(['A']);
            expect(DirectedGraphUtil.hasCycle(actualGraphForIllegalCycleScope!)).to.equal(true);
        });

        it('should create nodes for projects even if they are not explicitly listed in the dependency scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson3 as any, createYaniceCliArgsWithScope(yaniceCliArgs, 'build-some'))
            );
            expect(getAllNodeNames(actualGraph)).to.have.same.members(['project-A', 'project-B', 'lib-1', 'lib-2']);
            expect(getChildrenOf(actualGraph, 'project-A')).to.have.same.members(['lib-1']);
            expect(getChildrenOf(actualGraph, 'project-B')).to.have.same.members(['lib-2']);
            expect(getChildrenOf(actualGraph, 'lib-1')).to.have.same.members([]);
            expect(getChildrenOf(actualGraph, 'lib-2')).to.have.same.members([]);
        });

        it('should create the graph for a scope which extends another scope', () => {
            const actualGraph = ConfigParser.getDepGraphFromConfig(
                ConfigParser.getYaniceConfig(yaniceJson2 as any, createYaniceCliArgsWithScope(yaniceCliArgs, 'scope-2'))
            );
            expect(getAllNodeNames(actualGraph)).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
            expect(getChildrenOf(actualGraph, 'A')).to.have.same.members(['B', 'C']);
            expect(getChildrenOf(actualGraph, 'B')).to.have.same.members(['C']);
            expect(getChildrenOf(actualGraph, 'C')).to.have.same.members(['D']);
            expect(getChildrenOf(actualGraph, 'D')).to.have.same.members([]);
            expect(getChildrenOf(actualGraph, 'E')).to.have.same.members([]);
        });
    });
});

function getAllNodeNames(graph: DirectedGraph | null): string[] {
    return graph ? Array.from(graph.nodes).map((n) => n.name) : [];
}

function getParentsOf(graph: DirectedGraph | null, projectName: string): string[] {
    if (!graph) {
        return [];
    }
    const node = Array.from(graph.nodes).find((n) => n.name === projectName);
    return node ? node.getParents().map((n) => n.name) : [];
}

function getChildrenOf(graph: DirectedGraph | null, projectName: string): string[] {
    if (!graph) {
        return [];
    }
    const node = Array.from(graph.nodes).find((n) => n.name === projectName);
    return node ? node.getChildren().map((n) => n.name) : [];
}

function createYaniceCliArgsWithScope(yaniceCliArgs: YaniceCliArgs, scope: string): YaniceCliArgs {
    return {
        ...yaniceCliArgs,
        defaultArgs: {
            ...yaniceCliArgs.defaultArgs,
            scope
        }
    };
}
