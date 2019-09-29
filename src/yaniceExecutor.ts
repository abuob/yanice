import { ArgsParser, IYaniceArgs } from './config/args-parser';
import { ConfigParser, IYaniceConfig } from './config/config-parser';
import { DirectedGraphUtil, IDirectedGraph } from './dep-graph/directed-graph';
import { ChangedFiles } from './git-diff/changed-files';
import { ChangedProjects } from './git-diff/changed-projects';
import { FindFileUtil } from './util/find-file';
import { log } from './util/log';

export class YaniceExecutor {
    private yaniceConfig: IYaniceConfig | null = null;
    private yaniceArgs: IYaniceArgs | null = null;
    private changedFiles: string[] = [];
    private changedProjects: string[] = [];
    private depGraph: IDirectedGraph | null = null;
    private affectedProjects: string[] = [];

    public loadConfiguration(): YaniceExecutor {
        const yaniceConfigPath = FindFileUtil.findFileInParentDirs('yanice.json');
        if (!yaniceConfigPath) {
            this.exitYanice(1, 'yanice.json not found!');
            return this;
        }
        const yaniceConfigJson = require(yaniceConfigPath);
        // TODO Verify jsonschema of yaniceConfigJson
        this.yaniceConfig = ConfigParser.getConfigFromYaniceJson(yaniceConfigJson);
        return this;
    }

    public parseArgs(args: string[]): YaniceExecutor {
        this.yaniceArgs = ArgsParser.parseArgs(process.argv.slice(2));
        return this;
    }

    public outputAndExitIfIncludeAllProjects(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceConfig && this.yaniceArgs.includeAllProjects) {
            this.yaniceConfig.projects.forEach(project => log(project.projectName));
            this.exitYanice(0, null);
        }
        return this;
    }

    public calculateChangedFiles(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.diffTarget.branch) {
            this.changedFiles = ChangedFiles.filesChangedBetweenCurrentAndGivenBranch(
                this.yaniceArgs.diffTarget.branch,
                this.yaniceArgs.includeUncommitted
            );
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
        if (this.depGraph && this.changedProjects) {
            const affected = DirectedGraphUtil.getTransitiveChildrenNamesIncludingAncestors(this.depGraph, this.changedProjects);
            this.affectedProjects = DirectedGraphUtil.sortTopologically(this.depGraph, affected);
        }
        return this;
    }

    public filterOutUnsupportedProjectsIfNeeded(): YaniceExecutor {
        this.affectedProjects = this.affectedProjects.filter(projectName => {
            if (!this.yaniceArgs || !this.yaniceConfig) {
                return true;
            }
            return (
                !this.yaniceArgs.includeCommandSupportedOnly ||
                ConfigParser.supportsScopeCommand(this.yaniceConfig, projectName, this.yaniceArgs.givenScope)
            );
        });
        return this;
    }

    public outputAffectedAndExitIfOutputOnlyMode(): YaniceExecutor {
        if (this.yaniceArgs && this.yaniceArgs.outputOnly) {
            this.affectedProjects.forEach(projectName => log(projectName));
            this.exitYanice(0, null);
        }
        return this;
    }

    public executeCommands(): YaniceExecutor {
        // TODO Implenent this! For the time being, just output as if outputOnly=true.
        if (this.yaniceArgs) {
            this.affectedProjects.forEach(projectName => log(projectName));
            this.exitYanice(0, null);
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
