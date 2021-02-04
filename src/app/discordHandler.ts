import { Client } from 'discord-rpc';
import { ElectronWindow, getUrl } from '../common';
import langs = require("./languages");
import Timeout = NodeJS.Timeout;

const startTimestamp = new Date();
console.debug(langs);

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
            .login({ clientId: '806925922091270234' })
            .catch((error: string) => {
                console.error(error);
            });
        this.client.on('ready', () => {
            console.debug('Discord Client ready');
            this.setPlayingDiscord().catch();
            this.discordTimer = setInterval(() => {
                this.setPlayingDiscord().catch((e: string) => {
                    console.error('Failed to update Discord status. ' + e);
                });
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

        let data: any = await this.window.webContents.executeJavaScript(
            "document.getElementById('__NEXT_DATA__').innerHTML;", true
        );

        data = JSON.parse(data).props.reduxState;

        if (data !== undefined) {
            console.debug("__NEXT_DATA__ exists here.");
        } else {
            console.debug("__NEXT_DATA__ does not exist here.");
        }

        if (spliturl[0] === 'repls') {
            this.client
                .setActivity({
                    details: `Browsing Repls`,
                    state: ``,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .then();
        } else if (spliturl[0] === 'talk') {
            this.setTalkBoard(spliturl, this.window).then(
                (res) => {
                    this.client
                        .setActivity({
                            state: `${res.viewing}`,
                            details: `In Repl Talk ${res.talkBoard}`,
                            startTimestamp,
                            largeImageKey: 'logo',
                            largeImageText: 'Repl.it',
                            smallImageKey: 'talk',
                            smallImageText: 'Repl Talk',
                            instance: false
                        })
                        .catch((reason) => {
                            console.error(`error@talk board ${reason}`);
                        });
                },
                (reason: string) => {
                    console.error(`Set Talk board Failed ${reason}`);
                }
            );
        } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
            let repl: any = data.repls;

            console.log("-------------------");


            this.setEditing(this.window).then(
                (res) => {
                    this.client
                        .setActivity({
                            details: `Editing: ${res.fileName}`,
                            state: `${url}`,
                            startTimestamp,
                            smallImageKey: 'logo',
                            smallImageText: 'Repl.it',
                            largeImageKey: res.logoName,
                            largeImageText: res.logoName,
                            instance: false
                        })
                        .catch((reason) => {
                            console.error(`error@editing ${reason}`);
                        });
                },
                (reason: string) => {
                    console.error(`Set editing failed ${reason}`);
                }
            );
        } else if (spliturl[0] === 'talk') {
            this.client
                .setActivity({
                    details: `Browsing Repl Talk`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'talk',
                    largeImageText: 'Repl Talk',
                    smallImageKey: 'logo',
                    smallImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.error(`error@talk ${reason}`);
                });
        } else if (spliturl[0][0] === '@') {
            this.client
                .setActivity({
                    details: `Looking at ${spliturl[0]}'s profile`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.debug(`error@profile ${reason}`);
                });
        } else if (spliturl[0] === 'account') {
            this.client
                .setActivity({
                    details: `Changing Account Settings`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.debug(`error@acount ${reason}`);
                });
        } else {
            this.client
                .setActivity({
                    details: `Browsing Repl.it`,
                    state: `Page Unkown`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.error(`error@main ${reason}`);
                });
        }
    }

    async setTalkBoard(spliturl: Array<string>, windowObj: ElectronWindow) {
        let viewing: string = 'Viewing ';
        if (spliturl[3] !== undefined) {
            viewing += await windowObj.webContents.executeJavaScript(
                "document.getElementsByClassName('board-post-detail-title')[0].textContent"
            ); // gets the repl talk post name
        } else if (spliturl[2] !== undefined) {
            viewing = `Viewing ${spliturl[2]}`;
        } else {
            viewing = `Viewing ${spliturl[1]}`;
        }
        let talkBoard: string = 'error';
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
            default:
                talkBoard = '';
        }
        console.log(viewing);
        return { viewing: viewing, talkBoard: talkBoard };
    }

    async setEditing(windowObj: ElectronWindow) {
        const fileName: string = await windowObj.webContents.executeJavaScript(
            "document.querySelector('.file-header-name div').textContent"
        );
        const logoUrl: string = await windowObj.webContents.executeJavaScript(
            "document.querySelector('.workspace-header-description-container" +
                " img')['src']"
        );
        const imageName: string = logoUrl.split('/').pop().split('.')[0];
        return { fileName: fileName, logoName: imageName };
    }
}

export { DiscordHandler };
