export type commandOutputFilterType = 'ignoreStderr' | 'ignoreStdout' | 'karmaProgressSuccess' | 'npmError';

export abstract class OutputFilter {
    protected constructor(public readonly filterName: commandOutputFilterType) {}

    public abstract filterOutputLine(line: string): boolean;
}
