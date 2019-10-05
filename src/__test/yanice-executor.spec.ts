import { expect } from 'chai';
import { YaniceExecutor } from '../yanice-executor';
import yaniceJson from './fixtures/example-1-yanice.json';
import { ConfigParser } from '../config/config-parser'

describe('YaniceExecutor', () => {
    let yaniceExecutor: YaniceExecutor;

    beforeEach(() => {
        yaniceExecutor = new YaniceExecutor();
        (yaniceExecutor as any).baseDirectory = process.cwd();
        (yaniceExecutor as any).yaniceConfig = ConfigParser.getConfigFromYaniceJson(yaniceJson);
        (yaniceExecutor as any).changedFiles = [
            "path/to/dir/A/some-A-file",
            "path/to/dir/B/some-B-file",
            "path/to/dir/E/some-E-file",
        ];
    });

    it('should calculate all changed projects correctly', () => {
        yaniceExecutor.parseArgs(['lint', '--outputOnly=true']);
        yaniceExecutor.calculateChangedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
    });

    it('should calculate all affected projects correctly', () => {
        yaniceExecutor
            .parseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=false'])
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
    });

    it('should set affectedProjects to all projects when --all parameter is given', () => {
        yaniceExecutor
            .parseArgs(['lint', '--outputOnly=true', '--includeCommandSupportedOnly=false', '--all'])
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
    });

    it('should filter unsupported commands when outputOnly=false even when includeCommandSupportedOnly=true', () => {
        yaniceExecutor
            .parseArgs(['lint', '--outputOnly=false', '--includeCommandSupportedOnly=false', '--all'])
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects()
            .filterOutUnsupportedProjectsIfNeeded();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
    });

    it('should set affectedProjects to all projects that support the given scope when --all parameter is given', () => {
        yaniceExecutor
            .parseArgs(['lint', '--outputOnly=true', '--includeCommandSupportedOnly=true', '--all'])
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects()
            .filterOutUnsupportedProjectsIfNeeded();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C']);
    });

    it('should filter out projects according to parameters', () => {
        yaniceExecutor
            .parseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=true'])
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects()
            .filterOutUnsupportedProjectsIfNeeded();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
    });
});
