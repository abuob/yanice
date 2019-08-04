import { expect } from 'chai';
import { ChangedProjects } from '../changed-projects'
const execSync = require('child_process').execSync;

describe('ChangedProjects', () => {
    describe('getChangedProjectsRaw', () => {
        const exampleProjects = [
            {
                projectName: "A",
                rootDir: "path/to/dir/A"
            },
            {
                projectName: "AAA",
                rootDir: "path/to/dir/AAA"
            },
            {
                projectName: "B",
                rootDir: "path/to/dir/B"
            },
            {
                projectName: "C",
                rootDir: "path/lib/C"
            },
            {
                projectName: "D",
                rootDir: "path/lib/D"
            },
            {
                projectName: "E",
                rootDir: "some/random/location"
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
        expect(actual1).to.have.same.members(['A']);
        expect(actual2).to.have.same.members([]);
        expect(actual3).to.have.same.members(['A', 'E']);
        expect(actual4).to.have.same.members(['A', 'AAA']);
    });
});
