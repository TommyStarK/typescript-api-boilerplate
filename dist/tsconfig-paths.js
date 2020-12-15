const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');
const baseUrl = './dist/src'; // Either absolute or relative path. If relative it's resolved to current working directory.
tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths,
});
//# sourceMappingURL=tsconfig-paths.js.map