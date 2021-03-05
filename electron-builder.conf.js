module.exports = {
    appId: 'replit-desktop.replit-discord',
    productName: 'Replit Desktop',
    generateUpdatesFilesForAllChannels: false,
    directories: {
        output: 'build/',
        app: 'dist/',
        buildResources: __dirname
    },
    mac: {
        target: 'dmg',
        darkModeSupport: true,
        icon: 'logos/replit-logo/icns/512x512.icns'
    },
    dmg: { writeUpdateInfo: false },
    win: {
        target: 'nsis',
        icon: 'logos/replit-logo/logo-clear.png'
    },
    nsis: {
        oneClick: false,
        differentialPackage: false,
        allowToChangeInstallationDirectory: true,
        differentialPackage: false,
        //perMachine: true,
        createDesktopShortcut: true
    },
    linux: {
        target: {
            target: 'deb'
        },
        //icon: 'src/assets/replit-logo/256x256.png',
        maintainer: 'leon332157',
        category: 'Development'
    }
};
