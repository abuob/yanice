const dummyPlugin = {
    execute: (phase3Result) => {
        console.log('[DUMMY-PLUGIN] triggered');
        console.log(phase3Result.phase2Result.phase1Result.yaniceJsonDirectoryPath);
    }
};

module.exports = dummyPlugin;
