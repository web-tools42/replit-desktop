import { app, BrowserWindow } from 'electron';
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

function decodeReleaseResponse(resp: object): githubReleaseResponse {
    // @ts-ignore
    return Object.assign({}, resp);
}

type githubReleaseResponse = Endpoints['GET /repos/:owner/:repo/releases/latest']['response']['data'];

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
    launcherStatus
};
