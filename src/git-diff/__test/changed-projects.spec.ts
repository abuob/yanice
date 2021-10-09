import { expect } from 'chai';
import { ChangedProjects } from '../changed-projects'
import { IYaniceProject } from '../../config/config.interface'

describe('ChangedProjects', () => {
    describe('getChangedProjectsRaw', () => {
        const exampleProjects: IYaniceProject[] = [
            {
                projectName: "A",
                pathRegExp: new RegExp("path/to/dir/A"),
                pathGlob: '**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "AAA",
                pathRegExp: new RegExp("path.*AAA"),
                pathGlob: '**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "B",
                pathRegExp: /path\/to\/dir\/B/,
                pathGlob: '**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "C",
                pathRegExp: /.*/,
                pathGlob: 'path/lib/C/**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "D",
                pathRegExp: new RegExp("path/lib/D"),
                pathGlob: '**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "E",
                pathRegExp: new RegExp("some/random/location"),
                pathGlob: '**',
                commands: {},
                responsibles: []
            },
            {
                projectName: "all-javascript-files",
                pathRegExp: /.*\.js/,
                pathGlob: '**/*.js',
                commands: {},
                responsibles: []
            }
        ];
        const actual0 = ChangedProjects.getChangedProjectsRaw(exampleProjects, []);
        const actual1 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'path/to/dir/A/someFile.js'
        ]);
        const actual2 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'not/part/of/any/project/file.java'
        ]);
        const actual3 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'path/to/dir/A/someFile.js',
            'path/to/dir/A/src/some/dir/someOtherFile.xml',
            'some/random/location/some/random/file.json',
            'not/part/of/any/project/file.java'
        ]);
        const actual4 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'path/to/dir/A/someFile.js',
            'path/to/dir/AAA/someOtherFile.js'
        ]);
        const actual5 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'path/to/dir/A/.someDotFile',
        ]);
        const actual6 = ChangedProjects.getChangedProjectsRaw(exampleProjects, [
            'path/lib/C/.someDotDir/someFile.js',
        ]);
        expect(actual0).to.have.same.members([]);
        expect(actual1).to.have.same.members(['A', 'all-javascript-files']);
        expect(actual2).to.have.same.members([]);
        expect(actual3).to.have.same.members(['A', 'E', 'all-javascript-files']);
        expect(actual4).to.have.same.members(['A', 'AAA', 'all-javascript-files']);
        expect(actual5).to.have.same.members(['A']);
        expect(actual6).to.have.same.members(['C', 'all-javascript-files']);
    });
});
