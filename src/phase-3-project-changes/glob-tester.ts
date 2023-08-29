import { minimatch } from 'minimatch';

/**
 * Wraps minimatch. Primarily exists to keep minimatch-access (including passed options) in a single place.
 */
export class GlobTester {
    public static isGlobMatching(input: string, glob: string): boolean {
        return minimatch(input, glob, { dot: true });
    }

    public static filterByPattern(inputs: string[], glob: string): string[] {
        return inputs.filter(minimatch.filter(glob, { dot: true }));
    }
}
