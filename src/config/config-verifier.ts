import schemaJson from '../../schema.json';
import { log } from '../util/log';
import { IYaniceJson } from './config-parser';

const jsonschemaValidator = require('jsonschema').Validator;

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
        const validator = new jsonschemaValidator();
        const validationResult = validator.validate(yaniceJson, schemaJson, { allowUnknownAttributes: false, throwError: false });
        return validationResult.valid;
    }

    public static printErrorOnVerifyYaniceJsonWithSchemaFailure(yaniceJson: any): void {
        log('The yanice.json file does not conform to the json schema! Detected Error:');
        const validator = new jsonschemaValidator();
        validator.validate(yaniceJson, schemaJson, { allowUnknownAttributes: false, throwError: true });
    }

    // ========= verifyDependencyScopeProjectNames

    public static verifyDependencyScopeProjectNames(yaniceConfig: IYaniceJson): boolean {
        const allProjectNames = yaniceConfig.projects.map(project => project.projectName);
        let result = true;
        Object.keys(yaniceConfig.dependencyScopes).forEach(scope => {
            Object.keys(yaniceConfig.dependencyScopes[scope]).forEach(dependentChild => {
                if (!allProjectNames.includes(dependentChild)) {
                    result = false;
                }
                yaniceConfig.dependencyScopes[scope][dependentChild].forEach(parentDependency => {
                    if (!allProjectNames.includes(parentDependency)) {
                        result = false;
                    }
                });
            });
        });
        return result;
    }

    public static printErrorOnVerifyDependencyScopeProjectNamesFailure(yaniceConfig: IYaniceJson): void {
        const allProjectNames = yaniceConfig.projects.map(project => project.projectName);
        Object.keys(yaniceConfig.dependencyScopes).forEach(scope => {
            Object.keys(yaniceConfig.dependencyScopes[scope]).forEach(dependentChild => {
                if (!allProjectNames.includes(dependentChild)) {
                    log(
                        `Within scope "${scope}": There is no project with projectName "${dependentChild}" defined; only defined projects are allowed.`
                    );
                }
                yaniceConfig.dependencyScopes[scope][dependentChild].forEach(parentDependency => {
                    if (!allProjectNames.includes(parentDependency)) {
                        log(
                            `Within scope "${scope}": For project "${dependentChild}": There is no project with projectName "${parentDependency}" defined; only defined projects are allowed.`
                        );
                    }
                });
            });
        });
    }
}
