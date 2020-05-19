import { app, dialog, Menu, MessageBoxReturnValue } from 'electron';
import path from 'path';
import DiscordRPC from 'discord-rpc';
import ElectronContext from 'electron-context-menu';
import {
    ElectronWindow,
    getUrl,
    errorMessage,
    handleExternalLink
} from '../common';
// const MessageBoxReturnValue = Electron.MessageBoxReturnValue;

/* Declare Constants */
let mainWindow: ElectronWindow;
let subWindow: ElectronWindow;
const clientId = '498635999274991626';
let startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});
let defaultUserAgent: string;

/* Custom Session Handler */

/*function startCustomSession() {
    ElectronPrompt({
        title: 'Join Multiplayer',
        label: 'URL:',
        value: 'https://repl.it/',
        inputAttrs: {
            type: 'url'
        },
        customStylesheet: path.resolve(__dirname, 'promptDark.css')
    })
        .then((r: any) => {
            if (r === undefined || r === null) {
                return;
            }
            if (
                r.toString().replace(' ', '') === '' ||
                !r.toString().startsWith('https://repl.it/') ||
                !r.toString().includes('repl.co') ||
                !r.toString().includes('repl.run')
            ) {
                dialog.showMessageBox({
                    title: '',
                    message: `Please input a valid URL.`,
                    type: 'info',
                    buttons: ['OK'],
                    defaultId: 0
                });
            } else {
                if (!subWindow.isVisible()) {
                    dialog
                        .showMessageBox({
                            title: '',
                            message: `Do you want to load ${r} in window 2?`,
                            type: 'info',
                            buttons: ['Yes', 'No'],
                            defaultId: 0
                        })
                        .then(function (resp: MessageBoxReturnValue) {
                            const index = resp.response;
                            if (index === 0) {
                                subWindow.loadURL(r);
                            } else {
                            }
                        });
                } else {
                    startSubWindow();
                }
            }
        })
        .catch(console.error);
}*/

function sendSubToMain() {
    if (subWindow) {
        let subUrl = subWindow.webContents.getURL();
        dialog
            .showMessageBox({
                title: '',
                message: `Do you want to load ${subUrl} in window 1?`,
                type: 'info',
                buttons: ['Yes', 'No'],
                defaultId: 0
            })
            .then(function (resp: MessageBoxReturnValue) {
                const index = resp.response;
                if (index === 0) {
                    mainWindow.loadURL(subUrl);
                } else {
                }
            });
    }
}

function startSubWindow() {
    if (subWindow.isVisible()) {
        return;
    }
    let url = mainWindow.webContents.getURL();
    if (!url) {
        url = 'https://repl.it/repls';
    }
    subWindow.loadURL(url);
    subWindow.show();
}

function createSubWindow() {
    subWindow = new ElectronWindow({
        width: mainWindow.getSize()[0] - 10,
        height: mainWindow.getSize()[1] - 10,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png'),
        parent: mainWindow,
        webPreferences: { nodeIntegration: false },
        show: false
    });
    subWindow.setBackgroundColor('#393c42');
    subWindow.InternalId = 2;
    subWindow.webContents.on(
        'did-fail-load',
        (event: any, errorCode: number, errorDescription: string) => {
            errorMessage(subWindow, errorCode, errorDescription);
        }
    );
    subWindow.webContents.on('will-navigate', (event: any, url: string) => {
        handleExternalLink(subWindow, url);
    });
    subWindow.on('unresponsive', () => {
        subWindow.reload();
    });
    subWindow.on('close', (event: any) => {
        event.preventDefault();
        subWindow.hide();
    });
}

function createWindow() {
    mainWindow = new ElectronWindow({
        width: 1280,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        webPreferences: { nodeIntegration: false },
        icon: path.resolve(__dirname, 'utils/logo.png')
    });
    defaultUserAgent = mainWindow.webContents.userAgent;
    mainWindow.InternalId = 1;
    mainWindow.webContents.on(
        'did-fail-load',
        (event: any, errorCode: number, errorDescription: string) => {
            errorMessage(mainWindow, errorCode, errorDescription);
        }
    );
    mainWindow.on('close', () => {
        process.exit(0);
    });
    mainWindow.webContents.on('will-navigate', (event: any, url: string) => {
        // @ts-ignore
        handleExternalLink(mainWindow, url);
    });
    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    });
    mainWindow.loadURL('https://repl.it/repls');
    createSubWindow();
}

ElectronContext({
    showCopyImageAddress: true,
    showSaveImageAs: true,
    showInspectElement: true
});

rpc.login({ clientId }).catch((error: any) => {
    console.error(error);
});
