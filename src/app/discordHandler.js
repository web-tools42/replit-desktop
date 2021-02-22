Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordHandler = void 0;
const discord_rpc_1 = require("discord-rpc");
const common_1 = require("../common");
const languages_1 = require("./languages");
const startTimestamp = Date.now();
class DiscordHandler {
    constructor(window) {
        this.window = window;
        this.client = null;
        this.connectDiscord();
    }
    connectDiscord() {
        if (!this.client)
            this.client = new discord_rpc_1.Client({ transport: 'ipc' });
        this.client
            .login({ clientId: '498635999274991626' })
            .catch((error) => {
            console.error(error);
            this.disconnectDiscord();
        });
        this.client.on('ready', () => {
            console.debug('Discord Client ready');
            this.setPlayingDiscord();
            this.discordTimer = setInterval(() => {
                this.setPlayingDiscord().catch((e) => console.error(`Failed to update Discord status. ${e}`));
            }, 15e3);
        });
    }
    disconnectDiscord() {
        this.client.clearActivity();
        clearInterval(this.discordTimer);
        this.client.destroy();
        delete this.client;
    }
    async setPlayingDiscord() {
        let url = common_1.getUrl(this.window);
        let spliturl = url.split('/');
        if (spliturl[0] === 'repls') {
            this.client.setActivity({
                details: `Browsing Repls`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo-bg',
                largeImageText: 'Replit',
                instance: false
            });
        }
        else if (spliturl[0] === 'talk') {
            this.setTalkBoard(spliturl, this.window).then((res) => {
                this.client
                    .setActivity({
                    state: `${res.viewing}`,
                    details: `In Repl Talk ${res.talkBoard}`,
                    startTimestamp,
                    largeImageKey: 'talk-bg',
                    largeImageText: 'Repl Talk',
                    smallImageKey: 'logo-bg',
                    smallImageText: 'Replit',
                    instance: false
                })
                    .catch((reason) => {
                    console.error(`error@talk board ${reason}`);
                });
            }, (reason) => {
                console.error(`Set Talk board Failed ${reason}`);
            });
        }
        else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
            this.setEditing(this.window).then((res) => {
                this.client
                    .setActivity({
                    details: `Editing: ${res.fileName}`,
                    state: `${url} `,
                    startTimestamp,
                    smallImageKey: 'logo-bg',
                    smallImageText: 'Replit',
                    largeImageKey: res.largeImageKey,
                    largeImageText: res.largeImageText,
                    instance: false
                })
                    .catch((reason) => {
                    console.error(`error@editing ${reason}`);
                });
            }, (reason) => {
                console.error(`Set editing failed ${reason}`);
            });
        }
        else if (spliturl[0] === 'talk') {
            this.client
                .setActivity({
                details: `In Repl Talk`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'talk-bg',
                largeImageText: 'Repl Talk',
                smallImageKey: 'logo-bg',
                smallImageText: 'Replit',
                instance: false
            })
                .catch((reason) => {
                console.error(`error@talk ${reason}`);
            });
        }
        else if (spliturl[0][0] === '@') {
            this.client
                .setActivity({
                details: `Looking at ${spliturl[0]}'s profile`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo-bg',
                largeImageText: 'Replit',
                instance: false
            })
                .catch((reason) => {
                console.debug(`error@profile ${reason}`);
            });
        }
        else if (spliturl[0] === 'account') {
            this.client
                .setActivity({
                details: `Changing account settings`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo-bg',
                largeImageText: 'Replit',
                instance: false
            })
                .catch((reason) => {
                console.debug(`error@acount ${reason}`);
            });
        }
        else {
            this.client
                .setActivity({
                details: `On Replit`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo-bg',
                largeImageText: 'Replit',
                instance: false
            })
                .catch((reason) => {
                console.error(`error@main ${reason}`);
            });
        }
    }
    async setTalkBoard(spliturl, windowObj) {
        let viewing = 'Viewing ';
        if (spliturl[3] !== undefined) {
            viewing += await windowObj.webContents.executeJavaScript("document.getElementsByClassName('board-post-detail-title')[0].textContent");
        }
        else {
            viewing = `Viewing ${spliturl[2] !== undefined ? spliturl[2] : spliturl[1]}`;
        }
        return { viewing: viewing, talkBoard: common_1.capitalize(spliturl[1]) };
    }
    async setEditing(windowObj) {
        const { activeFile, plugins } = JSON.parse(await windowObj.webContents.executeJavaScript('JSON.stringify(window.store.getState())'));
        const replType = await windowObj.webContents.executeJavaScript('document.querySelector("img.jsx-2652062152").title');
        return {
            fileName: activeFile,
            largeImageKey: languages_1.displayNameToIcon[replType],
            largeImageText: plugins.fs.state.repl.language
        };
    }
}
exports.DiscordHandler = DiscordHandler;
