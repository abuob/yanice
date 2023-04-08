import { ArgsParser, YaniceArgs } from './config/args-parser';
import { ConfigParser } from './config/config-parser';
import { ConfigVerifier } from './config/config-verifier';
import { YaniceCommand, YaniceConfig, YaniceJsonType, YaniceProject } from './config/config.interface';
import { DirectedGraphUtil, DirectedGraph } from './directed-graph/directed-graph';
import { ChangedFiles } from './git-diff/changed-files';
import { ChangedProjects } from './git-diff/changed-projects';
import { execucteInParallelLimited, ICommandExecutionResult, ParallelExecutionCommand } from './util/execute-in-parallel-limited';
import { log } from './util/log';
import { LogUtil } from './util/log-util';
import { DepGraphVisualization } from './visualization/dep-graph-visualization';

export class YaniceExecutor {
    private baseDirectory: string | null = null;
    private yaniceJson: YaniceJsonType | null = null;
    private yaniceConfig: YaniceConfig | null = null;
    private yaniceArgs: YaniceArgs | null = null;
    private changedFiles: string[] = [];
    private changedProjects: string[] = [];
    private depGraph: DirectedGraph | null = null;
    private affectedProjects: string[] = [];
    private affectedProjectsUnfiltered: string[] = [];
    private responsibles: string[] = [];

    public loadConfigAndParseArgs(args: string[], baseDirectory: string, yaniceJson: YaniceJsonType): YaniceExecutor {
        this.baseDirectory = baseDirectory;
        this.yaniceJson = yaniceJson;
        return this.validateYaniceJson(yaniceJson).parseArgs(args).verifyArgs().parseYaniceJson();
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
        if (this.yaniceConfig) {
            this.depGraph = ConfigParser.getDepGraphFromConfig(this.yaniceConfig);
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

    public calculateAffectedProjectsUnfiltered(): YaniceExecutor {
        if (this.depGraph && this.changedProjects && this.yaniceArgs && this.yaniceConfig) {
            if (!this.yaniceArgs.includeAllProjects) {
                const affected = DirectedGraphUtil.getAncestorsAndSelfOfMultipleNodes(this.depGraph, this.changedProjects);
                this.affectedProjectsUnfiltered = DirectedGraphUtil.getTopologicallySortedReverse(this.depGraph, affected);
            } else {
                this.affectedProjectsUnfiltered = this.yaniceConfig.projects.map((project) => project.projectName);
            }
        }
        return this;
    }

    public filterOutUnsupportedProjectsIfNeeded(): YaniceExecutor {
        this.affectedProjects = this.affectedProjectsUnfiltered.filter((projectName) => {
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
                .filter((project) => this.affectedProjectsUnfiltered.includes(project.projectName))
                .map((project) => project.responsibles)
                .reduce((prev, curr) => prev.concat(curr), [])
                .reduce((prev: string[], curr: string): string[] => (prev.includes(curr) ? prev : prev.concat(curr)), []);
        }
        return this;
    }

    public outputResponsiblesAndExitIfShowResponsiblesMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.outputResponsibles) {
            this.responsibles.forEach((responsible) => log(responsible));
            this.exitYanice(0, null);
        }
        return this;
    }

    public outputAffectedAndExitIfOutputOnlyMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.outputOnly) {
            this.affectedProjects.forEach((projectName) => log(projectName));
            this.exitYanice(0, null);
        }
        return this;
    }

    public visualizeDepGraphIfInVisualizationMode(): YaniceExecutor {
        if (
            this.yaniceArgs &&
            (this.yaniceArgs.visualizeDepGraph || this.yaniceArgs.saveDepGraphVisualization) &&
            this.depGraph &&
            this.yaniceConfig &&
            this.baseDirectory
        ) {
            const html: string = DepGraphVisualization.createVisualizationHtml(
                this.depGraph,
                this.yaniceConfig,
                this.yaniceArgs,
                this.affectedProjectsUnfiltered,
                this.changedFiles
            );
            if (this.yaniceArgs.visualizeDepGraph) {
                DepGraphVisualization.startServer(html, this.yaniceConfig.options.port);
            } else {
                DepGraphVisualization.saveTemplateFile(
                    this.baseDirectory,
                    this.yaniceConfig.options.outputFolder,
                    `dependency-graph.${this.yaniceArgs.givenScope}.html`,
                    html
                );
            }
        }
        return this;
    }

    public executeCommands(): YaniceExecutor {
        // TODO Refactor: Make execution of commands/output-only/visualization independent. They should not be aware of each other.
        if (
            this.yaniceConfig &&
            this.yaniceArgs &&
            this.baseDirectory &&
            !(this.yaniceArgs.visualizeDepGraph || this.yaniceArgs.saveDepGraphVisualization)
        ) {
            const scope: string = this.yaniceArgs.givenScope;
            const parallelExecutionCommands: ParallelExecutionCommand[] = this.yaniceConfig.projects
                .filter((project: YaniceProject) => this.affectedProjects.includes(project.projectName))
                .map((project: YaniceProject) => project.commands[scope])
                .reduce((prev: ParallelExecutionCommand[], curr: YaniceCommand): ParallelExecutionCommand[] => {
                    const commands: ParallelExecutionCommand[] = curr.commands.map(
                        (command: string): ParallelExecutionCommand => ({ command, cwd: curr.cwd })
                    );
                    return prev.concat(commands);
                }, []);

            execucteInParallelLimited(
                parallelExecutionCommands,
                this.yaniceArgs.concurrency,
                this.baseDirectory,
                (_command: ParallelExecutionCommand, _dir: string) => {
                    return;
                },
                (command: ParallelExecutionCommand, commandExecutionResult: ICommandExecutionResult) => {
                    if (commandExecutionResult.exitCode === 0) {
                        LogUtil.printCommandSuccess(command, commandExecutionResult);
                    } else {
                        LogUtil.printCommandFailure(command, commandExecutionResult);
                    }
                },
                (commandsExecutionResults: ICommandExecutionResult[]) => {
                    if (this.yaniceConfig) {
                        LogUtil.printOutputFormattedAfterAllCommandsCompleted(this.yaniceConfig, commandsExecutionResults);
                    }
                    if (commandsExecutionResults.some((result: ICommandExecutionResult) => result.exitCode !== 0)) {
                        this.exitYanice(1, null);
                    }
                }
            );
        }
        return this;
    }

    private loadYaniceJson(yaniceJson: YaniceJsonType): YaniceExecutor {
        this.yaniceJson = yaniceJson;
        this.validateYaniceJson(this.yaniceJson);
        return this;
    }

    private parseArgs(args: string[]): YaniceExecutor {
        this.yaniceArgs = ArgsParser.parseArgs(args);
        ArgsParser.verifyDiffTargetPresence(this.yaniceArgs);
        return this;
    }

    private verifyArgs(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceJson) {
            this.verifyScopeParam(this.yaniceArgs.givenScope, this.yaniceJson);
        }
        return this;
    }

    private parseYaniceJson(): YaniceExecutor {
        if (this.yaniceJson && this.yaniceArgs) {
            this.yaniceConfig = ConfigParser.getYaniceConfig(this.yaniceJson, this.yaniceArgs);
        }
        return this;
    }

    private verifyScopeParam(scopeParam: string, yaniceJson: YaniceJsonType): void {
        const scopes = Object.keys(yaniceJson.dependencyScopes);
        if (!scopeParam) {
            this.exitYanice(
                1,
                `No scope was provided! Please select one of the following scopes as first input parameter: ${scopes.join(', ')}`
            );
        }
        if (!scopes.includes(scopeParam)) {
            this.exitYanice(
                1,
                `"${scopeParam}" is not a defined scope in the yanice.json! Please select one of the following scopes as first input parameter: ${scopes.join(
                    ', '
                )}`
            );
        }
    }

    private validateYaniceJson(yaniceConfigJson: any): YaniceExecutor {
        if (!ConfigVerifier.verifyYaniceJsonWithSchema(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyYaniceJsonWithSchemaFailure(yaniceConfigJson);
            this.exitYanice(1, 'yanice.json does not conform to json-schema, please make sure your yanice.json is valid!');
        }
        if (!ConfigVerifier.verifySchemaVersion(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifySchemaVersionFailure(yaniceConfigJson);
            this.exitYanice(1, null);
        }
        if (!ConfigVerifier.verifyDependencyScopeProjectNames(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfigJson);
            this.exitYanice(
                1,
                'yanice.json contains projectNames under dependencyScopes that are not defined as projects! Make sure your dependency trees are defined correctly.'
            );
        }
        if (!ConfigVerifier.verifyMaxOneLevelGraphExtension(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyMaxOneLevelGraphExtension(yaniceConfigJson);
            this.exitYanice(1, null);
        }
        return this;
    }

    private exitYanice(exitCode: number, message: string | null): void {
        if (message) {
            log(message);
        }
        process.exit(exitCode);
        return;
    }
}
