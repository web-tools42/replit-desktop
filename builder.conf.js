module.exports = {
    appId: 'replit-desktop.replit-discord',
    productName: 'Replit Desktop',
    generateUpdatesFilesForAllChannels: false,
    npmRebuild: false,
    electronDownload: { cache: `${__dirname}/.cache/electron-download` },
    directories: {
        output: 'build/',
        app: 'ts-out-prod/',
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
