import { DirectedGraph, DirectedGraphBuilder, DirectedGraphUtil } from 'yanice';

import { AssertionViolationNoCircularImportsCycleViolation, CycleViolationNode } from '../../../api/assertion.interface';
import {
    FileToImportResolutions,
    FileToImportResolutionsMap,
    ImportResolution,
    ImportResolutionResolvedImport
} from '../../../api/import-resolver.interface';

export class FileImportGraph {
    private directedGraph: DirectedGraph;

    private filePathToIdentifierMap: Map<string, string> = new Map();
    private identifierToFilePathMap: Map<string, string> = new Map();
    private importRelationShipMap: Map<string, ImportResolutionResolvedImport> = new Map();

    constructor(fileToImportResolutionsMap: FileToImportResolutionsMap) {
        const graphBuilder: DirectedGraphBuilder = DirectedGraphUtil.directedGraphBuilder;
        Object.keys(fileToImportResolutionsMap).forEach((filePath: string, index: number): void => {
            const identifier: string = index.toString();
            this.filePathToIdentifierMap.set(filePath, identifier);
            this.identifierToFilePathMap.set(identifier, filePath);
            graphBuilder.addNode(identifier);
        });
        Object.keys(fileToImportResolutionsMap).forEach((filePath: string): void => {
            const currentFileIdentifier: string | undefined = this.filePathToIdentifierMap.get(filePath);
            if (!currentFileIdentifier) {
                throw new Error(`Cannot find identifier for ${filePath}`);
            }
            const fileToImportResolutions: FileToImportResolutions | undefined = fileToImportResolutionsMap[filePath];
            if (!fileToImportResolutions) {
                throw new Error(`Cannot find importResolutions of ${filePath}`);
            }
            fileToImportResolutions.importResolutions.forEach((importResolution: ImportResolution): void => {
                importResolution.resolvedImports.forEach((resolvedImport: ImportResolutionResolvedImport): void => {
                    const importedFileIdentifier: string | undefined = this.filePathToIdentifierMap.get(
                        resolvedImport.resolvedAbsoluteFilePath
                    );
                    if (!importedFileIdentifier) {
                        throw new Error(`Cannot find filePath (import) of ${importedFileIdentifier}`);
                    }
                    graphBuilder.createDirectedEdge(currentFileIdentifier, importedFileIdentifier);
                    const relationshipKey: string = this.getImportRelationshipMapKey(currentFileIdentifier, importedFileIdentifier);
                    this.importRelationShipMap.set(relationshipKey, resolvedImport);
                });
            });
        });
        this.directedGraph = graphBuilder.build();
    }

    public static createFileImportGraph(fileToImportResolutions: FileToImportResolutionsMap): FileImportGraph {
        return new FileImportGraph(fileToImportResolutions);
    }

    public getCycles(): AssertionViolationNoCircularImportsCycleViolation[] {
        const cycles: string[][] = DirectedGraphUtil.findCycles(this.directedGraph);
        return cycles.map((cycle: string[]): AssertionViolationNoCircularImportsCycleViolation => {
            return {
                type: 'no-circular-imports::cycle-violation',
                cycle: cycle.map((cycleNodeIdentifier: string, index: number): CycleViolationNode => {
                    const importIdentifierIndex: number = index === cycle.length - 1 ? 0 : index + 1;
                    const importedFileIdentifier: string | undefined = cycle[importIdentifierIndex];
                    if (!importedFileIdentifier) {
                        throw new Error(`Cannot find index ${importIdentifierIndex} in cycle ${cycle.join(', ')}`);
                    }
                    const filePath: string | undefined = this.identifierToFilePathMap.get(cycleNodeIdentifier);
                    if (!filePath) {
                        throw new Error(`Cannot find filePath for identifier ${cycleNodeIdentifier}`);
                    }
                    const relationshipKey: string = this.getImportRelationshipMapKey(cycleNodeIdentifier, importedFileIdentifier);
                    const importRelationship: ImportResolutionResolvedImport | undefined = this.importRelationShipMap.get(relationshipKey);
                    if (!importRelationship) {
                        throw new Error(`Cannot find relationship of identifier ${cycleNodeIdentifier} to ${importedFileIdentifier}`);
                    }
                    return {
                        absoluteFilePath: filePath,
                        importStatement: importRelationship.parsedImportStatement.raw
                    };
                })
            };
        });
    }

    private getImportRelationshipMapKey(currentFileIdentifier: string, importedFileIdentifier: string): string {
        return `${currentFileIdentifier},${importedFileIdentifier}`;
    }
}
