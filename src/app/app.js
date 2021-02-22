var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const common_1 = require("../common");
const electron_1 = require("electron");
const popoutHandler_1 = require("./popoutHandler/popoutHandler");
const themeHandler_1 = require("./themeHandler/themeHandler");
const discordHandler_1 = require("./discordHandler");
const settingHandler_1 = require("./settingHandler");
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const appMenuSetup_1 = require("./menu/appMenuSetup");
const events_1 = require("events");
class App extends events_1.EventEmitter {
    constructor() {
        super();
        this.mainWindow = new common_1.ElectronWindow({ height: 900, width: 1600 });
        this.settingsHandler = new settingHandler_1.SettingHandler();
        this.windowArray = [];
        this.discordHandler = new discordHandler_1.DiscordHandler(this.mainWindow);
        this.themeHandler = new themeHandler_1.ThemeHandler(this.settingsHandler, this.mainWindow);
        this.popoutHandler = new popoutHandler_1.PopoutHandler();
        this.addWindow(this.mainWindow);
        if (!this.settingsHandler.has('enable-ace'))
            this.settingsHandler.set('enable-ace', false);
        electron_1.app.applicationMenu = appMenuSetup_1.appMenuSetup(this, this.themeHandler, this.settingsHandler, this.popoutHandler);
        this.mainWindow.webContents.on('new-window', (event, url) => {
            let oauth = url == 'https://repl.it/auth/google/get?close=1' ||
                url == 'https://repl.it/auth/github/get?close=1';
            event.preventDefault();
            if (oauth) {
                this.clearCookies(true);
                electron_1.ipcMain.once('authDone', () => this.mainWindow.loadURL('https://repl.it/~'));
            }
            const win = new common_1.ElectronWindow({
                height: 900,
                width: 1600
            }, oauth ? 'auth.js' : '');
            win.loadURL(url, { userAgent: 'chrome' });
            event.newGuest = win;
            this.addWindow(win);
        });
    }
    toggleAce(menu) {
        let userAgent = 'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X)AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Tablet/15E148 Safari/604.1';
        if (menu) {
            if (menu.checked == true) {
                this.settingsHandler.set('enable-ace', true);
            }
            else {
                this.settingsHandler.set('enable-ace', false);
                userAgent = electron_1.app.userAgentFallback;
            }
        }
        this.windowArray.forEach((window) => {
            window.webContents.userAgent = userAgent;
            window.reload();
        });
    }
    async clearCookies(oauthOnly) {
        if (!oauthOnly &&
            !common_1.promptYesNoSync('Are you sure you want to clear all cookies?', 'Confirm'))
            return;
        const allCookies = await electron_1.session.defaultSession.cookies.get({});
        for (let x = 0; x < allCookies.length; x++) {
            const cookie = allCookies[x];
            if ((oauthOnly && !cookie.domain.includes('repl.it')) ||
                !oauthOnly) {
                await electron_1.session.defaultSession.cookies.remove(`https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${cookie.domain}${cookie.path}`, cookie.name);
                electron_1.session.defaultSession.flushStorageData();
            }
        }
        if (!oauthOnly) {
            for (let x = 0; x < this.windowArray.length; x++) {
                this.windowArray[x].reload();
            }
        }
    }
    addWindow(window) {
        electron_context_menu_1.default({ window: window });
        this.windowArray.push(window);
        window.webContents.on('will-navigate', (e, url) => {
            common_1.handleExternalLink(e, window, url);
            if (this.settingsHandler.get('enable-ace'))
                this.toggleAce();
        });
        this.themeHandler.addTheme(window);
        window.webContents.on('did-finish-load', () => this.themeHandler.addTheme(window));
    }
}
exports.App = App;
