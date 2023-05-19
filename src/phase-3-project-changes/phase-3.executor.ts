import { PhaseExecutor } from '../util/phase-executor';
import { Phase3Result } from './phase-3.result.type';
import { Phase2Result } from '../phase-2-file-changes/phase-2.result.type';
import { ChangedProjects } from './changed-projects';
import { DirectedGraphUtil } from '../phase-1-config/directed-graph/directed-graph';
import { ConfigParser } from '../phase-1-config/config/config-parser';

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
        const yaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
        this.changedProjects = ChangedProjects.getChangedProjectsRaw(yaniceConfig.projects, this.phase2Result.changedFiles);
        return this;
    }

    private calculateAffectedProjectsUnfiltered(): Phase3Executor {
        if (!this.phase2Result) {
            return this;
        }
        if (this.changedProjects) {
            const depGraph = this.phase2Result.phase1Result.depGraph;
            const yaniceArgs = this.phase2Result.phase1Result.yaniceArgs;
            const yaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
            if (!yaniceArgs.includeAllProjects) {
                const affected = DirectedGraphUtil.getAncestorsAndSelfOfMultipleNodes(depGraph, this.changedProjects);
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
        const yaniceArgs = this.phase2Result.phase1Result.yaniceArgs;
        const yaniceConfig = this.phase2Result.phase1Result.yaniceConfig;
        this.affectedProjects = this.affectedProjectsUnfiltered.filter((projectName) => {
            if (!yaniceArgs || !yaniceConfig) {
                return true;
            }
            return (
                (!yaniceArgs.includeCommandSupportedOnly && yaniceArgs.outputOnly) ||
                ConfigParser.supportsScopeCommand(yaniceConfig, projectName, yaniceArgs.givenScope)
            );
        });
        return this;
    }
}
