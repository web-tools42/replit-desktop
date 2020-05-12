import { Launcher, Updater } from './launcher/launcher';
import { app, dialog } from 'electron';
import { types } from 'util';

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
    updater.checkUpdate().then((hasUpdate) => {
        if (hasUpdate) {
            launcher.updateStatus('Update detected');
            const choice = dialog.showMessageBoxSync({
                type: 'info',
                message: 'A new update is available. Do you want to update?',
                title: 'Update',
                buttons: ['No', 'Yes'],
                defaultId: 1
                //detail:changelog
            });
            //TODO: Add changelog.
        }
    });
}

app.once('ready', function () {
    initLauncher();
});
