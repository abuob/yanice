import { log } from './log';

export class PhaseExecutor {
    protected exitYanice(exitCode: number, message: string | null): never {
        if (message) {
            log(message);
        }
        process.exit(exitCode);
    }
}
