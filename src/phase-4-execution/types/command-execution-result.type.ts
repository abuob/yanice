export interface CommandExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionDurationInMs: number;
}
