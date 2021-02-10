import { Client } from 'discord-rpc';
import { ElectronWindow, getUrl } from '../common';
import languages from './languages';
import Timeout = NodeJS.Timeout;

const startTimestamp = new Date();

class DiscordHandler {
    private client: Client;
    private readonly window: ElectronWindow;
    private discordTimer: Timeout;

    constructor(window: ElectronWindow) {
        this.window = window;
        this.client = null;
        this.connectDiscord();
    }

    connectDiscord() {
        if (!this.client) {
            this.client = new Client({
                transport: 'ipc'
            });
        }
        this.client
            .login({ clientId: '806972065709031514' })
            .catch((error: string) => console.error(error));
        this.client.on('ready', () => {
            console.debug('Discord Client ready');
            this.setPlayingDiscord().catch();
            this.discordTimer = setInterval(() => {
                this.setPlayingDiscord().catch((e: string) =>
                    console.error(`Failed to update Discord status. ${e}`)
                );
            }, 15e3);
        });
    }

    disconnectDiscord() {
        this.client.clearActivity().catch();
        clearInterval(this.discordTimer);
        this.client.destroy().then();
        delete this.client;
    }

    async setPlayingDiscord() {
        let url: string = getUrl(this.window);
        let spliturl: Array<string> = url.split('/');

        interface Richpresence {
            details: string;
            state: string;
            startTimestamp: Date;
            largeImageKey: string;
            largeImageText: string;
            smallImageKey?: string;
            smallImageText?: string;
            instance: boolean;
        }
        let Presence: Richpresence = {
            details: `Browsing Repl.it`,
            state: `...`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        };
        if (spliturl[0] === 'repls') {
            Presence = {
                details: `Browsing Repls`,
                state: `...`,
                startTimestamp,
                largeImageKey: 'logo',
                largeImageText: 'Repl.it',
                instance: false
            };
        } else if (spliturl[0] === 'talk') {
            let res = await this.setTalkBoard(spliturl, this.window);
            Presence = {
                state: `${res.viewing}`,
                details: `Repl Talk: ${res.talkBoard}`,
                startTimestamp,
                largeImageKey: 'repltalk',
                largeImageText: 'ReplTalk',
                smallImageKey: 'logo',
                smallImageText: 'Repl.it',
                instance: false
            };
        } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
            let res = await this.setEditing(this.window);
            Presence = {
                details: res.replName,
                state: `Editing ${res.fileName}`,
                startTimestamp,
                smallImageKey: 'logo',
                smallImageText: 'Repl.it',
                largeImageKey: res.logoName,
                largeImageText: res.logoName,
                instance: false
            };
        } else if (spliturl[0] === 'talk') {
            Presence = {
                details: `Browsing Repl Talk`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'talk',
                largeImageText: 'Repl Talk',
                smallImageKey: 'logo',
                smallImageText: 'Repl.it',
                instance: false
            };
        } else if (spliturl[0][0] === '@') {
            Presence = {
                details: `Looking at ${spliturl[0]}'s profile`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo',
                largeImageText: 'Repl.it',
                instance: false
            };
        } else if (spliturl[0] === 'account') {
            Presence = {
                details: `Changing Account Settings`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo',
                largeImageText: 'Repl.it',
                instance: false
            };
        }
        this.client
            .setActivity(Presence)
            .catch((error: string) => console.error(`RPC_Error: ${error}`));
    }

    async setTalkBoard(spliturl: Array<string>, windowObj: ElectronWindow) {
        let viewing: string = `Viewing ${spliturl[1]}`;
        if (spliturl[3] !== undefined) {
            viewing += await windowObj.webContents.executeJavaScript(
                "document.getElementsByClassName('board-post-detail-title')[0].textContent"
            ); // gets the repl talk post name
        } else if (spliturl[2] !== undefined) {
            viewing = `Viewing ${spliturl[2]}`;
        }
        let talkBoard: string = '';
        switch (spliturl[1]) {
            case 'announcements':
                talkBoard = 'Announcements';
                break;
            case 'ask':
                talkBoard = 'Ask';
                break;
            case 'challenge':
                talkBoard = 'Challenge';
                break;
            case 'learn':
                talkBoard = 'Learn';
                break;
            case 'share':
                talkBoard = 'Share';
                break;
        }
        return { viewing: viewing, talkBoard: talkBoard };
    }

    async setEditing(windowObj: ElectronWindow) {
        let { activeFile: target, plugins } = JSON.parse(
            await windowObj.webContents.executeJavaScript(
                'JSON.stringify(store.getState())',
                true
            )
        );
        let replName = plugins.fs.state.repl.title,
            parsed = target.split('/').reverse()[0];
        for (let [k, v] of Object.entries(languages.knownExtensions)) {
            const match = k.match(/^\/(.+)\/([a-z]*)$/);
            let is_match = match
                ? new RegExp(match[1], match[2]).test(parsed)
                : parsed.endsWith(k);
            if (is_match) {
                return {
                    fileName: parsed,
                    logoName: v.image,
                    replName: replName
                };
            }
        }
    }
}

export { DiscordHandler };
