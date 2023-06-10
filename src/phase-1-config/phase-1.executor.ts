import { PhaseExecutor } from '../util/phase-executor';
import { YaniceCliArgs } from './args-parser/cli-args.interface';
import { YaniceCliArgsParser } from './args-parser/cli-args-parser';
import { YaniceConfig, YaniceJsonType } from './config/config.interface';
import { ConfigParser } from './config/config-parser';
import { ConfigVerifier } from './config/config-verifier';
import { DirectedGraph, DirectedGraphUtil } from './directed-graph/directed-graph';
import { Phase1Result } from './phase-1.result.type';

export class Phase1Executor extends PhaseExecutor {
    private yaniceJsonDirectoryPath: string | null = null;
    private gitRepoRootPath: string | null = null;
    private yaniceJson: YaniceJsonType | null = null;
    private yaniceConfig: YaniceConfig | null = null;
    private yaniceCliArgs: YaniceCliArgs | null = null;
    private depGraph: DirectedGraph | null = null;

    public static execute(args: string[], baseDirectory: string, gitRepoRootPath: string, yaniceJson: YaniceJsonType): Phase1Result {
        return new Phase1Executor()
            .loadConfigAndParseArgs(args, baseDirectory, gitRepoRootPath, yaniceJson)
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .createPhaseResult();
    }

    private loadConfigAndParseArgs(
        args: string[],
        baseDirectory: string,
        gitRepoRootPath: string,
        yaniceJson: YaniceJsonType
    ): Phase1Executor {
        this.yaniceJsonDirectoryPath = baseDirectory;
        this.yaniceJson = yaniceJson;
        this.gitRepoRootPath = gitRepoRootPath;
        return this.validateYaniceJson(yaniceJson).parseCliArgs(args).verifyArgs().parseYaniceJson();
    }

    private createPhaseResult(): Phase1Result {
        if (!this.yaniceConfig || !this.yaniceCliArgs || !this.depGraph || !this.yaniceJsonDirectoryPath || !this.gitRepoRootPath) {
            this.exitYanice(1, `[phase-1] Failed to create phase result`);
        }
        return {
            yaniceConfig: this.yaniceConfig,
            yaniceCliArgs: this.yaniceCliArgs,
            depGraph: this.depGraph,
            yaniceJsonDirectoryPath: this.yaniceJsonDirectoryPath,
            gitRepoRootPath: this.gitRepoRootPath
        };
    }

    private validateYaniceJson(yaniceConfigJson: any): Phase1Executor {
        if (!ConfigVerifier.verifyYaniceJsonWithSchema(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyYaniceJsonWithSchemaFailure(yaniceConfigJson);
            this.exitYanice(1, 'yanice.json does not conform to json-schema, please make sure your yanice.json is valid!');
        }
        if (!ConfigVerifier.verifySchemaVersion(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifySchemaVersionFailure(yaniceConfigJson);
            this.exitYanice(1, null);
        }
        if (!ConfigVerifier.verifyDependencyScopeProjectNames(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfigJson);
            this.exitYanice(
                1,
                'yanice.json contains projectNames under dependencyScopes that are not defined as projects! Make sure your dependency trees are defined correctly.'
            );
        }
        if (!ConfigVerifier.verifyMaxOneLevelGraphExtension(yaniceConfigJson)) {
            ConfigVerifier.printErrorOnVerifyMaxOneLevelGraphExtension(yaniceConfigJson);
            this.exitYanice(1, null);
        }
        return this;
    }

    private parseYaniceJson(): Phase1Executor {
        if (this.yaniceJson && this.yaniceCliArgs) {
            this.yaniceConfig = ConfigParser.getYaniceConfig(this.yaniceJson, this.yaniceCliArgs);
        }
        return this;
    }

    private parseCliArgs(args: string[]): Phase1Executor {
        this.yaniceCliArgs = YaniceCliArgsParser.parseArgs(args);
        return this;
    }

    private verifyArgs(): Phase1Executor {
        if (this.yaniceCliArgs && this.yaniceJson) {
            this.verifyScopeParam(this.yaniceCliArgs.defaultArgs.scope, this.yaniceJson);
        }
        return this;
    }

    private verifyScopeParam(scopeParam: string | null, yaniceJson: YaniceJsonType): void {
        const scopes = Object.keys(yaniceJson.dependencyScopes);
        if (!scopeParam) {
            this.exitYanice(
                1,
                `No scope was provided! Please provide one of the following scopes as second input parameter: ${scopes.join(', ')}`
            );
        }
        if (!scopes.includes(scopeParam)) {
            this.exitYanice(
                1,
                `"${scopeParam}" is not a defined scope in the yanice.json! Please select one of the following scopes as first input parameter: ${scopes.join(
                    ', '
                )}`
            );
        }
    }

    private calculateDepGraphForGivenScope(): Phase1Executor {
        if (this.yaniceConfig) {
            this.depGraph = ConfigParser.getDepGraphFromConfig(this.yaniceConfig);
        }
        return this;
    }

    private verifyDepGraphValidity(): Phase1Executor {
        if (!this.depGraph) {
            this.exitYanice(1, 'dep-graph cannot be constructed!');
        }
        if (DirectedGraphUtil.hasCycle(this.depGraph)) {
            this.exitYanice(1, 'dependency graph must not contain a cycle!');
        }
        return this;
    }
}
