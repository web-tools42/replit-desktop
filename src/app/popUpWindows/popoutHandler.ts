import { ipcMain } from "electron";
import { ElectronWindow } from '../../common';

class PopoutHandler {
    constructor() {
      ipcMain.on('Popup', (event, status) => {
           this.launch();
      })
    }

    launch() {
        let Terminal = new ElectronWindow({ width: 600, height: 600, webPreferences: {
          preload: `${__dirname}/console.js`,
          nodeIntegration: true
          }
        });
        console.log(`${__dirname}/console.js`)
        Terminal.loadURL(`https://repl.it/@JDOG787/UtterSoreManagement?outputonly=1`)
    }
}

export { PopoutHandler };