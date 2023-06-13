const path = require('node:path');

function absolutePath(relativePath) {
    return path.join(__dirname, relativePath);
}

const dummyResolver = {
    getImportMap: () => {
        return {
            [absolutePath('project-A/empty.txt')]: [absolutePath('project-B/empty.txt')]
        };
    }
};
module.exports = dummyResolver;
