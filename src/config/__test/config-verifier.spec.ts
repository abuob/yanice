import { expect } from "chai";
import { ConfigVerifier } from '../config-verifier'
import yaniceJson1 from '../../__fixtures/valid-2.yanice.json';
import yaniceJson2 from '../../__fixtures/valid-3.yanice.json';
import readmeYaniceJson from '../../__fixtures/readme-example-yanice.json';
import invalidChildYaniceJson from '../../__fixtures/invalid/invalid-child-project-name.yanice.json';
import invalidParentYaniceJson from '../../__fixtures/invalid/invalid-parent-project-name.yanice.json';

describe('ConfigVerifier', () => {
    describe('verifyYaniceJsonWithSchema', () => {
        it('should return true for a yanice.json that conforms to the schema', () => {
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(yaniceJson1)).to.equal(true);
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(yaniceJson2)).to.equal(true);
            expect(ConfigVerifier.verifyYaniceJsonWithSchema(readmeYaniceJson)).to.equal(true);
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
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(yaniceJson2 as any)).to.equal(true);
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(readmeYaniceJson as any)).to.equal(true);
        });
        it('should return false for invalid yanice.json that uses projectNames under dependencyScopes which are not defined', () => {
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(invalidChildYaniceJson)).to.equal(false);
            expect(ConfigVerifier.verifyDependencyScopeProjectNames(invalidParentYaniceJson)).to.equal(false);
        });
    })
});
