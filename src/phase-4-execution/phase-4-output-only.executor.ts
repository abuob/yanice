import { YaniceCliArgsOutputOnly } from '../phase-1-config/args-parser/cli-args.interface';
import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { log } from '../util/log';
import { AbstractPhase4Executor } from './phase-4.executor';

export class Phase4OutputOnlyExecutor extends AbstractPhase4Executor {
    private responsibles: string[] = [];

    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result, yaniceOutputOnlyArgs: YaniceCliArgsOutputOnly): void {
        if (yaniceOutputOnlyArgs.isResponsiblesMode) {
            new Phase4OutputOnlyExecutor(phase3Result).calculateResponsibles().outputResponsiblesAndExitIfShowResponsiblesMode();
        } else {
            new Phase4OutputOnlyExecutor(phase3Result).outputAffectedAndExitIfOutputOnlyMode();
        }
    }

    public outputAffectedAndExitIfOutputOnlyMode(): void {
        const affectedProjects = this.phase3Result.affectedProjects;
        affectedProjects.forEach((projectName: string) => log(projectName));
        this.exitYanice(0, null);
    }

    public calculateResponsibles(): Phase4OutputOnlyExecutor {
        const yaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const affectedProjectsUnfiltered: string[] = this.phase3Result.affectedProjectsUnfiltered;
        this.responsibles = yaniceConfig.projects
            .filter((project) => affectedProjectsUnfiltered.includes(project.projectName))
            .map((project) => project.responsibles)
            .reduce((prev: string[], curr: string[]) => prev.concat(curr), [])
            .reduce((prev: string[], curr: string): string[] => (prev.includes(curr) ? prev : prev.concat(curr)), []);
        return this;
    }

    public outputResponsiblesAndExitIfShowResponsiblesMode(): void {
        this.responsibles.forEach((responsible: string) => log(responsible));
        this.exitYanice(0, null);
    }
}
