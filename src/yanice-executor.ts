import { ArgsParser, IYaniceArgs } from './config/args-parser';
import { ConfigParser, IYaniceCommand, IYaniceConfig } from './config/config-parser';
import { ConfigVerifier } from './config/config-verifier';
import { DirectedGraphUtil, IDirectedGraph } from './dep-graph/directed-graph';
import { ChangedFiles } from './git-diff/changed-files';
import { ChangedProjects } from './git-diff/changed-projects';
import { execucteInParallelLimited, ICommandExecutionResult } from './util/execute-in-parallel-limited';
import { FindFileUtil } from './util/find-file';
import { log } from './util/log';
import { LogUtil } from './util/log-util';
import { DepGraphVisualizationServer } from './visualization/dep-graph-visualization-server';
import { GraphDagreRenderer } from './visualization/graph-dagre-renderer';
import { GraphDotRenderer } from './visualization/graph-dot-renderer';

export class YaniceExecutor {
    private baseDirectory: string | null = null;
    private yaniceConfig: IYaniceConfig | null = null;
    private yaniceArgs: IYaniceArgs | null = null;
    private changedFiles: string[] = [];
    private changedProjects: string[] = [];
    private depGraph: IDirectedGraph | null = null;
    private affectedProjects: string[] = [];
    private affectedProjectsUnfiltered: string[] = [];
    private responsibles: string[] = [];

    public loadConfiguration(): YaniceExecutor {
        const yaniceConfigPath = FindFileUtil.findFileInParentDirs('yanice.json');
        if (!yaniceConfigPath) {
            this.exitYanice(1, 'yanice.json not found!');
            return this;
        }
        this.baseDirectory = yaniceConfigPath.replace(/yanice\.json/, '');
        const yaniceConfigJson = require(yaniceConfigPath);
        this.validateYaniceJson(yaniceConfigJson);
        this.yaniceConfig = ConfigParser.getConfigFromYaniceJson(yaniceConfigJson);
        return this;
    }

    public parseArgs(args: string[]): YaniceExecutor {
        if (!this.yaniceConfig) {
            return this;
        }
        this.verifyScopeParam(args, this.yaniceConfig);
        this.yaniceArgs = ArgsParser.parseArgs(args);
        return this;
    }

    public calculateChangedFiles(): YaniceExecutor {
        if (this.yaniceArgs) {
            if (this.yaniceArgs.diffTarget.branch || this.yaniceArgs.diffTarget.rev) {
                const commitSHA = ChangedFiles.gitCommandWithRevisionShaAsOutput(
                    `git rev-parse ${this.yaniceArgs.diffTarget.branch || this.yaniceArgs.diffTarget.rev}`
                );
                this.changedFiles = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(commitSHA, this.yaniceArgs.includeUncommitted);
            }
            if (this.yaniceArgs.diffTarget.commit && this.changedFiles.length === 0) {
                this.changedFiles = ChangedFiles.filesChangedBetweenHeadAndGivenCommit(
                    this.yaniceArgs.diffTarget.commit,
                    this.yaniceArgs.includeUncommitted
                );
            }
        }
        return this;
    }

    public calculateChangedProjects(): YaniceExecutor {
        if (this.changedFiles && this.yaniceConfig) {
            this.changedProjects = ChangedProjects.getChangedProjectsRaw(this.yaniceConfig.projects, this.changedFiles);
        }
        return this;
    }

    public calculateDepGraphForGivenScope(): YaniceExecutor {
        if (this.yaniceConfig && this.yaniceArgs) {
            this.depGraph = ConfigParser.getDepGraphFromConfigByScope(this.yaniceConfig, this.yaniceArgs.givenScope);
        }
        return this;
    }

    public verifyDepGraphValidity(): YaniceExecutor {
        if (!this.depGraph) {
            this.exitYanice(1, 'dep-graph cannot be constructed!');
            return this;
        }
        if (DirectedGraphUtil.hasCycle(this.depGraph)) {
            this.exitYanice(1, 'dependency graph must not contain a cycle!');
            return this;
        }
        return this;
    }

    public calculateAffectedProjects(): YaniceExecutor {
        if (this.depGraph && this.changedProjects && this.yaniceArgs && this.yaniceConfig) {
            if (!this.yaniceArgs.includeAllProjects) {
                const affected = DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(this.depGraph, this.changedProjects);
                this.affectedProjects = DirectedGraphUtil.sortTopologically(this.depGraph, affected);
            } else {
                this.affectedProjects = this.yaniceConfig.projects.map(project => project.projectName);
            }
        }
        this.affectedProjectsUnfiltered = this.affectedProjects;
        return this;
    }

    public filterOutUnsupportedProjectsIfNeeded(): YaniceExecutor {
        this.affectedProjects = this.affectedProjects.filter(projectName => {
            if (!this.yaniceArgs || !this.yaniceConfig) {
                return true;
            }
            return (
                (!this.yaniceArgs.includeCommandSupportedOnly && this.yaniceArgs.outputOnly) ||
                ConfigParser.supportsScopeCommand(this.yaniceConfig, projectName, this.yaniceArgs.givenScope)
            );
        });
        return this;
    }

    public calculateResponsibles(): YaniceExecutor {
        if (this.yaniceConfig && this.affectedProjects) {
            this.responsibles = this.yaniceConfig.projects
                .filter(project => this.affectedProjects.includes(project.projectName))
                .map(project => project.responsibles)
                .reduce((curr, prev) => curr.concat(prev), []);
        }
        return this;
    }

    public outputResponsiblesAndExitIfShowResponsiblesMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.outputResponsibles) {
            this.responsibles.forEach(responsible => log(responsible));
            this.exitYanice(0, null);
        }
        return this;
    }

    public outputAffectedAndExitIfOutputOnlyMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.outputOnly) {
            this.affectedProjects.forEach(projectName => log(projectName));
            this.exitYanice(0, null);
        }
        return this;
    }

    public visualizeDepGraphIfInVisualizationMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.visualizeDepGraph && this.depGraph && this.yaniceConfig) {
            switch (this.yaniceArgs.graphRenderer) {
                case 'DAGREJS':
                    DepGraphVisualizationServer.serveDagreGraph(
                        this.depGraph,
                        this.yaniceConfig,
                        this.yaniceArgs,
                        this.affectedProjectsUnfiltered,
                        this.changedFiles
                    );
                    break;
                case 'VIZJS':
                    DepGraphVisualizationServer.serveDotVizJsGraph(this.depGraph);
                    break;
            }
        }
        return this;
    }

    public executeCommands(): YaniceExecutor {
        // TODO Refactor: Make execution of commands/output-only/visualization independent. They should not be aware of each other.
        if (this.yaniceConfig && this.yaniceArgs && this.baseDirectory && !this.yaniceArgs.visualizeDepGraph) {
            const scope = this.yaniceArgs.givenScope;
            const commands: IYaniceCommand[] = this.yaniceConfig.projects
                .filter(project => this.affectedProjects.includes(project.projectName))
                .map(project => project.commands[scope]);

            execucteInParallelLimited(
                commands,
                this.yaniceArgs.concurrency,
                this.baseDirectory,
                (command, dir) => {
                    return;
                },
                (command, commandExecutionResult: ICommandExecutionResult) => {
                    if (commandExecutionResult.exitCode === 0) {
                        LogUtil.printCommandSuccess(command);
                    } else {
                        LogUtil.printCommandFailure(command);
                    }
                },
                (commandsExecutionResults: ICommandExecutionResult[]) => {
                    if (this.yaniceConfig) {
                        LogUtil.printOutputFormattedAfterAllCommandsCompleted(this.yaniceConfig, commandsExecutionResults);
                    }
                    if (commandsExecutionResults.some(result => result.exitCode !== 0)) {
                        this.exitYanice(1, null);
                    }
                }
            );
        }
        return this;
    }

    private verifyScopeParam(args: string[], yaniceConfig: IYaniceConfig): void {
        const scopeParam: string | undefined = args[0];
        const scopes = Object.keys(yaniceConfig.dependencyScopes);
        if (!scopeParam) {
            this.exitYanice(
                1,
                `No scope was provided! Please select one of the following scopes as first input parameter: ${scopes.join(', ')}`
            );
        }
        if (!scopes.includes(scopeParam)) {
            this.exitYanice(
                1,
                `"${scopeParam}" is not a defined scope! Please select one of the following scopes as first input parameter: ${scopes.join(
                    ', '
                )}`
            );
        }
    }

    private validateYaniceJson(yaniceConfigJson: any): void {
        if (!ConfigVerifier.verifyYaniceJsonWithSchema(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyYaniceJsonWithSchemaFailure(yaniceConfigJson);
            this.exitYanice(1, 'yanice.json does not conform to json-schema, please make sure your yanice.json is valid!');
        }
        if (!ConfigVerifier.verifyDependencyScopeProjectNames(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfigJson);
            this.exitYanice(
                1,
                'yanice.json contains projectNames under dependencyScopes that are not defined as projects! Make sure your dependency trees are defined correctly.'
            );
        }
    }

    private exitYanice(exitCode: number, message: string | null): void {
        if (message) {
            log(message);
        }
        process.exit(exitCode);
        return;
    }
}
