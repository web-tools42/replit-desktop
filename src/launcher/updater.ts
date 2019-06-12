import {app} from 'electron';
import 'fs';
import 'axios';
import * as path from 'path';
import Axios from 'axios';

class Updater {
    pathSep: string = path.sep;
    appPath: string = app.getAppPath() + this.pathSep;
    upperAppPath: string = path.dirname(this.appPath) + this.pathSep;
    baseUrl: string = 'http://replit-electron-updater.leon332157.repl.co/';
    userDesktop: string = app.getPath('desktop');
    logFilePath: string = this.userDesktop + 'updater-log.txt';
    version: string = '0.0.5';//app.getVersion()
    logArray: [string] = [''];

    constructor() {
        console.log(`Log File Path: ${this.logFilePath}`);
    }

    log(message: string) {
        console.log(message);
        this.logArray.push(message);
    }

    async check() {
        const appVersion = app.getVersion();
        try {
            const serverResponse = await Axios.get(this.baseUrl + 'check', {
                params: {'version': appVersion},
                timeout: 10000,
            });
            if (serverResponse.status !== 200) {
                throw Error(`Server response code is ${serverResponse.status} instead of 200`);
            }
            this.log(`Successfully requested to sever, response ${serverResponse}`);
            const responseObject = JSON.parse(serverResponse.data);

            if (responseObject.hasUpdate || responseObject.version || responseObject.changeLog) {
                return {
                    success: true,
                    hasUpdate: true,
                    version: responseObject.version,
                    changeLog: responseObject.changeLog,
                };
            } else {
                return {success: false, hasUpdate: null, version: null, changeLog: null};
            }
        } catch (e) {
            this.log(`Error: ${e}`);
            return {success: false, hasUpdate: false};
        }
    }
}

var t = new Updater();