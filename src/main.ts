import { Launcher, Updater } from './launcher/launcher';
import { app, dialog } from 'electron';
import { checkUpdateResult } from './common';
import os from 'os';

let launcher: Launcher;
let updater: Updater;

function initLauncher() {
    launcher = new Launcher();
    launcher.init();
    launcher.window.webContents.once('did-finish-load', () => {
        launcher.window.show();
        initUpdater();
    });
}

function initUpdater() {
    updater = new Updater();
    let choice: number;
    updater.checkUpdate().then((res: checkUpdateResult) => {
        if (res['hasUpdate']) {
            launcher.updateStatus('Update detected');
            choice = dialog.showMessageBoxSync({
                type: 'info',
                message: `A new update ${res['version']} is available. Do you want to update?`,
                title: 'Update',
                buttons: ['No', 'Yes'],
                defaultId: 1,
                detail: res['changeLog']
            });
            console.log(choice);
            if (choice) {
                launcher.updateStatus('Downloading Update');
                updater.on('update-progress', (e) => {
                    launcher.updateStatus(`Downloaded: ${e[0]}`);
                });
                switch (os.platform()) {
                    case 'win32':
                        updater.downloadUpdateWin();
                        break;
                    case 'darwin':
                        updater.downloadUpdateMac();
                        break;
                    case 'linux':
                        updater.downloadUpdateLinux();
                        break;
                    default:
                        return 'Error';
                }
            }
        } else {
            if (res['changeLog'] == 'error') {
                launcher.updateStatus('Check update failed, skipping.');
            }
        }
    });
}

app.once('ready', function () {
    initLauncher();
});
