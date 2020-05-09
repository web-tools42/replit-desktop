import { app } from 'electron';
import { ElectronWindow } from '../class';

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

    initalize() {
        this.window.loadFile('launcher/launcher.html');
    }
}

export { Launcher };
