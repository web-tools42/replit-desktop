import { BrowserWindow, net } from 'electron';
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

function decodeReleaseResponse(resp: object): githubReleaseResponse {
    // @ts-ignore
    return Object.assign({}, resp);
}

type githubReleaseResponse = Endpoints['GET /repos/:owner/:repo/releases/latest']['response']['data'];

function formatBytes(bytes: number, decimals: number = 2) {
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
    formatBytes
};
