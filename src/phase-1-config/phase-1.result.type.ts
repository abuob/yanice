import { YaniceConfig } from './config/config.interface';
import { DirectedGraph } from './directed-graph/directed-graph';
import { YaniceCliArgs } from './args-parser/cli-args.interface';

export interface Phase1Result {
    yaniceJsonDirectoryPath: string;
    gitRepoRootPath: string;
    yaniceConfig: YaniceConfig;
    yaniceCliArgs: YaniceCliArgs;
    depGraph: DirectedGraph;
}
