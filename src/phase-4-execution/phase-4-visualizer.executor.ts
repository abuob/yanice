import { YaniceCliArgsVisualize } from '../phase-1-config/args-parser/cli-args.interface';
import { YaniceConfig } from '../phase-1-config/config/config.interface';
import { DirectedGraph } from '../phase-1-config/directed-graph/directed-graph';
import { Phase3Result } from '../phase-3-project-changes/phase-3.result.type';
import { AbstractPhase4Executor } from './phase-4.executor';
import { DepGraphVisualization } from './visualization/dep-graph-visualization';

export class Phase4VisualizerExecutor extends AbstractPhase4Executor {
    constructor(phase3Result: Phase3Result) {
        super(phase3Result);
    }

    public static execute(phase3Result: Phase3Result, yaniceVisualizeArgs: YaniceCliArgsVisualize): void {
        new Phase4VisualizerExecutor(phase3Result).visualizeDepGraphIfInVisualizationMode(yaniceVisualizeArgs);
    }

    public visualizeDepGraphIfInVisualizationMode(yaniceVisualizeArgs: YaniceCliArgsVisualize): void {
        const depGraph: DirectedGraph = this.phase3Result.phase2Result.phase1Result.depGraph;
        const yaniceConfig: YaniceConfig = this.phase3Result.phase2Result.phase1Result.yaniceConfig;
        const yaniceJsonDirectoryPath: string = this.phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath;
        const changedFiles: string[] = this.phase3Result.phase2Result.changedFiles;
        const affectedProjectsUnfiltered: string[] = this.phase3Result.affectedProjectsUnfiltered;

        const html: string = DepGraphVisualization.createVisualizationHtml(
            yaniceJsonDirectoryPath,
            depGraph,
            yaniceConfig,
            yaniceVisualizeArgs,
            affectedProjectsUnfiltered,
            changedFiles
        );
        if (!yaniceVisualizeArgs.saveVisualization) {
            DepGraphVisualization.startServer(html, yaniceConfig.options.port);
        } else {
            DepGraphVisualization.saveTemplateFile(
                yaniceJsonDirectoryPath,
                yaniceConfig.options.outputFolder,
                `dependency-graph.${yaniceVisualizeArgs.defaultArgs.scope}.html`,
                html
            );
        }
    }
}
