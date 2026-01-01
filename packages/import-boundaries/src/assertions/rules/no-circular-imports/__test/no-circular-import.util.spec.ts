import { expect } from 'chai';

import { FileToImportResolutions, FileToImportResolutionsMap } from '../../../../api/import-resolver.interface';
import { NoCircularImportUtil } from '../no-circular-import.util';

describe('NoCircularImportUtil', () => {
    const emptyFileToImportResolutions: FileToImportResolutions = {
        skippedImports: [],
        importResolutions: []
    };

    describe('getFileToImportResolutionsMapFiltered', () => {
        const fileToImportResolutionsMap: FileToImportResolutionsMap = {
            'file-a': emptyFileToImportResolutions,
            'file-b': emptyFileToImportResolutions,
            'file-c': emptyFileToImportResolutions,
            'both-a-and-b': emptyFileToImportResolutions
        };
        const fileToProjectsMap: Record<string, string[]> = {
            'file-a': ['A'],
            'file-b': ['B'],
            'file-c': ['C'],
            'both-a-and-b': ['A', 'B']
        };

        it('should not apply and filtering if the exclusions are empty', () => {
            const actual: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
                fileToImportResolutionsMap,
                [],
                fileToProjectsMap
            );
            // Should remain the same object, untouched
            expect(actual).to.equal(fileToImportResolutionsMap);
            expect(actual).to.deep.equal(fileToImportResolutionsMap);
        });

        it('should filter out files that are part of excluded projects', () => {
            const actualExcludedA: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
                fileToImportResolutionsMap,
                ['A'],
                fileToProjectsMap
            );
            const expectedExcludedA: FileToImportResolutionsMap = {
                'file-b': emptyFileToImportResolutions,
                'file-c': emptyFileToImportResolutions
            };
            expect(actualExcludedA).to.deep.equal(expectedExcludedA);

            const actualExcludedB: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
                fileToImportResolutionsMap,
                ['B'],
                fileToProjectsMap
            );
            const expectedExcludedB: FileToImportResolutionsMap = {
                'file-a': emptyFileToImportResolutions,
                'file-c': emptyFileToImportResolutions
            };
            expect(actualExcludedB).to.deep.equal(expectedExcludedB);

            const actualExcludedC: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
                fileToImportResolutionsMap,
                ['C'],
                fileToProjectsMap
            );
            const expectedExcludedC: FileToImportResolutionsMap = {
                'file-a': emptyFileToImportResolutions,
                'file-b': emptyFileToImportResolutions,
                'both-a-and-b': emptyFileToImportResolutions
            };
            expect(actualExcludedC).to.deep.equal(expectedExcludedC);

            const actualExcludedAC: FileToImportResolutionsMap = NoCircularImportUtil.getFileToImportResolutionsMapFiltered(
                fileToImportResolutionsMap,
                ['A', 'C'],
                fileToProjectsMap
            );
            const expectedExcludedAC: FileToImportResolutionsMap = {
                'file-b': emptyFileToImportResolutions
            };
            expect(actualExcludedAC).to.deep.equal(expectedExcludedAC);
        });
    });
});
