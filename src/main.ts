import { app } from 'electron';

import { App } from './app/app';
import { PLATFORM, promptYesNoSync } from './common';
import { Launcher } from './launcher/launcher';
import { Updater } from './launcher/updater';

import path = require('path');

app.setName('Replit Desktop');
app.setPath('appData', path.join(app.getPath('home'), '.replit', 'appData'));
app.setPath('userData', path.join(app.getPath('home'), '.replit', 'userData'));
//app.commandLine.appendArgument('disable-http-cache');
//app.commandLine.appendSwitch('disk-cache-dir', 'null');
//app.commandLine.appendSwitch('disk-cache-size', '0');

app.disableHardwareAcceleration();
console.log(`Version: ${app.getVersion()}`);

process.on('unhandledRejection', (rejection: any) => {
    console.error(`[Unhandled Promise Rejction] ${rejection.stack}`);
});

let launcher: Launcher;
let updater: Updater;
let mainApp: App;
const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) app.quit();

function initLauncher() {
    launcher = new Launcher();
    launcher.window.webContents.once('did-finish-load', () => {
        initUpdater();
    });
}

async function initApp() {
    mainApp = new App();
    mainApp.mainWindow.loadURL('https://replit.com/~').catch(console.debug);
    mainApp.mainWindow.webContents.once('did-finish-load', () => {
        launcher.window.close();
    });
}

async function initUpdater() {
    updater = new Updater(launcher);
    updater.once('download-error', (e) => {
        console.error(e);
        updater.cleanUp();
    });
    updater.once('all-done', () => {
        launcher.updateStatus({ text: 'Launching app' });
        initApp();
    });
    if (process.execPath.includes('electron')) {
        updater.cleanUp(true);
        return;
    }
    launcher.updateStatus({ text: 'Checking Update' });
    const res = await updater.checkUpdate();
    if (res['changeLog'] == 'error') {
        launcher.updateStatus({
            text: 'Check update failed, skipping.'
        });
        updater.cleanUp(true);
    }
    if (res['hasUpdate']) {
        launcher.updateStatus({ text: 'Update detected' });
        if (
            promptYesNoSync(
                `A new update ${res['version']} is available. Do you want to update?`,
                'Update Available',
                res['changeLog']
            )
        ) {
            launcher.updateStatus({ text: 'Downloading Update' });
            updater.once('download-finished', updater.afterDownload);
            switch (PLATFORM) {
                case 'win32':
                    await updater.downloadUpdate(updater.downloadUrls.windowsUrl);
                    break;
                case 'darwin':
                    await updater.downloadUpdate(updater.downloadUrls.macOSUrl);
                    break;
                case 'linux':
                    await updater.downloadUpdate(updater.downloadUrls.linuxUrl);
                    break;
            }
        }
    } else {
        updater.cleanUp(true);
    }
}

app.on('window-all-closed', () => {
    app.quit();
    process.exit();
});
app.once('ready', () => {
    initLauncher();
});
