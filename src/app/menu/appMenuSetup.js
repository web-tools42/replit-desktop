Object.defineProperty(exports, "__esModule", { value: true });
exports.appMenuSetup = void 0;
const electron_1 = require("electron");
const common_1 = require("../../common");
function appMenuSetup(mainApp, themeHandler, settings, popoutHandler) {
    const template = [
        {
            label: 'App',
            submenu: [
                {
                    label: 'Themes',
                    submenu: [
                        {
                            label: 'Choose Theme',
                            click() {
                                themeHandler.openWindow();
                            }
                        },
                        {
                            label: 'Make Theme',
                            click() {
                                themeHandler.openMaker();
                            }
                        }
                    ]
                },
                {
                    label: 'Popup',
                    click(i, win) {
                        popoutHandler.launch(win);
                    }
                },
                {
                    label: 'Use Ace Editor',
                    type: 'checkbox',
                    checked: settings.get('enable-ace'),
                    click(item) {
                        mainApp.toggleAce(item);
                    }
                },
                {
                    label: 'Crosis Logs',
                    click(i, win) {
                        win.webContents.executeJavaScript("window.store.dispatch({type: 'LOAD_PLUGIN',pluginPud: 'adminpanel',pluginType: 'adminpanel',title: 'adminpanel'});window.store.dispatch({type: 'ADD_SIDE_NAV_ITEM',navItem: {pud: 'adminpanel',pluginType: 'adminpanel',tooltip: 'Crosis Logs',svg: 'Alien'}});");
                    }
                },
                { type: 'separator' },
                {
                    label: 'Re-connect to Discord',
                    click() {
                        mainApp.discordHandler.connectDiscord();
                    }
                },
                {
                    label: 'Disconnect from Discord',
                    click() {
                        mainApp.discordHandler.disconnectDiscord();
                    }
                },
                {
                    label: 'Clear All Cookies',
                    click() {
                        mainApp.clearCookies(false);
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteAndMatchStyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectAll'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Copy URL to clipboard',
                    click(item, focusedWindow) {
                        electron_1.clipboard.writeText(focusedWindow.webContents.getURL());
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Go Back',
                    click(item, focusedWindow) {
                        if (focusedWindow.webContents.canGoBack()) {
                            focusedWindow.webContents.goBack();
                        }
                    }
                },
                {
                    label: 'Go Forward',
                    click(item, focusedWindow) {
                        if (focusedWindow.webContents.canGoForward()) {
                            focusedWindow.webContents.goForward();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Open Current Link in Default Browser',
                    click(item, focusedWindow) {
                        electron_1.shell
                            .openExternal(focusedWindow.webContents.getURL())
                            .then((r) => { });
                    }
                },
                {
                    label: 'Go to Home',
                    click(item, focusedWindow) {
                        focusedWindow.loadURL('https://repl.it/~').catch();
                    }
                },
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select Input',
                    click(item, focusedWindow) {
                        common_1.selectInput(focusedWindow);
                    }
                },
                {
                    type: 'separator'
                },
                {
                    accelerator: 'CmdOrCtrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.reload();
                    },
                    label: 'Reload'
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin'
                        ? 'Alt+Command+I'
                        : 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetZoom'
                },
                {
                    role: 'zoomIn'
                },
                {
                    role: 'zoomOut'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                },
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [
                { role: 'about' },
                {
                    label: 'Join the Replit discord',
                    click() {
                        electron_1.shell.openExternal('https://repl.it/discord');
                    }
                },
                {
                    label: 'Learn More about Replit',
                    click() {
                        electron_1.shell.openExternal('https://repl.it/site/about');
                    }
                },
                {
                    label: 'Report a Bug, or Request a Feature',
                    click() {
                        electron_1.shell.openExternal('https://github.com/repl-it-discord/repl-it-electron/issues/new/choose');
                    }
                },
                {
                    label: 'Go to Github Page',
                    click() {
                        electron_1.shell.openExternal('https://github.com/repl-it-discord/repl-it-electron');
                    }
                }
            ]
        }
    ];
    return electron_1.Menu.buildFromTemplate(template);
}
exports.appMenuSetup = appMenuSetup;
