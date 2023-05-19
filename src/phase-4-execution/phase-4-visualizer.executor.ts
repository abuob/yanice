import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { AbstractPhase4Executor } from './phase-4.executor';
import { DepGraphVisualization } from './visualization/dep-graph-visualization';

export class Phase4VisualizerExecutor extends AbstractPhase4Executor {
    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result): void {
        new Phase4VisualizerExecutor(phase3Result).visualizeDepGraphIfInVisualizationMode();
    }

    public visualizeDepGraphIfInVisualizationMode(): void {
        const yaniceArgs = this.phase3Result.phase2Result.phase1Result.yaniceArgs;
        const depGraph = this.phase3Result.phase2Result.phase1Result.depGraph;
        const yaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const baseDirectory = this.phase3Result.phase2Result.phase1Result.baseDirectory;
        const changedFiles = this.phase3Result.phase2Result.changedFiles;
        const affectedProjectsUnfiltered = this.phase3Result.affectedProjectsUnfiltered;

        const html: string = DepGraphVisualization.createVisualizationHtml(
            depGraph,
            yaniceConfig,
            yaniceArgs,
            affectedProjectsUnfiltered,
            changedFiles
        );
        if (yaniceArgs.visualizeDepGraph) {
            DepGraphVisualization.startServer(html, yaniceConfig.options.port);
        } else {
            DepGraphVisualization.saveTemplateFile(
                baseDirectory,
                yaniceConfig.options.outputFolder,
                `dependency-graph.${yaniceArgs.givenScope}.html`,
                html
            );
        }
    }
}
