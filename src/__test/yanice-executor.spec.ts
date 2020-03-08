import { expect } from 'chai';
import { YaniceExecutor } from '../yanice-executor';
import validYaniceJson1 from '../__fixtures/valid-1.yanice.json';
import { IYaniceJson } from '../config/config.interface'

describe('YaniceExecutor', () => {
    let yaniceExecutor: YaniceExecutor;
    const baseDirectory = process.cwd();
    const yaniceJson: IYaniceJson = validYaniceJson1 as any;

    beforeEach(() => {
        yaniceExecutor = new YaniceExecutor();
        (yaniceExecutor as any).changedFiles = [
            "path/to/dir/A/some-A-file",
            "path/to/dir/B/some-B-file",
            "path/to/dir/E/some-E-file",
        ];
    });

    it('should calculate all changed projects correctly', () => {
        yaniceExecutor
            .loadConfigAndParseArgs(['lint', '--outputOnly=true'], baseDirectory, yaniceJson)
            .calculateChangedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
    });

    it('should calculate all affected projects correctly', () => {
        yaniceExecutor
            .loadConfigAndParseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=false'], baseDirectory, yaniceJson)
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
    });

    it('should set affectedProjects to all projects when --all parameter is given', () => {
        yaniceExecutor
            .loadConfigAndParseArgs(['lint', '--outputOnly=true', '--includeCommandSupportedOnly=false', '--all'], baseDirectory, yaniceJson)
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B', 'C', 'D', 'E']);
    });

    it('should filter unsupported commands when outputOnly=false even when includeCommandSupportedOnly=true', () => {
        yaniceExecutor
            .loadConfigAndParseArgs(['lint', '--outputOnly=false', '--includeCommandSupportedOnly=false', '--all'], baseDirectory, yaniceJson)
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
            .loadConfigAndParseArgs(['lint', '--outputOnly=true', '--includeCommandSupportedOnly=true', '--all'], baseDirectory, yaniceJson)
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
            .loadConfigAndParseArgs(['test', '--outputOnly=true', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson)
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects()
            .filterOutUnsupportedProjectsIfNeeded();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['B', 'C', 'D']);
    });

    it('should calculate responsibles correctly', () => {
        yaniceExecutor
            .loadConfigAndParseArgs(['lint', '--responsibles', '--includeCommandSupportedOnly=true'], baseDirectory, yaniceJson)
            .calculateChangedProjects()
            .calculateDepGraphForGivenScope()
            .verifyDepGraphValidity()
            .calculateAffectedProjects()
            .calculateResponsibles()
            .filterOutUnsupportedProjectsIfNeeded();
        expect((yaniceExecutor as any).changedProjects).to.have.same.members(['A', 'B', 'E']);
        expect((yaniceExecutor as any).affectedProjects).to.have.same.members(['A', 'B']);
        expect((yaniceExecutor as any).responsibles).to.have.same.members(['Alice', 'Bob', 'Edith']);
    });
});
