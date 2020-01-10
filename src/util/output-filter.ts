export type commandOutputFilterType = 'npmError' | 'karmaProgressSuccess' | 'ignoreStdout' | 'ignoreStderr';

export abstract class OutputFilter {
    protected constructor(public readonly filterName: commandOutputFilterType) {}

    public abstract filterOutputLine(line: string): boolean;
}
