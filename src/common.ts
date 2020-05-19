import {
    app,
    BrowserWindow,
    shell,
    dialog,
    MessageBoxReturnValue
} from 'electron';
import { Endpoints } from '@octokit/types';

class ElectronWindow extends BrowserWindow {
    public InternalId = -1;
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

function decodeReleaseResponse(resp: object): githubReleaseResponse {
    // @ts-ignore
    return Object.assign({}, resp);
}

function errorMessage(
    windowObject: ElectronWindow,
    errorCode: any,
    errorDescription: any
) {
    let id = windowObject.InternalId;
    if (errorCode > -6 || errorCode <= -300) {
        return;
    }
    dialog
        .showMessageBox({
            title: 'Loading Failed',
            message: `loading Failed on window ${id} reason ${errorDescription} code ${errorCode}, do you want to try again?`,
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

function handleExternalLink(windowObj: ElectronWindow, url: string) {
    console.log(`External URL: ${url}`);
    if (!url) {
        return;
    }
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://repl.it/repls');
    } else if (
        url.toString().includes('repl.it') ||
        url.toString().includes('repl.co') ||
        url.toString().includes('google.com') ||
        url.toString().includes('repl.run')
    ) {
    } else {
        dialog
            .showMessageBox({
                title: 'Confirm External Links',
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ['No', 'Yes'],
                defaultId: 1
            })
            .then(function (resp: MessageBoxReturnValue) {
                var index = resp.response;
                if (index === 1) {
                    shell.openExternal(url);
                    if (windowObj.webContents.canGoBack()) {
                        windowObj.webContents.goBack();
                    }
                } else {
                    if (windowObj.webContents.canGoBack()) {
                        windowObj.webContents.goBack();
                    }
                }
            });
    }
}

function formatBytes(bytes: number, decimals: number = 1) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export {
    Version,
    checkUpdateResult,
    ElectronWindow,
    UpdateAssetsUrls,
    githubReleaseResponse,
    decodeReleaseResponse,
    formatBytes,
    launcherStatus,
    downloadUpdateResult,
    errorMessage,
    getUrl,
    handleExternalLink
};
