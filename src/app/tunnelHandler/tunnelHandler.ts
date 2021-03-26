import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ElectronWindow } from '../../common';
import { EventEmitter } from 'events';
// @ts-ignore
const startClient = require('tcp-over-websockets/client');
class TunnelHandler extends EventEmitter {
    public tunWindow: ElectronWindow;
    constructor() {
        super();
        ipcMain.handle('tun-connect', this.connectWs);
    }
    connectWs(e: IpcMainInvokeEvent, url: string, remotePort: number, localPort: number) {
        startClient(url, `127.0.0.1:${remotePort}`, localPort, this.connCb);
    }
    openWindow() {
        this.tunWindow = new ElectronWindow({}, '', true);
        this.tunWindow.loadFile(`${__dirname}/tunnel.html`);
    }
    connCb(err) {
        if (err) {
            this.sendStatus(`Error: ${err}`);
        } else {
            this.sendStatus(`Connected`);
        }
    }
    sendStatus(status: string) {
        ipcMain.emit('tun-status-update', status);
    }
}
export { TunnelHandler };
