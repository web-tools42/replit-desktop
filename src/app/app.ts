import { ElectronWindow, getUrl } from '../common';
import { session, Cookie } from 'electron';
import { ThemeHandler } from './themeHandler/themeHandler';
import { DiscordHandler } from './discordHandler/discordHandler';

class App {
    public mainWindow: ElectronWindow;
    public themeHandler: ThemeHandler;
    public discordHandler: DiscordHandler;

    constructor() {
        this.mainWindow = new ElectronWindow({
            height: 720,
            width: 1280
        });
        this.discordHandler = new DiscordHandler(this.mainWindow);
        this.mainWindow.hide();
        this.mainWindow.setBackgroundColor('#393c42');
        this.themeHandler = new ThemeHandler();
        //this.discordHandler
    }

    async clearCookies(oauthOnly: boolean) {
        //TODO: Make this function available to appMenu
        const allCookies: Array<Cookie> = await session.defaultSession.cookies.get(
            {}
        );
        const cookiesToRemove: Array<Cookie> = [];
        for (let x = 0; x < allCookies.length; x++) {
            const cookie: Cookie = allCookies[x];
            if (oauthOnly) {
                if (!cookie.domain.includes('repl.it')) {
                    cookiesToRemove.push(cookie);
                }
            } else {
                cookiesToRemove.push(cookie);
            }
        }
        for (let x = 0; x < cookiesToRemove.length; x++) {
            const cookie: Cookie = cookiesToRemove[x];
            await session.defaultSession.cookies.remove(
                `https://${cookie.domain.charAt(0) === '.' ? 'www' : ''}${
                    cookie.domain
                }${cookie.path}`,
                cookie.name
            );
            await session.defaultSession.flushStorageData();
        }
    }
}

export { App };
