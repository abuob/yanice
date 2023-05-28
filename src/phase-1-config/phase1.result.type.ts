import { YaniceConfig } from './config/config.interface';
import { DirectedGraph } from './directed-graph/directed-graph';
import { YaniceCliArgsV2 } from './args-parser/cli-args.interface';

export interface Phase1Result {
    baseDirectory: string;
    yaniceConfig: YaniceConfig;
    yaniceArgsV2: YaniceCliArgsV2;
    depGraph: DirectedGraph;
}
