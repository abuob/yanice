import { YanicePluginImportBoundariesRestrictPackageImportsOptions } from 'yanice';

import {
    AssertionViolationRestrictPackageImportAllPackagesMustBeListed,
    AssertionViolationRestrictPackageImportBlockedPackage,
    AssertionViolationRestrictPackageImportInvalidConfigurationKeys,
    AssertionViolationRestrictPackageImportMissingConfig,
    YaniceImportBoundariesAssertionViolation
} from '../../../api/assertion.interface';
import { ImportBoundaryAssertionData } from '../../../api/import-boundary-assertion-data';
import { FileToImportResolutions, ImportResolution, ImportResolutionResolvedPackageImport } from '../../../api/import-resolver.interface';

export class RestrictPackageImportsUtil {
    public static getRuleViolations(
        projectNames: string[],
        assertionData: ImportBoundaryAssertionData,
        restrictPackageImportOptions: YanicePluginImportBoundariesRestrictPackageImportsOptions,
        ignoredProjects: string[]
    ): YaniceImportBoundariesAssertionViolation[] {
        const allowedByDefault: string[] = restrictPackageImportOptions.allowConfiguration.allowByDefault;
        const blockedByDefault: string[] = restrictPackageImportOptions.blockConfiguration.blockByDefault;
        const allPackagesMustBeListed: boolean = restrictPackageImportOptions.allPackagesMustBeListed ?? false;

        const allFilePaths: string[] = Object.keys(assertionData.fileToProjectsMap);

        return projectNames.reduce(
            (prev: YaniceImportBoundariesAssertionViolation[], projectName: string): YaniceImportBoundariesAssertionViolation[] => {
                if (ignoredProjects.includes(projectName)) {
                    return prev;
                }
                const allowExceptions: string[] = restrictPackageImportOptions.allowConfiguration.exceptions?.[projectName] ?? [];
                const blockExceptions: string[] = restrictPackageImportOptions.blockConfiguration.exceptions?.[projectName] ?? [];

                const allowedForProject: string[] = allowedByDefault
                    .filter((entry: string) => !allowExceptions.includes(entry))
                    .concat(blockExceptions);
                const blockedForProject: string[] = blockedByDefault
                    .filter((entry: string) => !blockExceptions.includes(entry))
                    .concat(allowExceptions);

                const filesInProject: string[] = allFilePaths.filter((filePath: string): boolean => {
                    const isFileInProject: boolean | undefined = assertionData.fileToProjectsMap[filePath]?.some(
                        (projectNamesOfFile: string): boolean => projectNamesOfFile === projectName
                    );
                    return isFileInProject ?? false;
                });

                filesInProject.forEach((filePath: string): void => {
                    const fileToImportResolutions: FileToImportResolutions | undefined = assertionData.fileToImportResolutionsMap[filePath];
                    fileToImportResolutions?.importResolutions.forEach((importResolution: ImportResolution): void => {
                        importResolution.resolvedPackageImports.forEach(
                            (resolvedPackageImport: ImportResolutionResolvedPackageImport): void => {
                                const isAllowed: boolean = allowedForProject.includes(resolvedPackageImport.package);
                                const isBlocked: boolean = blockedForProject.includes(resolvedPackageImport.package);
                                if (isBlocked) {
                                    const violation: AssertionViolationRestrictPackageImportBlockedPackage = {
                                        type: 'restrict-package-import::blocked-package',
                                        filePath,
                                        importStatement: resolvedPackageImport.importStatement,
                                        withinProject: projectName
                                    };
                                    prev.push(violation);
                                }
                                if (!isBlocked && !isAllowed && allPackagesMustBeListed) {
                                    const violation: AssertionViolationRestrictPackageImportAllPackagesMustBeListed = {
                                        type: 'restrict-package-import::all-packages-must-be-listed',
                                        filePath,
                                        importStatement: resolvedPackageImport.importStatement,
                                        withinProject: projectName
                                    };
                                    prev.push(violation);
                                }
                            }
                        );
                    });
                });

                return prev;
            },
            []
        );
    }

    public static getConfigurationViolations(
        projectNames: string[],
        restrictPackageImportOptions: YanicePluginImportBoundariesRestrictPackageImportsOptions | undefined
    ): YaniceImportBoundariesAssertionViolation[] {
        if (!restrictPackageImportOptions) {
            const violation: AssertionViolationRestrictPackageImportMissingConfig = {
                type: 'restrict-package-import::missing-config'
            };
            return [violation];
        }

        const projectNameSet: Set<string> = new Set(projectNames);

        const allowConfigExceptionKeys: string[] = Object.keys(restrictPackageImportOptions.allowConfiguration.exceptions ?? {});
        const blockConfigExceptionKeys: string[] = Object.keys(restrictPackageImportOptions.blockConfiguration.exceptions ?? {});

        const allowViolations: AssertionViolationRestrictPackageImportInvalidConfigurationKeys[] =
            RestrictPackageImportsUtil.getInvalidKeysViolations(projectNameSet, allowConfigExceptionKeys, 'allowlist');

        const blockViolations: AssertionViolationRestrictPackageImportInvalidConfigurationKeys[] =
            RestrictPackageImportsUtil.getInvalidKeysViolations(projectNameSet, blockConfigExceptionKeys, 'blocklist');

        return [...allowViolations, ...blockViolations];
    }

    private static getInvalidKeysViolations(
        allowedKeys: Set<string>,
        keyList: string[],
        listType: AssertionViolationRestrictPackageImportInvalidConfigurationKeys['list']
    ): AssertionViolationRestrictPackageImportInvalidConfigurationKeys[] {
        return keyList
            .filter((key: string) => !allowedKeys.has(key))
            .map((key: string): AssertionViolationRestrictPackageImportInvalidConfigurationKeys => {
                return {
                    type: 'restrict-package-import::invalid-configuration-keys',
                    list: listType,
                    notAProjectName: key
                };
            });
    }
}
