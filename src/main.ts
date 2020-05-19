import { Launcher, Updater } from './launcher/launcher';
import { app, dialog } from 'electron';

import { checkUpdateResult, downloadUpdateResult } from './common';
import { sep } from 'path';
import os from 'os';
import { mainApp } from './app';

app.setPath(
    'appData',
    app.getPath('home') + sep + '.repl.it' + sep + 'appData' + sep
);
app.setPath(
    'userData',
    app.getPath('home') + sep + '.repl.it' + sep + 'userData' + sep
);
app.allowRendererProcessReuse = true;

let launcher: Launcher;
let updater: Updater;
let main: mainApp;

function initLauncher() {
    launcher = new Launcher();
    launcher.init();
    launcher.window.webContents.once('did-finish-load', () => {
        launcher.window.show();
        initUpdater().then(() => {});
    });
}

function initApp() {
    main = new mainApp();
    main.mainWindow.loadURL('https://repl.it/repls');
    main.mainWindow.webContents.once('did-finish-load', () => {
        main.mainWindow.show();
        launcher.window.close();
    });
}

async function initUpdater() {
    updater = new Updater(launcher);
    let choice: number;
    launcher.updateStatus({ text: 'Checking Update' });
    updater.checkUpdate().then((res: checkUpdateResult) => {
        if (res['hasUpdate']) {
            launcher.updateStatus({ text: 'Update detected' });
            choice = dialog.showMessageBoxSync({
                type: 'info',
                message: `A new update ${res['version']} is available. Do you want to update?`,
                title: 'Update',
                buttons: ['No', 'Yes'],
                defaultId: 1,
                detail: res['changeLog']
            });
            if (choice) {
                launcher.updateStatus({ text: 'Downloading Update' });
                switch (os.platform()) {
                    case 'win32':
                        updater
                            .downloadUpdate(updater.downloadUrls.windowsUrl)
                            .then((e: downloadUpdateResult) => {
                                updater.afterDownloadWin(e.downloadFilePath);
                            });
                        break;
                    case 'darwin':
                        updater
                            .downloadUpdate(updater.downloadUrls.macOSUrl)
                            .then((e: downloadUpdateResult) => {
                                updater.afterDownloadMac(e.downloadFilePath);
                            });
                        break;
                    case 'linux':
                        updater
                            .downloadUpdate(updater.downloadUrls.linuxUrl)
                            .then((e: downloadUpdateResult) => {
                                updater.afterDownloadLinux(e.downloadFilePath);
                            });
                        break;
                    default:
                        break;
                }
            }
        } else {
            if (res['changeLog'] == 'error') {
                launcher.updateStatus({
                    text: 'Check update failed, skipping.'
                });
            }
        }
        launcher.updateStatus({ text: 'Launching app' });
        initApp();
    });
}

app.on('window-all-closed', () => {
    app.quit();
});
app.once('ready', () => {
    initLauncher();
});
