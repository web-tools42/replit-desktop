import { ElectronWindow, LauncherStatus } from '../common';

class Launcher {
    window: ElectronWindow;

    constructor() {
        this.window = new ElectronWindow(
            {
                show: false,
                resizable: false,
                height: 300,
                width: 250,
                frame: false,
                center: true
            },
            '',
            true
        );
        this.window.loadFile('launcher/launcher.html');
    }

    updateStatus(status: LauncherStatus) {
        this.window.webContents.send('status-update', status);
    }
}

export { Launcher };
