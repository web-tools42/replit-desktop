import { app, ipcMain, ClientRequest } from 'electron';
import {
    ElectronWindow,
    Version,
    checkUpdateResult,
    UpdateAssetsUrls,
    githubReleaseResponse,
    decodeReleaseResponse,
    formatBytes,
    launcherStatus
} from '../common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter2 } from 'eventemitter2';
import fetch from 'node-fetch';
import * as childProcess from 'child_process';

/*class Updater_old {
    pathSep: string = path.sep;
    appPath: string = app.getAppPath() + this.pathSep;
    upperAppPath: string = path.dirname(this.appPath) + this.pathSep;
    baseUrl: string = 'http://replit-electron-updater.leon332157.repl.co/';
    userDesktop: string = app.getPath('desktop');
    logFilePath: string = this.userDesktop + 'updater-log.txt';
    appVersion: string = '0.0.5'; //app.getVersion()
    logArray: [string] = [''];

    constructor() {
        console.log(`Log File Path: ${this.logFilePath}`);
    }

    log(message: string) {
        console.log(message);
        this.logArray.push(message);
    }

    async check() {
        try {
            const serverResponse = await axios.get(this.baseUrl + 'check', {
                params: { version: this.appVersion },
                timeout: 10000
            });
            if (serverResponse.status !== 200) {
                throw Error(
                    `Server response code is ${serverResponse.status} instead of 200`
                );
            }
            this.log(
                `Successfully requested to sever, response ${serverResponse}`
            );
            const responseObject = JSON.parse(serverResponse.data);

            if (
                responseObject.hasUpdate ||
                responseObject.version ||
                responseObject.changeLog
            ) {
                return {
                    success: true,
                    hasUpdate: true,
                    version: responseObject.version,
                    changeLog: responseObject.changeLog
                };
            } else {
                return {
                    success: false,
                    hasUpdate: null,
                    version: null,
                    changeLog: null
                };
            }
        } catch (e) {
            this.log(`Error: ${e}`);
            return { success: false, hasUpdate: false };
        }
    }

    async download(version: string) {
        try {
            const serverResponse = await axios.get(
                this.baseUrl + `download/${version}`,
                { timeout: 10000 }
            );
            if (serverResponse.status !== 200) {
                throw Error(
                    `Server response code is ${serverResponse.status} instead of 200`
                );
            }
            let raw_file = decode(serverResponse.data);
            try {
                fs.writeFileSync(this.appPath, raw_file, 'base64');
                this.log('Successfully applied file.');
                return { success: true };
            } catch (e) {
                this.log(e);
                return { success: false };
            }
        } catch (e) {
            this.log(e);
            return { success: false };
        }
    }
}*/

class Updater {
    pathSep: string = path.sep;
    appPath: string = app.getAppPath() + this.pathSep;
    upperAppPath: string = path.dirname(this.appPath) + this.pathSep;
    userDesktop: string = app.getPath('desktop');
    logFilePath: string = this.userDesktop + 'updater-log.txt';
    appVersion: Version; //app.getVersion()
    logArray: [string] = [''];
    OS: string = '';
    downloadPath: string =
        app.getPath('appData') + 'updaterDownload' + this.pathSep;
    downloadUrls: UpdateAssetsUrls = {
        windowsUrl: '',
        macOSUrl: '',
        linuxUrl: ''
    };
    launcher: Launcher;

    constructor(launcher: Launcher) {
        /*this.appVersion = {
            major: parseInt(app.getVersion().split('.')[0]),
            minor: parseInt(app.getVersion().split('.')[1]),
            patch: parseInt(app.getVersion().split('.')[2]),
            versionString: app.getVersion()
        };*/
        this.appVersion = {
            major: 0,
            minor: 0,
            patch: 5,
            versionString: '0.0.5'
        };
        this.launcher = launcher;
    }

    async checkUpdate(): Promise<checkUpdateResult> {
        try {
            const res: githubReleaseResponse = decodeReleaseResponse(
                await (
                    await fetch(
                        'https://api.github.com/repos/repl-it-discord/repl-it-electron/releases/latest'
                    )
                ).json()
            );

            const tagNames = res.tag_name.split('.');
            const changeLog = res.body;
            const version: Version = {
                major: parseInt(tagNames[0]),
                minor: parseInt(tagNames[1]),
                patch: parseInt(tagNames[2])
            };
            for (let x = 0; x < res.assets.length; x++) {
                const asset = res.assets[x];
                if (asset.name.includes('exe') || asset.name.includes('win')) {
                    this.downloadUrls.windowsUrl = asset.browser_download_url;
                } else if (asset.name.includes('dmg')) {
                    this.downloadUrls.macOSUrl = asset.browser_download_url;
                } else if (asset.name.includes('tar.gz')) {
                    this.downloadUrls.linuxUrl = asset.browser_download_url;
                } else {
                }
            }

            if (
                version.patch > this.appVersion.patch ||
                version.minor > this.appVersion.minor ||
                version.major > this.appVersion.major
            ) {
                return {
                    hasUpdate: true,
                    changeLog: changeLog,
                    version: res.tag_name
                };
            } else {
                return { hasUpdate: false };
            }
        } catch (e) {
            console.error(e);
            return { hasUpdate: false, changeLog: 'error' };
        }
    }

    async downloadUpdate(): Promise<object> {
        try {
            //console.log(this.downloadUrls);
            const req = await fetch(
                this.downloadUrls.windowsUrl
                //'http://ipv4.download.thinkbroadband.com/200MB.zip',
            );
            console.log(this.downloadUrls);

            const contentLength: number = parseInt(
                req.headers.get('content-length')
            );
            const filename = this.downloadUrls.windowsUrl.split('/').pop();
            let downloaded: number = 0;
            const downloadFile: string = this.downloadPath + filename;
            console.log(downloadFile);
            try {
                fs.mkdirSync(this.downloadPath, { recursive: true });
            } catch (e) {
                console.log(e);
                return { success: false };
            }
            req.body
                .on('data', (chunk: Buffer) => {
                    downloaded += chunk.length;
                    const percentage = Math.floor(
                        (downloaded / contentLength) * 100
                    );
                    this.launcher.updateStatus({
                        text: `${formatBytes(downloaded)}/${formatBytes(
                            contentLength
                        )}`,
                        percentage: percentage.toString() + '%'
                    });
                })
                .pipe(fs.createWriteStream(downloadFile));
            req.body.on('end', () => {
                this.launcher.updateStatus({ text: 'Download Finished' });
            });
            switch (os.platform()) {
                case 'win32':
                    //childProcess.exec('cmd -c ' + this.downloadPath);
                    break;
                case 'darwin':
                    break;
                case 'linux':
                    break;
                default:
                    break;
            }
            return { success: true };
            //TODO: Download newer version exe installer and prompt install.
        } catch (e) {
            return { success: false };
        }
        //TODO: Download newer version dmg? and open it.
        //TODO: Download newer version tar.gz? and auto-install it.
    }
}

class Launcher {
    window: ElectronWindow;

    constructor() {
        this.window = new ElectronWindow({
            show: false,
            //resizable: false,
            height: 300,
            width: 250,
            frame: false,
            webPreferences: { nodeIntegration: true, devTools: true }
        });
    }

    init() {
        this.window.loadFile('launcher/launcher.html').then();
    }

    updateStatus(status: launcherStatus) {
        this.window.webContents.send('status-update', status);
    }
}

export { Launcher, Updater };
