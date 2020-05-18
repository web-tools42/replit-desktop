import { app, dialog, Menu, MessageBoxReturnValue } from 'electron';
import path from 'path';
import DiscordRPC from 'discord-rpc';
import ElectronContext from 'electron-context-menu';
import {
    ElectronWindow,
    editing,
    talkBoard,
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

async function setPlayingDiscord() {
    let url = getUrl(mainWindow);
    let spliturl = url.split('/');

    if (spliturl[0] === 'repls') {
        rpc.setActivity({
            details: `Browsing Repls`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).then();
    } else if (spliturl[0] === 'talk') {
        talkBoard(spliturl, mainWindow).then(
            (res: any) => {
                rpc.setActivity({
                    state: `${res.viewing}`,
                    details: `In Repl Talk ${res.talkBoard}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    smallImageKey: 'talk',
                    smallImageText: 'Repl Talk',
                    instance: false
                }).catch((reason: string) => {
                    console.error(`error@talk board ${reason}`);
                });
            },
            (reason: string) => {
                console.error(`Set Talk board Failed ${reason}`);
            }
        );
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        editing(mainWindow).then(
            (res: any) => {
                rpc.setActivity({
                    details: `Editing: ${res.fileName}`,
                    state: `${url} `,
                    startTimestamp,
                    smallImageKey: 'logo',
                    smallImageText: 'Repl.it',
                    largeImageKey: res.lang,
                    largeImageText: res.lang,
                    instance: false
                }).catch((reason: string) => {
                    console.error(`error@editing ${reason}`);
                });
            },
            (reason: string) => {
                console.error(`Set editing failed ${reason}`);
            }
        );
    } else if (spliturl[0] === 'talk') {
        rpc.setActivity({
            details: `In Repl Talk`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'talk',
            largeImageText: 'Repl Talk',
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.error(`error@talk ${reason}`);
        });
    } else if (spliturl[0][0] === '@') {
        rpc.setActivity({
            details: `Looking at ${spliturl[0]}'s profile`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.debug(`error@profile ${reason}`);
        });
    } else if (spliturl[0] === 'account') {
        rpc.setActivity({
            details: `Changing account settings`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.debug(`error@acount ${reason}`);
        });
    } else {
        rpc.setActivity({
            details: `On Repl.it`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.error(`error@main ${reason}`);
        });
    }
}

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

rpc.on('ready', () => {
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord().catch((reason) => {
            console.log('Failed to update Discord status. ' + reason);
        });
    }, 15e3);
});

rpc.login({ clientId }).catch((error: any) => {
    console.error(error);
});
