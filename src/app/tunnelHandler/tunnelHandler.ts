import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ElectronWindow } from '../../common';
import { EventEmitter } from 'events';
// @ts-ignore
const startClient = require('tcp-over-websockets/client');
class TunnelHandler {
    public tunWindow: ElectronWindow;
    constructor() {
        ipcMain.handle('tun-connect', this.connectWs.bind(this));
    }
    connectWs(e: IpcMainInvokeEvent, url: string, remotePort: number, localPort: number) {
        startClient(url, `127.0.0.1:${remotePort}`, localPort, this.connCb.bind(this));
    }
    openWindow() {
        if (!this.tunWindow) this.tunWindow = new ElectronWindow({}, '', true, true);
        this.tunWindow.loadFile(`${__dirname}/tunnel.html`);
        this.tunWindow.once('close', () => {
            delete this.tunWindow;
        });
    }
    connCb(err: any) {
        console.log(err);
        if (err) {
            this.sendStatus(`Error: ${err}`);
        } else {
            this.sendStatus(`Connected`);
        }
    }
    sendStatus(status: string) {
        console.log(`Sent Status ${status}`);
        if (this.tunWindow) this.tunWindow.webContents.send('tun-status-update', status);
    }
}
export { TunnelHandler };
