import { app, Cookie, ipcMain, MenuItem, session } from 'electron';
import contextMenu from 'electron-context-menu';
import { EventEmitter } from 'events';

import { ElectronWindow, handleExternalLink, promptYesNoSync } from '../common';
import { DiscordHandler } from './discordHandler';
import { appMenuSetup } from './menu/appMenuSetup';
import { PopoutHandler } from './popoutHandler/popoutHandler';
import { settings } from './settingHandler';
import { ThemeHandler } from './themeHandler/themeHandler';

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
                this.clearCookies(true, true);
                ipcMain.once('authDone', () => this.mainWindow.loadURL('https://replit.com/~'));
            }
            const loginWin = new ElectronWindow(
                {
                    height: 900,
                    width: 1600
                },
                oauth ? 'auth.js' : ''
            );
            loginWin.loadURL(url, {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0'
            });
            loginWin.webContents.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0'
            );
            event.newGuest = loginWin;
            this.addWindow(loginWin, false);
        });
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized())
                    this.windowArray.forEach((win) => {
                        win.restore();
                    });
                this.mainWindow.focus();
            }
        });
    }

    toggleAce(menu?: MenuItem) {
        let userAgent: string =
            'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X)AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Tablet/15E148 Safari/604.1';
        if (menu) {
            if (menu.checked) {
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
            const winUrl = window.webContents.getURL();
            if (winUrl.includes('replit') || winUrl.includes('repl.it')) {
                window.webContents.userAgent = userAgent;
                window.reload();
            }
        });
    }

    toggleRestoreSession(menu: MenuItem, win: ElectronWindow) {
        if (menu) {
            if (menu.checked) {
                settings.set('restore-url', win.webContents.getURL());
            } else {
                settings.unset('restore-url');
            }
        }
    }

    async clearCookies(oauthOnly: boolean, replitOnly: boolean, prompt: boolean = false) {
        if (!oauthOnly && prompt && !promptYesNoSync('Are you sure you want to clear all cookies?', 'Confirm')) return;
        const winSession = this.mainWindow.webContents.session;
        const allCookies: Array<Cookie> = await winSession.cookies.get({});
        for (const cookie of allCookies) {
            if (replitOnly) {
                if (cookie.domain.includes('replit.com') || cookie.domain.includes('repl.it'))
                    await winSession.cookies.remove(
                        `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${cookie.domain}${cookie.path}`,
                        cookie.name
                    );
            } else if (oauthOnly) {
                if (
                    cookie.domain.includes('github') ||
                    cookie.domain.includes('google') ||
                    cookie.domain.includes('facebook')
                )
                    await winSession.cookies.remove(
                        `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${cookie.domain}${cookie.path}`,
                        cookie.name
                    );
            } else {
                await winSession.cookies.remove(
                    `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${cookie.domain}${cookie.path}`,
                    cookie.name
                );
            }
            winSession.flushStorageData();
        }
        if (prompt) {
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

        window.webContents.on('did-start-navigation', (e, url) => {
            // Deal with the logout
            if (url == 'https://replit.com/logout') this.clearCookies(false, true, false);
            if (handleExt) handleExternalLink(e, window, url);
            if (settings.get('enable-ace')) this.toggleAce();
            if (settings.has('restore-url')) {
                settings.set('restore-url', url);
            }
        });

        window.addTheme();

        window.webContents.on('did-finish-load', () => {
            window.addTheme();
        });
        window.on('close', () => {
            if (this.windowArray.has(window.id)) this.windowArray.delete(window.id);
        });
    }
}

export { App };
