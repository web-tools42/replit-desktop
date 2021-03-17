import {
    BrowserWindow, BrowserWindowConstructorOptions, dialog, MessageBoxReturnValue, screen, session,
    shell
} from 'electron';
import { platform } from 'os';

import { Endpoints } from '@octokit/types';

import { settings } from './app/settingHandler';

interface WindowSize {
    width: number;
    height: number;
    maximized: boolean;
}
interface WindowPosition {
    x: number;
    y: number;
}
class ElectronWindow extends BrowserWindow {
    constructor(
        options: BrowserWindowConstructorOptions,
        preload: string = '',
        nodeIntegration: boolean = false,
        webviewTag: boolean = false
    ) {
        const displaySize = screen.getPrimaryDisplay().workAreaSize;
        let windowSize: WindowSize = {
            // default to display size / 2
            width: Math.floor(displaySize.width / 2),
            height: Math.floor(displaySize.height / 2),
            maximized: false
        };

        let windowPosition: WindowPosition = {
            x: null,
            y: null
        };

        let restoreSize = true;
        let restorePosition = true;

        // If window size exist in options, keep it
        if (options.width && options.height) {
            windowSize.width = options.width;
            windowSize.height = options.height;
            restoreSize = false;
        }

        // If position exist in options, keep it
        if (options.center || options.x || options.y) restorePosition = false;

        if (restoreSize) {
            // check if window size settings exist
            if (settings.has('window-size')) {
                windowSize = settings.get('window-size');
            } else {
                // reset to default
                settings.set('window-size', windowSize);
            }
        }

        if (restorePosition) {
            // check if window position settings exist
            if (settings.has('window-position')) {
                windowPosition = settings.get('window-position');
            } else {
                // reset to default
                settings.set('window-position', windowPosition);
            }
        }

        console.log(`preload: ${__dirname}/preload/${preload}`);
        if (preload.length > 0 && !preload.includes(__dirname) && !preload.startsWith('./')) {
            preload = `${__dirname}/preload/${preload}`;
        }

        super({
            ...options,
            show: false,
            minHeight: 300,
            minWidth: 400,
            x: windowPosition.x,
            y: windowPosition.y,
            width: windowSize.width,
            height: windowSize.height,
            webPreferences: {
                session: session.fromPartition('persist:default', { cache: false }),
                devTools: true,
                spellcheck: true,
                contextIsolation: false, // Enforce false since we are using preload scripts,
                enableRemoteModule: false,
                webSecurity: true,
                nodeIntegration: nodeIntegration,
                preload: preload,
                webviewTag: webviewTag,
                backgroundThrottling: false
            },
            icon: `${__dirname}/512x512.png`
        });
        this.setBackgroundColor('#393c42');

        this.webContents.once('did-finish-load', () => {
            this.show();
            // Restore if window was maximized
            if (windowSize.maximized) {
                this.maximize();
            }
        });

        // Detect on resize and add to settings
        this.on('resize', () => {
            const size = this.getSize();
            const oldSize: WindowSize = settings.get('window-size');
            if (this.isMaximized()) {
                Object.assign(oldSize, { maximized: true });
                settings.set('window-size', oldSize);
            } else {
                settings.set('window-size', {
                    width: size[0],
                    height: size[1],
                    maximized: false
                });
            }
        });

        // detect moved and add to settings
        this.on('moved', () => {
            let position = this.getPosition();
            settings.set('window-position', { x: position[0], y: position[1] });
        });

        this.webContents.on('did-fail-load', (e, code, description, validateUrl) => {
            this.handleLoadingError(e, this, code, description, validateUrl);
        });
    }

    async handleLoadingError(
        event: Event,
        windowObject: ElectronWindow,
        errorCode: number,
        errorDescription: string,
        validateUrl: string
    ) {
        if (errorCode > -6 || errorCode <= -300) {
            return;
        }
        await windowObject.loadFile('app/offline.html');
        windowObject.webContents
            .executeJavaScript(`updateError("${errorCode} ${errorDescription}","${validateUrl}")`)
            .catch(console.debug);
    }

    getReplUrl() {
        try {
            return this.webContents
                .getURL()
                .replace(/(^\w+:|^)\/\/replit\.com\//, '')
                .replace(/(^\w+:|^)\/\/repl\.it\//, '')
                .split('?')[0];
        } catch (e) {
            return '';
        }
    }

    addTheme(code: string = 'default') {
        if (code == 'default') {
            if (settings.has('theme')) {
                code = <string>settings.get('theme').code;
            } else return;
        }
        settings.set('theme', {
            code: code
        });
        if (!code) return;
        this.webContents.executeJavaScript(
            `{
                let p1 = document.getElementById("reflux-theme"),
                    p2 = document.getElementById("reflux-display");
                if (p1 && p2) {
                    p1.remove();
                    p2.remove();
                }
            }`,
            true
        );
        this.webContents.executeJavaScript(this.themeProcessor(code), true);
    }

    themeProcessor(theme: string) {
        return theme
            .replace('javascript:', '')
            .replace(/\n/g, '\\n')
            .replace(/alert/g, 'console.log')
            .replace(/confirm\(([^)]+)\);/gim, '(() => true)();')
            .replace(/target.insertAdjacentHTML\(([^)]+)\);/gim, '');
    }
}

interface Version {
    major: number;
    minor: number;
    patch: number;
    versionString?: string;
}

interface CheckUpdateResult {
    hasUpdate: boolean;
    changeLog?: string;
    version?: string;
}

interface DownloadUpdateResult {
    success: boolean;
    downloadFilePath?: string;
    error?: string;
}

interface UpdateAssetsUrls {
    windowsUrl: string;
    macOSUrl: string;
    linuxUrl: string;
}

interface LauncherStatus {
    text: string;
    downloaded?: number;
    totalLength?: number;
    percentage?: string;
}

type GithubReleaseResponse = Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

function capitalize(str: string) {
    return str.replace(/(^|\s)([a-z])/g, (p1: String, p2: String) => {
        return `${p1}${p2.toUpperCase().toString()}`;
    });
}

function selectInput(focusedWindow: ElectronWindow) {
    focusedWindow.webContents.executeJavaScript('document.getElementsByTagName("input")[0].focus().select()', false);
}

function handleExternalLink(event: Event, windowObj: ElectronWindow, url: string) {
    if (!url) return;
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://replit.com/~').catch();
    } else if (!(url.includes('replit') || url.includes('repl.co') || url.includes('repl.it'))) {
        console.debug(`External URL: ${url}`);
        event.preventDefault();
        dialog
            .showMessageBox({
                title: 'Confirm External Links',
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ['No', 'Yes'],
                defaultId: 1
            })
            .then((resp: MessageBoxReturnValue) => {
                const index = resp.response;
                if (index === 1) {
                    shell.openExternal(url);
                }
            });
    }
}

function promptYesNoSync(message: string, title: string, detail?: string): number {
    return dialog.showMessageBoxSync({
        type: 'info',
        message: message,
        title: title,
        buttons: ['No', 'Yes'],
        defaultId: 1,
        detail: detail
    });
}

const PLATFORM = platform();
export {
    Version,
    CheckUpdateResult,
    ElectronWindow,
    UpdateAssetsUrls,
    GithubReleaseResponse,
    LauncherStatus,
    DownloadUpdateResult,
    handleExternalLink,
    selectInput,
    PLATFORM,
    promptYesNoSync,
    capitalize
};
