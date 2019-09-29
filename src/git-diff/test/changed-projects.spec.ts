import { expect } from 'chai';
import { ChangedProjects } from '../changed-projects'
import { IYaniceProject } from '../../config/config-parser'

describe('ChangedProjects', () => {
    describe('getChangedProjectsRaw', () => {
        const exampleProjects: IYaniceProject[] = [
            {
                projectName: "A",
                pathRegExp: new RegExp("path/to/dir/A"),
                pathGlob: '**',
                commands: {}
            },
            {
                projectName: "AAA",
                pathRegExp: new RegExp("path.*AAA"),
                pathGlob: '**',
                commands: {}
            },
            {
                projectName: "B",
                pathRegExp: /path\/to\/dir\/B/,
                pathGlob: '**',
                commands: {}
            },
            {
                projectName: "C",
                pathRegExp: /.*/,
                pathGlob: 'path/lib/C',
                commands: {}
            },
            {
                projectName: "D",
                pathRegExp: new RegExp("path/lib/D"),
                pathGlob: '**',
                commands: {}
            },
            {
                projectName: "E",
                pathRegExp: new RegExp("some/random/location"),
                pathGlob: '**',
                commands: {}
            },
            {
                projectName: "all-javascript-files",
                pathRegExp: /.*\.js/,
                pathGlob: '**/*.js',
                commands: {}
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
        expect(actual0).to.have.same.members([]);
        expect(actual1).to.have.same.members(['A', 'all-javascript-files']);
        expect(actual2).to.have.same.members([]);
        expect(actual3).to.have.same.members(['A', 'E', 'all-javascript-files']);
        expect(actual4).to.have.same.members(['A', 'AAA', 'all-javascript-files']);
    });
});
