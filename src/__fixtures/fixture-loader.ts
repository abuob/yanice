import fs from 'node:fs';
import path from 'node:path';

type fixtureType =
    | 'invalid-child-project-name.yanice.json'
    | 'invalid-multi-extension.yanice.json'
    | 'invalid-parent-project-name.yanice.json'
    | 'readme-example-yanice.json'
    | 'valid-1.yanice.json'
    | 'valid-2.yanice.json'
    | 'valid-3.yanice.json'
    | 'valid-4.yanice.json';

export class FixtureLoader {
    public static getFixture(fixture: fixtureType): any {
        switch (fixture) {
            case 'invalid-child-project-name.yanice.json':
                return FixtureLoader.loadFixture('./invalid/invalid-child-project-name.yanice.json');
            case 'invalid-multi-extension.yanice.json':
                return FixtureLoader.loadFixture('./invalid/invalid-multi-extension.yanice.json');
            case 'invalid-parent-project-name.yanice.json':
                return FixtureLoader.loadFixture('./invalid/invalid-parent-project-name.yanice.json');
            case 'readme-example-yanice.json':
            case 'valid-1.yanice.json':
            case 'valid-2.yanice.json':
            case 'valid-3.yanice.json':
            case 'valid-4.yanice.json':
                return FixtureLoader.loadFixture(`./${fixture}`);
            default:
                throw new Error(`No fixture defined: ${fixture}`);
        }
    }

    private static loadFixture(fixturePath: string): any {
        const filePath: string = path.join(__dirname, fixturePath);
        const fileContent: string = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return JSON.parse(fileContent);
    }
}
