import { YaniceConfig } from './config/config.interface';
import { YaniceArgs } from './config/args-parser';
import { DirectedGraph } from './directed-graph/directed-graph';

export interface Phase1Result {
    baseDirectory: string;
    yaniceConfig: YaniceConfig;
    yaniceArgs: YaniceArgs;
    depGraph: DirectedGraph;
}
