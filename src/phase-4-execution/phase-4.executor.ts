import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { PhaseExecutor } from '../util/phase-executor';

export abstract class AbstractPhase4Executor extends PhaseExecutor {
    constructor(protected readonly phase3Result: Phase3Result) {
        super();
    }
}
