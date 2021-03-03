import {
    BrowserWindow,
    clipboard,
    Menu,
    MenuItem,
    MenuItemConstructorOptions,
    shell
} from 'electron';

import { ElectronWindow, promptYesNoSync, selectInput } from '../../common';
import { App } from '../app';
import { PopoutHandler } from '../popoutHandler/popoutHandler';
import { SettingHandler } from '../settingHandler';
import { ThemeHandler } from '../themeHandler/themeHandler';

function appMenuSetup(
    mainApp: App,
    themeHandler: ThemeHandler,
    settings: SettingHandler,
    popoutHandler: PopoutHandler
): Menu {
    const template: MenuItemConstructorOptions[] = [
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
                    label: 'Links',
                    submenu: [
                        {
                            label: 'CLI',
                            click(i: MenuItem, win: BrowserWindow) {
                                win.loadURL('https://repl.it/~/cli').catch();
                            }
                        },
                        {
                            label: 'Replit Bugs',
                            click(i: MenuItem, win: BrowserWindow) {
                                win.loadURL('https://repl.it/bugs').catch();
                            }
                        },
                        {
                            label: 'Replit Feedback',
                            click(i: MenuItem, win: BrowserWindow) {
                                win.loadURL('https://repl.it/feedback').catch();
                            }
                        },
                        {
                            label: 'Docs',
                            click() {
                                let win = new ElectronWindow(
                                    {
                                        height: 900,
                                        width: 1600
                                    },
                                    '',
                                    true
                                );
                                win.loadURL('https://docs.repl.it');
                            }
                        }
                    ]
                },
                {
                    label: 'Discord',
                    submenu: [
                        {
                            label: 'Reconnect to Discord',
                            click() {
                                mainApp.discordHandler.connectDiscord();
                            }
                        },
                        {
                            label: 'Disconnect from Discord',
                            click() {
                                mainApp.discordHandler.disconnectDiscord();
                            }
                        }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Clear Cookies',
                    click() {
                        mainApp.clearCookies(false);
                    }
                },
                {
                    label: 'Reset Settings',
                    click() {
                        mainApp.resetPreferences();
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Popout Terminal',
                    click(i: MenuItem, win: BrowserWindow) {
                        popoutHandler.launch(<ElectronWindow>win);
                    }
                },
                {
                    label: 'Mobile View',
                    type: 'checkbox',
                    checked: <boolean>settings.get('enable-ace'),
                    click(item: MenuItem) {
                        mainApp.toggleAce(item);
                    }
                },
                {
                    label: 'Crosis Logs',
                    click(i: MenuItem, win: ElectronWindow) {
                        // suggestion: check if the page is on a repl, and if so, just add ?debug=1
                        win.webContents.executeJavaScript(
                            "if(!window.store){alert('You need to be on a repl to use this feature.')};window.store.dispatch({type: 'LOAD_PLUGIN',pluginPud: 'adminpanel',pluginType: 'adminpanel',title: 'adminpanel'});window.store.dispatch({type: 'ADD_SIDE_NAV_ITEM',navItem: {pud: 'adminpanel',pluginType: 'adminpanel',tooltip: 'Crosis Logs',svg: 'Alien'}});"
                        );
                    }
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
                    click(i: MenuItem, win: BrowserWindow) {
                        clipboard.writeText(win.webContents.getURL());
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Go Back',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        if (win.webContents.canGoBack()) {
                            win.webContents.goBack();
                        }
                    }
                },
                {
                    label: 'Go Forward',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        if (win.webContents.canGoForward()) {
                            win.webContents.goForward();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Open in Browser',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        shell.openExternal(win.webContents.getURL());
                    }
                },
                {
                    label: 'Go to Home',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        win.loadURL('https://repl.it/~').catch();
                    }
                },
                /*
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select input',
                    click(i: MenuItem, win: BrowserWindow) {
                        selectInput(<ElectronWindow>win);
                    }
                },*/
                {
                    type: 'separator'
                },
                {
                    accelerator: 'CmdOrCtrl+R',
                    label: 'Reload',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        if (win) win.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Alt+Command+I'
                            : 'Ctrl+Shift+I',
                    click: (i: MenuItem, win: BrowserWindow) => {
                        if (win) win.webContents.toggleDevTools();
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
                {
                    label: 'Replit discord',
                    click() {
                        shell.openExternal('https://repl.it/discord');
                    }
                },
                {
                    label: 'Report an issue',
                    click() {
                        shell.openExternal(
                            'https://github.com/repl-it-discord/repl-it-electron/issues/new/choose'
                        );
                    }
                },
                {
                    label: 'Github Repo',
                    click() {
                        shell.openExternal(
                            'https://github.com/repl-it-discord/repl-it-electron'
                        );
                    }
                },
                { label: 'Version', role: 'about' }
            ]
        }
    ];
    return Menu.buildFromTemplate(template);
}

export { appMenuSetup };
