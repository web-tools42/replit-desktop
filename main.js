// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const DiscordRPC = require('discord-rpc');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// don't change the client id if you want this example to work
const clientId = '494756536644665347';

// only needed for discord allowing spectate, join, ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({transport: 'ipc'});
const startTimestamp = new Date();

async function setActivity() {
    if (!rpc || !mainWindow) {
        return;
    }
    const url = mainWindow.webContents.getURL();
    console.log(url);
    const url_list = url.split('/');
    console.log(url_list);
    var last = url_list[url_list.length - 1];
    var owner = url_list[url_list.length - 2];
    /*if (urll === 'repls'||urll==='login'||urll==='') {
        rpc.setActivity({
           details: `At lobby`,
            state: `On ${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'repl.it',
            instance: false,
        });
    }*/
    if (owner.startsWith('@')) {
        rpc.setActivity({
            details: `Working on ${owner + last}`,
            state: `On ${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'repl.it',
            instance: false,
        });
    }
    else if (url.includes('https://repl.it/talk')) {
        rpc.setActivity({
            details: `In Repl Talk`,
            state: `On ${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'repl.it',
            instance: false,
        });
    }
    else {
        rpc.setActivity({
            details: `At Lobby`,
            state: `On ${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'repl.it',
            instance: false,
        });
    }
    /*rpc.setActivity({
        details: `Working on ${urll}`,
        state: `On ${url}`,
        startTimestamp,
        largeImageKey: 'logo',
        largeImageText: 'repl.it',
        instance: false,
    });
    */
}

rpc.on('ready', () => {
    setActivity();
    // activity can only be set every 15 seconds
    setInterval(() => {
        setActivity();
    }, 15e3);
});

rpc.login({clientId}).catch(console.error);

function isOnline() {
    /**
     * Show a warning to the user.
     * You can retry in the dialog until a internet connection
     * is active.
     */
    const ElectronOnline = require('electron-online')
    const connection = new ElectronOnline()

    connection.on('online', () => {
        console.log('App is online!')
    })

    connection.on('offline', () => {
        console.log('App is offline!')
    })

    console.log(connection.status) // 'PENDING'
    const message = function () {
        const {dialog} = require('electron');

        return dialog.showMessageBox({
            title: "There's no internet.",
            message: "No internet available, do you want to try again?",
            type: 'warning',
            buttons: ["Try again please.", "Quit"],
            defaultId: 0
        }, function (index) {
            // if clicked "Try again please"
            if (index == 0) {
                execute();
            }
            else {
                app.quit()
            }
        })
    };

    var execute = function () {

        if (connection.status === 'ONLINE' || connection.status === 'PENDING') {
        }
        else {
            // Show warning to user
            // And "retry" to connect
            message();
        }
    };

    // Verify for first time
    execute();
}

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1280, height: 800})
    isOnline();
    // and load the index.html of the app.
    mainWindow.loadURL('https://repl.it');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        app.quit()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
