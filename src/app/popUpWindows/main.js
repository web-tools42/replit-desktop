const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path")
let Main;

app.whenReady().then(() => {
  Main = new BrowserWindow({ 
    width: 800, height: 500, webPreferences: {
      preload: `${__dirname}/popout.js`,
      nodeIntegration: true
    }
  })
  Main.loadURL(`file://${__dirname}/index.html`);
});

ipcMain.on('Popup', (event, status) => {
  let Terminal = new BrowserWindow({ width: 600, height: 600, webPreferences: {
      preload: `${__dirname}/console.js`,
      nodeIntegration: true
    }
  });
  Terminal.loadURL(`https://repl.it/@${status.user}/${status.replname}`)
})