import { LogUtil } from './log-util';

export class PhaseExecutor {
    protected exitYanice(exitCode: number, message: string | null): never {
        if (message) {
            LogUtil.log(message);
        }
        process.exit(exitCode);
    }
}
