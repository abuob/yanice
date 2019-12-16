import { expect } from "chai";
import { ConfigVerifier } from '../config-verifier'
import yaniceJson1 from './fixtures/example-1-yanice.json';
import yaniceJson2 from './fixtures/example-2-yanice.json';
import invalidChildYaniceJson from './fixtures/invalid-child-project-name.yanice.json';
import invalidParentYaniceJson from './fixtures/invalid-parent-project-name.yanice.json';

describe('ConfigVerifier', () => {
    describe('verifyYaniceJsonWithSchema', () => {
        it('should return true for a yanice.json that conforms to the schema', () => {
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(yaniceJson1)).to.equal(true);
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(yaniceJson2)).to.equal(true);
        });

        it('should return false for a yanice.json that does not conform to the schema', () => {
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(null)).to.equal(false);
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(undefined)).to.equal(false);
            expect(ConfigVerifier.verifyYaniceJsonWithSchema({})).to.equal(false);
        });
    });

    describe('verifyDependencyScopeProjectNames', () => {
        it('should return true for a valid yanice.json', () => {
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(yaniceJson1)).to.equal(true);
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(yaniceJson2)).to.equal(true);
        });
        it('should return false for invalid yanice.json that uses projectNames under dependencyScopes which are not defined', () => {
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(invalidChildYaniceJson)).to.equal(false);
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(invalidParentYaniceJson)).to.equal(false);
        });
    })
});
