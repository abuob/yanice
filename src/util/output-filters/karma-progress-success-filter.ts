import { OutputFilter } from '../output-filter';

export class KarmaProgressSuccessFilter extends OutputFilter {
    constructor() {
        super('karmaProgressSuccess');
    }

    public filterOutputLine(line: string): boolean {
        return !/^Executed \d+ of \d+ SUCCESS/.test(line);
    }
}
