import { OutputFilter } from '../output-filter';

export class NpmErrorFilter extends OutputFilter {
    constructor() {
        super('npmError');
    }

    public filterOutputLine(line: string): boolean {
        return !/^npm ERR/.test(line);
    }
}
