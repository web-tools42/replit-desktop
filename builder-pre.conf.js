module.exports = {
    appId: 'replit-desktop.replit-discord',
    productName: 'Replit Desktop',
    asar: false,
    generateUpdatesFilesForAllChannels: false,
    npmRebuild: false,
    electronDownload: { cache: `${__dirname}/.cache/electron-download` },
    directories: {
        output: 'build/',
        app: 'ts-out-prod/',
        buildResources: __dirname
    },
    mac: {
        target: { target: 'zip', arch: ['arm64', 'x64'] },
        darkModeSupport: true,
        icon: 'logos/replit-logo/icns/icon.icns'
    },
    win: {
        target: [{ target: 'zip' }, { target: 'portable' }],
        icon: 'logos/replit-logo/logo-clear.png'
    },
    linux: {
        target: {
            target: 'tar.gz'
        },
        //icon: 'src/assets/replit-logo/256x256.png',
        maintainer: 'leon332157',
        category: 'Development'
    }
};
