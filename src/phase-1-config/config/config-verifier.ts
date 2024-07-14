import Ajv from 'ajv';

import schemaJson from '../../../schema.json';
import { LogUtil } from '../../util/log-util';
import { YaniceJsonType } from './config.interface';

/**
 * Concept: Each verification-method has a corresponding "printErrorOn<verification>Failure"-method, which will be called
 * to print an appropriate error-message when the verification-method fails.
 * They are kept separate to improve testability, and to make it easier to refactor.
 */
export class ConfigVerifier {
    private static readonly SUPPORTED_VERSIONS: number[] = [3];

    // ========= verifyYaniceJsonWithSchema

    public static verifyYaniceJsonWithSchema(yaniceJson: any): boolean {
        if (!yaniceJson) {
            return false;
        }
        const ajv = new Ajv();
        const validate = ajv.compile(schemaJson);
        const validationResult = validate(yaniceJson);
        return !!validationResult;
    }

    public static printErrorOnVerifyYaniceJsonWithSchemaFailure(yaniceJson: any): void {
        LogUtil.log('The yanice.json file does not conform to the json schema! Detected Error:');
        const ajv = new Ajv();
        const validate = ajv.compile(schemaJson);
        const validationResult = validate(yaniceJson);

        // Due to terrible ajv-api: The errors of the validation are stored on the validate-object
        if (!validationResult && validate.errors) {
            LogUtil.consoleLog(validate.errors);
        }
    }

    // ========= verifySchemaVersion

    public static verifySchemaVersion(yaniceJson: YaniceJsonType): boolean {
        const versionNumberOrUndefined: number = yaniceJson.schemaVersion;
        return ConfigVerifier.SUPPORTED_VERSIONS.includes(versionNumberOrUndefined);
    }

    public static printErrorOnVerifySchemaVersionFailure(yaniceJson: YaniceJsonType): void {
        const versionNumber: number = yaniceJson.schemaVersion;
        const supportedVersions: string = ConfigVerifier.SUPPORTED_VERSIONS.join(', ');
        LogUtil.log(
            `schemaVersion ${versionNumber} is not or no longer supported! This version of yanice currently supports the following versions: ${supportedVersions}`
        );
        LogUtil.log('Please make sure sure that the installed version of yanice supports this schema-version.');
    }

    // ========= verifyDependencyScopeProjectNames

    public static verifyDependencyScopeProjectNames(yaniceJson: YaniceJsonType): boolean {
        const allProjectNames = yaniceJson.projects.map((project) => project.projectName);
        return Object.keys(yaniceJson.dependencyScopes).every((scope) =>
            Object.keys(yaniceJson.dependencyScopes?.[scope]?.dependencies ?? {}).every((project) => {
                const allDependencies: string[] = yaniceJson.dependencyScopes?.[scope]?.dependencies?.[project] ?? [];
                return (
                    allProjectNames.includes(project) && allDependencies.every((dependency: string) => allProjectNames.includes(dependency))
                );
            })
        );
    }

    public static printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfig: YaniceJsonType): void {
        const allProjectNames: string[] = yaniceConfig.projects.map(
            (project: YaniceJsonType['projects'][number]): string => project.projectName
        );
        Object.keys(yaniceConfig.dependencyScopes).forEach((scope: string): void => {
            Object.keys(yaniceConfig.dependencyScopes?.[scope]?.dependencies ?? {}).forEach((project) => {
                if (!allProjectNames.includes(project)) {
                    LogUtil.log(
                        `Within scope "${scope}": There is no project with projectName "${project}" defined; only defined projects are allowed.`
                    );
                }
                const dependencies: string[] = yaniceConfig.dependencyScopes?.[scope]?.dependencies?.[project] ?? [];
                dependencies.forEach((projectDependency: string): void => {
                    if (!allProjectNames.includes(projectDependency)) {
                        LogUtil.log(
                            `Within scope "${scope}": For project "${project}": There is no project with projectName "${projectDependency}" defined; only defined projects are allowed.`
                        );
                    }
                });
            });
        });
    }

    // ========= verifyMaxOneLevelGraphExtension

    // A graph can only extend a graph that does not extend another graph (maximum one level of extension)
    public static verifyMaxOneLevelGraphExtension(yaniceJson: YaniceJsonType): boolean {
        return Object.keys(yaniceJson.dependencyScopes).every((scope) => {
            const extendsOrUndefined: string | undefined = yaniceJson.dependencyScopes[scope]?.extends;
            if (!extendsOrUndefined) {
                return true;
            } else {
                const extendedScope = yaniceJson.dependencyScopes[extendsOrUndefined];
                if (!extendedScope) {
                    return false;
                } else {
                    // The extended graph is not allowed to extend another graph itself
                    return extendedScope.extends === undefined;
                }
            }
        });
    }

    public static printErrorOnVerifyMaxOneLevelGraphExtension(yaniceJson: YaniceJsonType): void {
        Object.keys(yaniceJson.dependencyScopes).forEach((scope: string) => {
            const extendsOrUndefined: string | undefined = yaniceJson.dependencyScopes[scope]?.extends;
            if (!extendsOrUndefined) {
                return;
            } else {
                const extendedScope = yaniceJson.dependencyScopes[extendsOrUndefined];
                if (!extendedScope) {
                    LogUtil.log(`yanice.json: "${scope}" extends "${extendsOrUndefined}", but there is no such scope defined!`);
                } else {
                    if (extendedScope.extends) {
                        LogUtil.log(
                            `yanice.json: "${scope}" extends "${extendsOrUndefined}", but that scope already extends "${extendedScope.extends}" - currently, only one level of extension is allowed. Sorry :(`
                        );
                    }
                }
            }
        });
    }
}
