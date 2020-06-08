import {
    app,
    BrowserWindow,
    shell,
    dialog,
    MessageBoxReturnValue,
    BrowserWindowConstructorOptions
} from 'electron';
import { Endpoints } from '@octokit/types';
import { platform } from 'os';

class ElectronWindow extends BrowserWindow {
    constructor(
        options: BrowserWindowConstructorOptions,
        nodeIntegration: boolean = false
    ) {
        super({
            ...options,
            webPreferences: {
                devTools: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                nodeIntegration: nodeIntegration,
                spellcheck: true
            },
            icon: __dirname + '/256x256.png'
        });
    }
}

interface Version {
    major: number;
    minor: number;
    patch: number;
    versionString?: string;
}

interface checkUpdateResult {
    hasUpdate: boolean;
    changeLog?: string;
    version?: string;
}

interface downloadUpdateResult {
    success: boolean;
    downloadFilePath?: string;
    error?: string;
}

interface UpdateAssetsUrls {
    windowsUrl: string;
    macOSUrl: string;
    linuxUrl: string;
}

interface launcherStatus {
    text: string;
    downloaded?: number;
    totalLength?: number;
    percentage?: string;
}

type githubReleaseResponse = Endpoints['GET /repos/:owner/:repo/releases/latest']['response']['data'];

function errorMessage(
    windowObject: ElectronWindow,
    errorCode: any,
    errorDescription: any
) {
    //let id = windowObject.InternalId;
    if (errorCode > -6 || errorCode <= -300) {
        return;
    }
    dialog
        .showMessageBox({
            title: 'Loading Failed',
            message: `loading Failed on window reason ${errorDescription} code ${errorCode}, do you want to try again?`,
            type: 'error',
            buttons: ['Try again please', 'Quit'],
            defaultId: 0
        })
        .then(function (resp: MessageBoxReturnValue) {
            // if clicked "Try again please"
            const index = resp.response;
            if (index === 0) {
                windowObject.reload();
            } else {
                process.exit();
            }
        });
}

function capitalize(str: string) {
    return str.replace(/(^|\s)([a-z])/g, function (p1: String, p2: String) {
        return p1 + p2.toUpperCase().toString();
    });
}

function getUrl(windowObj: ElectronWindow) {
    try {
        let url = windowObj.webContents
            .getURL()
            .replace(/(^\w+:|^)\/\/repl\.it\//, '');
        url = url.split('?')[0];
        return url;
    } catch (e) {
        return '';
    }
}

function selectInput(focusedWindow: ElectronWindow) {
    focusedWindow.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].focus().select()`,
        false
    );
}

function handleExternalLink(
    event: Event,
    windowObj: ElectronWindow,
    url: string
) {
    if (!url) {
        return;
    }
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://repl.it/~').then();
    } else if (
        url.includes('repl.it') ||
        url.includes('repl.co') ||
        url.includes('google.com') ||
        url.includes('repl.run')
    ) {
    } else {
        console.log(`External URL: ${url}`);
        event.preventDefault();
        dialog
            .showMessageBox({
                title: 'Confirm External Links',
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ['No', 'Yes'],
                defaultId: 1
            })
            .then(function (resp: MessageBoxReturnValue) {
                const index = resp.response;
                if (index === 1) {
                    shell.openExternal(url).then();
                } else {
                }
            });
    }
}

function promptYesNoSync(
    message: string,
    title: string,
    detail?: string
): number {
    return dialog.showMessageBoxSync({
        type: 'info',
        message: message,
        title: title,
        buttons: ['No', 'Yes'],
        defaultId: 1,
        detail: detail
    });
}

const PLATFORM = platform();
export {
    Version,
    checkUpdateResult,
    ElectronWindow,
    UpdateAssetsUrls,
    githubReleaseResponse,
    launcherStatus,
    downloadUpdateResult,
    errorMessage,
    getUrl,
    handleExternalLink,
    selectInput,
    PLATFORM,
    promptYesNoSync
};
