import { expect } from 'chai';

import { YaniceProject } from '../../phase-1-config/config/config.interface';
import { ChangedProjects } from '../changed-projects';

describe('ChangedProjects', () => {
    describe('getChangedProjectsRaw', () => {
        it('should handle changed projects correctly', () => {
            const exampleProjects: YaniceProject[] = [
                {
                    projectName: 'A',
                    projectFolder: null,
                    pathRegExp: new RegExp('path/to/dir/A'),
                    pathGlob: '**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'AAA',
                    projectFolder: null,
                    pathRegExp: new RegExp('path.*AAA'),
                    pathGlob: '**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'B',
                    projectFolder: null,
                    pathRegExp: /path\/to\/dir\/B/,
                    pathGlob: '**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'C',
                    projectFolder: 'path/lib/C',
                    pathRegExp: /.*/,
                    pathGlob: 'path/lib/C/**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'D',
                    projectFolder: null,
                    pathRegExp: new RegExp('path/lib/D'),
                    pathGlob: '**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'E',
                    projectFolder: null,
                    pathRegExp: new RegExp('some/random/location'),
                    pathGlob: '**',
                    commands: {},
                    responsibles: []
                },
                {
                    projectName: 'all-javascript-files',
                    projectFolder: null,
                    pathRegExp: /.*\.js/,
                    pathGlob: '**/*.js',
                    commands: {},
                    responsibles: []
                }
            ];
            const actual0 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, []);
            const actual1 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, ['path/to/dir/A/someFile.js']);
            const actual2 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, ['not/part/of/any/project/file.java']);
            const actual3 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, [
                'path/to/dir/A/someFile.js',
                'path/to/dir/A/src/some/dir/someOtherFile.xml',
                'some/random/location/some/random/file.json',
                'not/part/of/any/project/file.java'
            ]);
            const actual4 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, [
                'path/to/dir/A/someFile.js',
                'path/to/dir/AAA/someOtherFile.js'
            ]);
            const actual5 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, ['path/to/dir/A/.someDotFile']);
            const actual6 = ChangedProjects.getChangedProjectsRaw('/', exampleProjects, ['path/lib/C/.someDotDir/someFile.js']);
            expect(actual0).to.have.same.members([]);
            expect(actual1).to.have.same.members(['A', 'all-javascript-files']);
            expect(actual2).to.have.same.members([]);
            expect(actual3).to.have.same.members(['A', 'E', 'all-javascript-files']);
            expect(actual4).to.have.same.members(['A', 'AAA', 'all-javascript-files']);
            expect(actual5).to.have.same.members(['A']);
            expect(actual6).to.have.same.members(['C', 'all-javascript-files']);
        });
    });

    describe('isFileWithinDirectory', () => {
        it('should return true when the file is part of the given directory', () => {
            expect(ChangedProjects.isFileWithinDirectory('root', '.', 'some-file.txt')).equals(true);
            expect(ChangedProjects.isFileWithinDirectory('root', 'some-dir', 'some-dir/some-file.txt')).equals(true);
        });
        it('should return false when the file is not part of the given directory', () => {
            expect(ChangedProjects.isFileWithinDirectory('root', '.', '../')).equals(false);
            expect(ChangedProjects.isFileWithinDirectory('root', 'some-dir', 'some-other-dir/some-file.txt')).equals(false);
        });
    });
});
