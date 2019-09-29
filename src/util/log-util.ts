import { IYaniceCommand } from '../config/config-parser';
import { log } from './log';

export class LogUtil {
    public static printCommandSuccess(command: IYaniceCommand): void {
        log('  \x1B[1;32m ✔ ' + command.command + '\x1B[0m');
    }

    public static printCommandFailure(command: IYaniceCommand): void {
        log('  \x1B[1;31m ✘ ' + command.command + '\x1B[0m (cwd: ' + command.cwd + ')');
    }
}
