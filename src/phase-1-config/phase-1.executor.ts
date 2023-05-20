import { PhaseExecutor } from '../util/phase-executor';
import { ConfigVerifier } from './config/config-verifier';
import { ConfigParser } from './config/config-parser';
import { YaniceConfig, YaniceJsonType } from './config/config.interface';
import { ArgsParser, YaniceArgs } from './config/args-parser';
import { Phase1Result } from './phase1.result.type';
import { DirectedGraph, DirectedGraphUtil } from './directed-graph/directed-graph';
import { YaniceCliArgsV2 } from './args-parser/cli-args.interface';
import { YaniceCliArgsParserV2 } from './args-parser/cli-args-parser.v2';

export class Phase1Executor extends PhaseExecutor {
    private baseDirectory: string | null = null;
    private yaniceJson: YaniceJsonType | null = null;
    private yaniceConfig: YaniceConfig | null = null;
    private yaniceArgs: YaniceArgs | null = null;
    private yaniceArgsV2: YaniceCliArgsV2 | null = null;
    private depGraph: DirectedGraph | null = null;

    public static execute(args: string[], baseDirectory: string, yaniceJson: YaniceJsonType): Phase1Result {
        return new Phase1Executor()
            .loadConfigAndParseArgs(args, baseDirectory, yaniceJson)
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .createPhaseResult();
    }

    private loadConfigAndParseArgs(args: string[], baseDirectory: string, yaniceJson: YaniceJsonType): Phase1Executor {
        this.baseDirectory = baseDirectory;
        this.yaniceJson = yaniceJson;
        return this.validateYaniceJson(yaniceJson).parseArgs(args).parseArgsV2(args).verifyArgs().parseYaniceJson();
    }

    private createPhaseResult(): Phase1Result {
        // TODO: Ensure yaniceArgsV2 is non-null once the switch has been done
        if (!this.yaniceConfig || !this.yaniceArgs || !this.depGraph || !this.baseDirectory) {
            this.exitYanice(1, `[phase-1] Failed to create phase result`);
        }
        return {
            yaniceConfig: this.yaniceConfig,
            yaniceArgs: this.yaniceArgs,
            yaniceArgsV2: this.yaniceArgsV2,
            depGraph: this.depGraph,
            baseDirectory: this.baseDirectory
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
        if (this.yaniceJson && this.yaniceArgs) {
            this.yaniceConfig = ConfigParser.getYaniceConfig(this.yaniceJson, this.yaniceArgs);
        }
        return this;
    }

    private parseArgs(args: string[]): Phase1Executor {
        this.yaniceArgs = ArgsParser.parseArgs(args);
        ArgsParser.verifyDiffTargetPresence(this.yaniceArgs);
        return this;
    }

    private parseArgsV2(args: string[]): Phase1Executor {
        this.yaniceArgsV2 = YaniceCliArgsParserV2.parseArgsV2(args);
        return this;
    }

    private verifyArgs(): Phase1Executor {
        if (this.yaniceArgs && this.yaniceJson) {
            this.verifyScopeParam(this.yaniceArgs.givenScope, this.yaniceJson);
        }
        return this;
    }

    private verifyScopeParam(scopeParam: string, yaniceJson: YaniceJsonType): void {
        const scopes = Object.keys(yaniceJson.dependencyScopes);
        if (!scopeParam) {
            this.exitYanice(
                1,
                `No scope was provided! Please select one of the following scopes as first input parameter: ${scopes.join(', ')}`
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
