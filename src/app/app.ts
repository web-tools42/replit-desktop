import { ElectronWindow, handleExternalLink, promptYesNoSync } from '../common';
import { app, Cookie, ipcMain, session, MenuItem, screen } from 'electron';
import { PopoutHandler } from './popoutHandler/popoutHandler';
import { ThemeHandler } from './themeHandler/themeHandler';
import { DiscordHandler } from './discordHandler';
import { settings } from './settingHandler';
import contextMenu from 'electron-context-menu';
import { appMenuSetup } from './menu/appMenuSetup';
import { EventEmitter } from 'events';

class App extends EventEmitter {
    public readonly mainWindow: ElectronWindow;
    public readonly themeHandler: ThemeHandler;
    public readonly popoutHandler: PopoutHandler;
    public readonly discordHandler: DiscordHandler;
    protected windowArray: Map<number, ElectronWindow>;

    constructor() {
        super();
        this.mainWindow = new ElectronWindow({}, 'aceFix.js');
        this.windowArray = new Map();
        this.discordHandler = new DiscordHandler(this.mainWindow);
        this.themeHandler = new ThemeHandler(this.mainWindow);
        this.popoutHandler = new PopoutHandler();

        this.addWindow(this.mainWindow);
        if (!settings.has('enable-ace')) settings.set('enable-ace', false);
        app.applicationMenu = appMenuSetup(this, this.themeHandler, this.popoutHandler);

        // Handle The Login
        this.mainWindow.webContents.on('new-window', (event, url) => {
            let oauth = url.includes('/auth/google/get?close=1') || url.includes('/auth/github/get?close=1');
            event.preventDefault();
            if (oauth) {
                this.clearCookies(true);
                ipcMain.once('authDone', () => this.mainWindow.loadURL('https://replit.com/~'));
            }
            const win = new ElectronWindow(
                {
                    height: 900,
                    width: 1600
                },
                oauth ? 'auth.js' : ''
            );
            win.loadURL(url, { userAgent: 'chrome' });
            event.newGuest = win;
            this.addWindow(win, false);
        });
    }

    toggleAce(menu?: MenuItem) {
        let userAgent: string =
            'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X)AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Tablet/15E148 Safari/604.1';
        if (menu) {
            if (menu.checked == true) {
                settings.set('enable-ace', true);
            } else {
                settings.set('enable-ace', false);
                userAgent = app.userAgentFallback;
            }
        } else if (!settings.get('enable-ace')) {
            userAgent = app.userAgentFallback;
        }
        [...this.windowArray.values()].forEach((window) => {
            // log in fix
            if (window.webContents && /repl.it\/@(.*)\//i.test(window.webContents.getURL())) {
                window.webContents.userAgent = userAgent;
                window.reload();
            }
        });
    }

    async clearCookies(oauthOnly: boolean, Prompt: boolean = true) {
        if (!oauthOnly && Prompt && !promptYesNoSync('Are you sure you want to clear all cookies?', 'Confirm')) return;

        const allCookies: Array<Cookie> = await session.defaultSession.cookies.get({});
        for (let x = 0; x < allCookies.length; x++) {
            const cookie: Cookie = allCookies[x];
            if ((oauthOnly && !cookie.domain.includes('replit.com')) || !oauthOnly) {
                await session.defaultSession.cookies.remove(
                    `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${cookie.domain}${cookie.path}`,
                    cookie.name
                );
                session.defaultSession.flushStorageData();
            }
        }
        if (!oauthOnly) {
            [...this.windowArray.values()].forEach((win) => {
                win.reload();
            });
        }
    }

    resetPreferences() {
        if (
            promptYesNoSync(
                `Are you sure?`,
                'Reset Settings',
                `This will reset your theme preferences.
This action is NOT reversible!`
            )
        ) {
            settings.clearAll();
            [...this.windowArray.values()].forEach((win) => {
                win.reload();
            });
        }
    }

    addWindow(window: ElectronWindow, handleExt: boolean = true) {
        contextMenu({
            window,
            prepend: () => [
                {
                    role: 'reload'
                },
                {
                    type: 'separator'
                },
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
                    role: 'selectAll'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'zoomIn'
                },
                {
                    role: 'zoomOut'
                }
            ]
        });

        this.windowArray.set(window.id, window);
        this.toggleAce();

        window.webContents.on('will-navigate', (e, url) => {
            // Deal with the logout
            if (url == 'https://replit.com/logout') this.clearCookies(false, false);
            if (handleExt) handleExternalLink(e, window, url);
            if (settings.get('enable-ace')) this.toggleAce();
        });

        this.themeHandler.addTheme(window);

        window.webContents.on('did-finish-load', () => this.themeHandler.addTheme(window));

        window.on('close', () => {
            if (this.windowArray.has(window.id)) this.windowArray.delete(window.id);
        });
    }
}

export { App };
