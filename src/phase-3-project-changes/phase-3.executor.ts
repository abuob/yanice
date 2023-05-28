import { PhaseExecutor } from '../util/phase-executor';
import { Phase3Result } from './phase-3.result.type';
import { Phase2Result } from '../phase-2-file-changes/phase-2.result.type';
import { ChangedProjects } from './changed-projects';
import { DirectedGraph, DirectedGraphUtil } from '../phase-1-config/directed-graph/directed-graph';
import { ConfigParser } from '../phase-1-config/config/config-parser';
import { YaniceConfig } from '../phase-1-config/config/config.interface';

export class Phase3Executor extends PhaseExecutor {
    private changedProjects: string[] = [];
    private affectedProjects: string[] = [];
    private affectedProjectsUnfiltered: string[] = [];

    constructor(private readonly phase2Result: Phase2Result) {
        super();
    }

    public static execute(phase2Result: Phase2Result): Phase3Result {
        return new Phase3Executor(phase2Result)
            .calculateChangedProjects()
            .calculateAffectedProjectsUnfiltered()
            .filterOutUnsupportedProjectsIfNeeded()
            .createPhaseResult();
    }

    private createPhaseResult(): Phase3Result {
        return {
            phase2Result: this.phase2Result,
            changedProjects: this.changedProjects,
            affectedProjects: this.affectedProjects,
            affectedProjectsUnfiltered: this.affectedProjectsUnfiltered
        };
    }

    private calculateChangedProjects(): Phase3Executor {
        if (!this.phase2Result) {
            return this;
        }
        const yaniceConfig: YaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
        this.changedProjects = ChangedProjects.getChangedProjectsRaw(yaniceConfig.projects, this.phase2Result.changedFiles);
        return this;
    }

    private calculateAffectedProjectsUnfiltered(): Phase3Executor {
        if (!this.phase2Result) {
            return this;
        }
        if (this.changedProjects) {
            const depGraph: DirectedGraph = this.phase2Result.phase1Result.depGraph;
            const yaniceConfig: YaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
            const includeAllProjects: boolean = this.phase2Result.phase1Result.yaniceCliArgs.defaultArgs.includeAllProjects;
            if (!includeAllProjects) {
                const affected: string[] = DirectedGraphUtil.getAncestorsAndSelfOfMultipleNodes(depGraph, this.changedProjects);
                this.affectedProjectsUnfiltered = DirectedGraphUtil.getTopologicallySortedReverse(depGraph, affected);
            } else {
                this.affectedProjectsUnfiltered = yaniceConfig.projects.map((project) => project.projectName);
            }
        }
        return this;
    }

    private filterOutUnsupportedProjectsIfNeeded(): Phase3Executor {
        if (!this.phase2Result) {
            return this;
        }
        const yaniceConfig: YaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
        const yaniceCliArgs = this.phase2Result.phase1Result.yaniceCliArgs;
        const scope: string | null = yaniceCliArgs.defaultArgs.scope;
        const includeUnfiltered: boolean = yaniceCliArgs.type === 'output-only' && yaniceCliArgs.includeFiltered;
        if (includeUnfiltered) {
            this.affectedProjects = this.affectedProjectsUnfiltered;
        } else {
            this.affectedProjects = this.affectedProjectsUnfiltered.filter((projectName: string) => {
                return ConfigParser.supportsScopeCommand(yaniceConfig, projectName, scope);
            });
        }
        return this;
    }
}
