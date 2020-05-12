import { app, ipcMain } from 'electron';
import { ElectronWindow } from '../class';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import { decode } from '../lib/run-length-helper';
import * as os from 'os';

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

interface Version {
    major: number;
    minor: number;
    patch: number;
}

class Updater {
    pathSep: string = path.sep;
    appPath: string = app.getAppPath() + this.pathSep;
    upperAppPath: string = path.dirname(this.appPath) + this.pathSep;
    apiUrl: string = 'https://api.github.com';
    userDesktop: string = app.getPath('desktop');
    logFilePath: string = this.userDesktop + 'updater-log.txt';
    appVersion: Version; //app.getVersion()
    logArray: [string] = [''];
    downloadString: string = '';

    constructor() {
        /*this.appVersion = {
            major: parseInt(app.getVersion().split('.')[0]),
            minor: parseInt(app.getVersion().split('.')[1]),
            patch: parseInt(app.getVersion().split('.')[2])
        };*/
        this.appVersion = { major: 0, minor: 0, patch: 5 };
        this.downloadString = this.detectOS();
    }

    detectOS() {
        switch (os.platform()) {
            case 'win32':
                return 'repl.it-win32-' + os.arch() + '.zip';
            case 'darwin':
                return 'repl.it.dmg';
            //case 'linux':
            //    return 'repl.it-linux-' + os.arch() + '.zip';
            default:
                return 'Error';
        }
    }

    async checkUpdate() {
        try {
            const res: AxiosResponse = await axios.get(
                'https://api.github.com/repos/repl-it-discord/repl-it-electron/releases/latest'
            );
            const tagNames = res.data['tag_name'].split('.');
            const version: Version = {
                major: parseInt(tagNames[0]),
                minor: parseInt(tagNames[1]),
                patch: parseInt(tagNames[2])
            };
            if (
                version.patch > this.appVersion.patch ||
                version.minor > this.appVersion.minor ||
                version.major > this.appVersion.major
            ) {
                // console.log('Update Detected.');
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
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
            webPreferences: { nodeIntegration: true }
        });
    }

    init() {
        this.window.loadFile('launcher/launcher.html').then();
    }

    updateStatus(status: string) {
        this.window.webContents.send('status-update', status);
        //console.log('Status updated');
    }
}

export { Launcher, Updater };
