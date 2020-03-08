import Ajv from 'ajv';
import schemaJson from '../../schema.json';
import { log } from '../util/log';
import { IYaniceJson } from './config.interface';

/**
 * Concept: Each verification-method has a corresponding "printErrorOn<verification>Failure"-method, which will be called
 * to print an appropriate error-message when the verification-method fails.
 * They are kept separate to improve testability, and to make it easier to refactor.
 */
export class ConfigVerifier {
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
        log('The yanice.json file does not conform to the json schema! Detected Error:');
        const ajv = new Ajv();
        const validate = ajv.compile(schemaJson);
        const validationResult = validate(yaniceJson);

        // Due to terrible ajv-api: The errors of the validation are stored on the validate-object
        if (!validationResult && validate.errors) {
            log(validate.errors);
        }
    }

    // ========= verifySchemaVersion

    public static verifySchemaVersion(yaniceJson: IYaniceJson): boolean {
        const versionNumberOrUndefined: number = yaniceJson.schemaVersion;
        return this.SUPPORTED_VERSIONS.includes(versionNumberOrUndefined);
    }

    public static printErrorOnVerifySchemaVersionFailure(yaniceJson: IYaniceJson): void {
        const versionNumber: number = yaniceJson.schemaVersion;
        log(
            `schemaVersion ${
                yaniceJson.schemaVersion
            } is not or no longer supported! This version of yanice currently supports the following versions: ${this.SUPPORTED_VERSIONS.join(
                ', '
            )}`
        );
    }

    // ========= verifyDependencyScopeProjectNames

    public static verifyDependencyScopeProjectNames(yaniceJson: IYaniceJson): boolean {
        const allProjectNames = yaniceJson.projects.map(project => project.projectName);
        return !Object.keys(yaniceJson.dependencyScopes).some(scope =>
            Object.keys(yaniceJson.dependencyScopes[scope].dependencies).some(
                project =>
                    !allProjectNames.includes(project) ||
                    yaniceJson.dependencyScopes[scope].dependencies[project].some(dependency => !allProjectNames.includes(dependency))
            )
        );
    }

    public static printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfig: IYaniceJson): void {
        const allProjectNames = yaniceConfig.projects.map(project => project.projectName);
        Object.keys(yaniceConfig.dependencyScopes).forEach(scope => {
            Object.keys(yaniceConfig.dependencyScopes[scope].dependencies).forEach(project => {
                if (!allProjectNames.includes(project)) {
                    log(
                        `Within scope "${scope}": There is no project with projectName "${project}" defined; only defined projects are allowed.`
                    );
                }
                yaniceConfig.dependencyScopes[scope].dependencies[project].forEach(projectDependency => {
                    if (!allProjectNames.includes(projectDependency)) {
                        log(
                            `Within scope "${scope}": For project "${project}": There is no project with projectName "${projectDependency}" defined; only defined projects are allowed.`
                        );
                    }
                });
            });
        });
    }

    private static readonly SUPPORTED_VERSIONS = [2];
}
