import {
    ElectronWindow,
    handleExternalLink,
    promptYesNoSync,
    IPAD_USER_AGENT
} from '../common';
import {
    app,
    Cookie,
    ipcMain,
    session,
    MenuItem,
    NewWindowWebContentsEvent
} from 'electron';
import { PopoutHandler } from './popoutHandler/popoutHandler';
import { ThemeHandler } from './themeHandler/themeHandler';
import { DiscordHandler } from './discordHandler';
import { SettingHandler } from './settingHandler';
import contextMenu from 'electron-context-menu';
import { appMenuSetup } from './menu/appMenuSetup';
import { EventEmitter } from 'events';

class App extends EventEmitter {
    public readonly mainWindow: ElectronWindow;
    public readonly themeHandler: ThemeHandler;
    public readonly popoutHandler: PopoutHandler;
    public readonly discordHandler: DiscordHandler;
    protected windowArray: ElectronWindow[];
    private readonly settingsHandler: SettingHandler;

    constructor() {
        super();
        this.mainWindow = new ElectronWindow({
            height: 900,
            width: 1600
        });
        this.settingsHandler = new SettingHandler();
        this.windowArray = [];
        this.discordHandler = new DiscordHandler(this.mainWindow);

        this.themeHandler = new ThemeHandler(
            this.settingsHandler,
            this.mainWindow
        );
        this.popoutHandler = new PopoutHandler();
        this.addWindow(this.mainWindow);
        if (!this.settingsHandler.has('enable-ace')) {
            this.settingsHandler.set('enable-ace', false);
        } // Init settings for ace editor
        app.applicationMenu = appMenuSetup(
            this,
            this.themeHandler,
            this.settingsHandler,
            this.popoutHandler
        );

        // Handle The Login
        this.mainWindow.webContents.on('new-window', (event, url) => {
            let oauth =
                url == 'https://repl.it/auth/google/get?close=1' ||
                url == 'https://repl.it/auth/github/get?close=1';

            event.preventDefault();
            if (oauth) {
                this.clearCookies(true);
                ipcMain.once('authDone', () =>
                    this.mainWindow.loadURL('https://repl.it/~')
                );
            }
            const win = new ElectronWindow(
                {
                    height: 900,
                    width: 1600
                },
                oauth ? 'auth.js' : ''
            );
            win.loadURL(url, {
                userAgent: 'chrome'
            });
            event.newGuest = win;
            this.addWindow(win);
        });
    }

    toggleAce(menu?: MenuItem) {
        let userAgent: string;
        if (menu) {
            if (menu.checked == true) {
                this.settingsHandler.set('enable-ace', true);
                userAgent = IPAD_USER_AGENT;
            } else {
                this.settingsHandler.set('enable-ace', false);
                userAgent = app.userAgentFallback;
            }
        } else {
            userAgent = IPAD_USER_AGENT;
        }
        this.windowArray.forEach((window) => {
            window.webContents.userAgent = userAgent;
            window.reload();
        });
    }

    async clearCookies(oauthOnly: boolean) {
        if (
            !oauthOnly &&
            !promptYesNoSync(
                'Are you sure you want to clear all cookies?',
                'Confirm'
            )
        )
            return;

        const allCookies: Array<Cookie> = await session.defaultSession.cookies.get(
            {}
        );
        for (let x = 0; x < allCookies.length; x++) {
            const cookie: Cookie = allCookies[x];
            if (
                (oauthOnly && !cookie.domain.includes('repl.it')) ||
                !oauthOnly
            ) {
                await session.defaultSession.cookies.remove(
                    `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${
                        cookie.domain
                    }${cookie.path}`,
                    cookie.name
                );
                session.defaultSession.flushStorageData();
            }
        }
        if (!oauthOnly) {
            for (let x = 0; x < this.windowArray.length; x++) {
                this.windowArray[x].reload();
            }
        }
    }

    addWindow(window: ElectronWindow) {
        contextMenu({ window: window });
        this.windowArray.push(window);
        window.webContents.on('will-navigate', (e, url) => {
            handleExternalLink(e, window, url);
            if (this.settingsHandler.get('enable-ace')) this.toggleAce();
        });

        this.themeHandler.addTheme(window);
        window.webContents.on('did-finish-load', () => {
            this.themeHandler.addTheme(window);
        });
    }
}

export { App };
