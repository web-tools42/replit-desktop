const electronVersion = JSON.parse(
    require('fs').readFileSync('package.json')
).devDependencies.electron.replace('^', '');
module.exports = {
    appId: 'repl-it-electron.repl-it-discord',
    electronVersion: electronVersion,
    directories: {
        output: 'build/',
        app: 'dist/',
        buildResources: __dirname
    },
    mac: {
        target: 'pkg',
        icon: 'src/assets/replit-logo/icns/icon.icns'
    },
    pkg: {
        isVersionChecked: false,
        hasStrictIdentifier: false,
        overwriteAction: 'upgrade'
    },
    win: {
        target: {
            target: 'nsis'
        },
        icon: 'src/assets/replit-logo/ico/logo.ico'
    },
    linux: {
        target: {
            target: 'tar.gz'
        },
        icon: 'src/assets/replit-logo/logo.png'
    }
};
