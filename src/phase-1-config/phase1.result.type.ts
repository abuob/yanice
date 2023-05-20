import { YaniceConfig } from './config/config.interface';
import { YaniceArgs } from './config/args-parser';
import { DirectedGraph } from './directed-graph/directed-graph';
import { YaniceCliArgsV2 } from './args-parser/cli-args.interface';

export interface Phase1Result {
    baseDirectory: string;
    yaniceConfig: YaniceConfig;
    yaniceArgs: YaniceArgs;
    yaniceArgsV2: YaniceCliArgsV2 | null; // TODO: remove null once the switch to v2 has been done
    depGraph: DirectedGraph;
}
