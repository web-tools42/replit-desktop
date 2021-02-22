Object.defineProperty(exports, "__esModule", { value: true });
const launcher_1 = require("./launcher/launcher");
const electron_1 = require("electron");
const path = require("path");
const common_1 = require("./common");
const app_1 = require("./app/app");
electron_1.app.setPath('appData', path.join(electron_1.app.getPath('home'), '.repl.it', 'appData'));
electron_1.app.setPath('userData', path.join(electron_1.app.getPath('home'), '.repl.it', 'userData'));
electron_1.app.disableHardwareAcceleration();
process.on('unhandledRejection', (rejection) => {
    console.error(`[Unhandled Promise Rejction] ${rejection.stack}`);
});
let launcher;
let updater;
let mainApp;
function initLauncher() {
    launcher = new launcher_1.Launcher();
    launcher.init();
    launcher.window.webContents.once('did-finish-load', () => {
        launcher.window.show();
        initUpdater().then(() => { });
    });
}
async function initApp() {
    mainApp = new app_1.App();
    mainApp.mainWindow.loadURL('https://repl.it/~').catch(console.debug);
    await mainApp.clearCookies(true);
    mainApp.mainWindow.webContents.once('did-finish-load', () => {
        launcher.window.close();
    });
    mainApp.mainWindow.on('close', () => electron_1.app.quit());
}
async function initUpdater() {
    updater = new launcher_1.Updater(launcher);
    if (process.execPath.includes('electron')) {
        updater.cleanUp(true);
    }
    launcher.updateStatus({ text: 'Checking Update' });
    const res = await updater.checkUpdate();
    if (res['changeLog'] == 'error') {
        launcher.updateStatus({
            text: 'Check update failed, skipping.'
        });
        updater.cleanUp(true);
    }
    updater.once('download-error', (e) => {
        console.error(e);
        updater.cleanUp();
    });
    updater.once('all-done', () => {
        launcher.updateStatus({ text: 'Launching app' });
        initApp();
    });
    if (res['hasUpdate']) {
        launcher.updateStatus({ text: 'Update detected' });
        if (common_1.promptYesNoSync(`A new update ${res['version']} is available. Do you want to update?`, 'Update Available', res['changeLog'])) {
            launcher.updateStatus({ text: 'Downloading Update' });
            updater.once('download-finished', updater.afterDownload);
            switch (common_1.PLATFORM) {
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
    }
    else {
        updater.cleanUp(true);
    }
}
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
electron_1.app.once('ready', () => {
    initLauncher();
});
