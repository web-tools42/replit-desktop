module.exports = {
    appId: 'repl-it-electron.repl-it-discord',
    directories: {
        output: 'build/',
        app: 'dist/',
        buildResources: __dirname
    },
    mac: {
        target: 'pkg',
        icon: 'src/assets/replit-logo/icns/lcon_set.icns'
    },
    pkg: {
        isVersionChecked: false,
        hasStrictIdentifier: false,
        overwriteAction: 'upgrade'
    },
    win: {
        target: 'nsis',
        icon: 'src/assets/replit-logo/ico/logo.ico'
    },
    nsis: {
        oneClick: false,
        differentialPackage: false,
        //perMachine: true,
        createDesktopShortcut: 'always'
    },
    linux: {
        target: {
            target: 'deb'
        },
        icon: 'src/assets/replit-logo/logo.png'
    }
};
