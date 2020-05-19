import { ElectronWindow, getUrl } from '../common';
import { Client } from 'discord-rpc';

const clientId = '498635999274991626';
let startTimestamp = new Date();
const logosDiscordDict: { [key: string]: string } = {
    bash: 'bash',
    basic: 'basic',
    brainfuck: 'brainfuck',
    c: 'c',
    clojure: 'clojure',
    coffeescript: 'coffeescript',
    cpp: 'cpp',
    crystal: 'crystal',
    csharp: 'csharp',
    dart: 'dart',
    'deno-no-transparent': 'deno',
    django: 'django',
    elixir: 'elixir',
    emacs: 'emacs',
    erlang: 'erlang',
    express: 'express',
    flow: 'flow',
    fsharp: 'fsharp',
    gatsbyjs: 'gatsbyjs',
    go: 'go',
    haskell: 'haskell',
    java: 'java',
    javascript: 'javascript',
    jest: 'jest',
    julia: 'julia',
    kotlin: 'kotlin',
    language: 'language',
    lolcode: 'lolcode',
    love2d: 'language',
    lua: 'lua',
    nim: 'language',
    nodejs: 'nodejs',
    ocaml: 'ocaml',
    perl6: 'perl6',
    php: 'php',
    python: 'python',
    python_turtle: 'python_turtle',
    rails: 'rails',
    react: 'react',
    reactre: 'reactre',
    reason: 'language',
    rlang: 'rlang',
    roy: 'roy',
    ruby: 'ruby',
    rust: 'rust',
    scala: 'scala',
    scheme: 'scheme',
    sinatra: 'language',
    sqlite: 'sqlite',
    swift: 'swift',
    typescript: 'typescript',
    wasm: 'wasm',
    web_project: 'web_project'
};

class mainApp {
    mainWindow: ElectronWindow;
    rpc: Client;

    constructor() {
        this.mainWindow = new ElectronWindow({
            show: false,
            //resizable: false,
            height: 600,
            width: 800
        });
        this.mainWindow.setBackgroundColor('#393c42');
        this.rpc = new Client({
            transport: 'ipc'
        });
        this.initDiscord();
    }

    initDiscord() {
        this.rpc
            .login({ clientId: clientId })
            .then(() => {
                console.log('login success');
            })
            .catch((error) => {
                console.error(error);
            });
        this.rpc.on('ready', () => {
            // activity can only be set every 15 seconds
            setInterval(() => {
                this.setPlayingDiscord().catch((e: string) => {
                    console.log('Failed to update Discord status. ' + e);
                });
            }, 15e3);
        });
    }

    async setPlayingDiscord() {
        let url: string = getUrl(this.mainWindow);
        let spliturl: Array<string> = url.split('/');

        if (spliturl[0] === 'repls') {
            this.rpc
                .setActivity({
                    details: `Browsing Repls`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .then();
        } else if (spliturl[0] === 'talk') {
            this.setTalkBoard(spliturl, this.mainWindow).then(
                (res) => {
                    this.rpc
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
            this.setEditing(this.mainWindow).then(
                (res) => {
                    this.rpc
                        .setActivity({
                            details: `Editing: ${res.fileName}`,
                            state: `${url} `,
                            startTimestamp,
                            smallImageKey: 'logo',
                            smallImageText: 'Repl.it',
                            largeImageKey: logosDiscordDict[res.logoName],
                            largeImageText: logosDiscordDict[res.logoName],
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
            this.rpc
                .setActivity({
                    details: `In Repl Talk`,
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
            this.rpc
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
            this.rpc
                .setActivity({
                    details: `Changing account settings`,
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
            this.rpc
                .setActivity({
                    details: `On Repl.it`,
                    state: `repl.it/${url}`,
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
        console.log(spliturl);
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

        const lang: string = fileName.split('.').slice(-1)[0];
        // gets the file extension
        const imageName: string = logoUrl.split('/')[-1].split('.')[0];
        return { fileName: fileName, logoName: imageName };
    }
}

export { mainApp };
