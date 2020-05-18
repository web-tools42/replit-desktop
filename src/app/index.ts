import { ElectronWindow } from '../common';

class mainApp {
    mainWindow: ElectronWindow;
    constructor() {
        this.mainWindow = new ElectronWindow({
            show: false,
            //resizable: false,
            height: 800,
            width: 600
        });
    }
}
export { mainApp };
