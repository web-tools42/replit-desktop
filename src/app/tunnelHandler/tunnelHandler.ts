import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ElectronWindow } from '../../common';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
// @ts-ignore
const startClient = require('tcp-over-websockets/client');
class TunnelHandler {
    public tunWindow: ElectronWindow;
    private conn: any;
    constructor() {
        ipcMain.handle('tun-connect', this.connectWs.bind(this));
        ipcMain.handle('tun-disconnect', this.disconnectWs.bind(this));
    }
    connectWs(e: IpcMainInvokeEvent, url: string, remotePort: number, localPort: number) {
        if (this.conn) return;
        fetch(url)
            .then(() => {
                this.conn = startClient(url, `127.0.0.1:${remotePort}`, localPort, this.connCb.bind(this));
            })
            .catch((err) => {
                this.sendStatus(err.toString());
            });
    }
    disconnectWs(e: IpcMainInvokeEvent) {}
    openWindow() {
        if (!this.tunWindow) this.tunWindow = new ElectronWindow({}, '', true, true);
        this.tunWindow.loadFile(`${__dirname}/tunnel.html`);
        this.tunWindow.once('close', () => {
            this.tunWindow.destroy();
            this.conn.destroy();
        });
    }
    connCb(err: any) {
        if (err) {
            this.sendStatus(`Error: ${err}`);
            this.conn.destroy();
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
