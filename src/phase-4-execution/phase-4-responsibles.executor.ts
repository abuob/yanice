import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { log } from '../util/log';
import { AbstractPhase4Executor } from './phase-4.executor';

export class Phase4ResponsiblesExecutor extends AbstractPhase4Executor {
    private responsibles: string[] = [];

    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result): void {
        new Phase4ResponsiblesExecutor(phase3Result).calculateResponsibles().outputResponsiblesAndExitIfShowResponsiblesMode();
    }

    public calculateResponsibles(): Phase4ResponsiblesExecutor {
        const yaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const affectedProjectsUnfiltered: string[] = this.phase3Result.affectedProjectsUnfiltered;
        this.responsibles = yaniceConfig.projects
            .filter((project) => affectedProjectsUnfiltered.includes(project.projectName))
            .map((project) => project.responsibles)
            .reduce((prev, curr) => prev.concat(curr), [])
            .reduce((prev: string[], curr: string): string[] => (prev.includes(curr) ? prev : prev.concat(curr)), []);
        return this;
    }

    public outputResponsiblesAndExitIfShowResponsiblesMode(): void {
        const yaniceArgs = this.phase3Result.phase2Result.phase1Result.yaniceArgs;
        if (!yaniceArgs.outputResponsibles) {
            return;
        }
        this.responsibles.forEach((responsible: string) => log(responsible));
        this.exitYanice(0, null);
    }
}
