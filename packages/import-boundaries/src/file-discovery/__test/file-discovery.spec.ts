import { expect } from 'chai';
import path from 'path';

import { FileDiscovery } from '../file-discovery';
import { DirectoryNode } from '../file-discovery.type';

describe('FileDiscovery', () => {
    describe('getFilePathsRecursively', () => {
        it('should find all files in directory, transitively', async () => {
            const fileDiscoveryCodeFolder: string = path.join(__dirname, '../');
            const allFilesInFileDiscoveryFolder: string[] = await FileDiscovery.getFilePathsRecursively(fileDiscoveryCodeFolder, []);
            expect(allFilesInFileDiscoveryFolder).to.have.same.members([
                path.join(fileDiscoveryCodeFolder, '__test/file-discovery.spec.ts'),
                path.join(fileDiscoveryCodeFolder, '/file-discovery.ts'),
                path.join(fileDiscoveryCodeFolder, '/file-discovery.type.ts')
            ]);
            expect(allFilesInFileDiscoveryFolder).to.have.length(3);
        });

        it('should exclude passed exclusions', async () => {
            const fileDiscoveryCodeFolder: string = path.join(__dirname, '../');
            const allFilesInFileDiscoveryFolder: string[] = await FileDiscovery.getFilePathsRecursively(fileDiscoveryCodeFolder, [
                '**/__test/**'
            ]);
            expect(allFilesInFileDiscoveryFolder).to.have.same.members([
                path.join(fileDiscoveryCodeFolder, '/file-discovery.ts'),
                path.join(fileDiscoveryCodeFolder, '/file-discovery.type.ts')
            ]);
            expect(allFilesInFileDiscoveryFolder).to.have.length(2);
        });
    });

    describe('createDirectoryTree', () => {
        it('should find all files in directory, transitively', async () => {
            const fileDiscoveryCodeFolder: string = path.join(__dirname, '../');
            const actual: DirectoryNode = await FileDiscovery.createDirectoryTree(fileDiscoveryCodeFolder, []);
            const expected: DirectoryNode = {
                type: 'directory',
                absolutePath: fileDiscoveryCodeFolder,
                children: [
                    {
                        type: 'directory',
                        absolutePath: path.join(fileDiscoveryCodeFolder, './__test'),
                        children: [
                            {
                                type: 'file',
                                absolutePath: path.join(fileDiscoveryCodeFolder, './__test', './file-discovery.spec.ts'),
                                fileName: 'file-discovery.spec.ts'
                            }
                        ]
                    },
                    {
                        type: 'file',
                        absolutePath: path.join(fileDiscoveryCodeFolder, './file-discovery.ts'),
                        fileName: 'file-discovery.ts'
                    },
                    {
                        type: 'file',
                        absolutePath: path.join(fileDiscoveryCodeFolder, './file-discovery.type.ts'),
                        fileName: 'file-discovery.type.ts'
                    }
                ]
            };
            expect(actual).to.deep.equal(expected);
        });
    });
});
