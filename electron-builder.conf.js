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
        target: 'dmg',
        icon: 'src/assets/replit-logo/icns/icon.icns'
    },
    win: {
        target: {
            target: 'nsis',
            arch: ['ia32', 'x64']
        },
        icon: 'src/assets/replit-logo/ico/logo.ico'
    },
    linux: {
        target: {
            target: 'AppImage',
            arch: ['x64']
        },
        icon: 'src/assets/replit-logo/logo.png'
    }
};
