Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = exports.capitalize = exports.promptYesNoSync = exports.PLATFORM = exports.selectInput = exports.handleExternalLink = exports.ElectronWindow = void 0;
const electron_1 = require("electron");
const os_1 = require("os");
const path = require("path");
class ElectronWindow extends electron_1.BrowserWindow {
    constructor(options, preload = '', nodeIntegration = false, webviewTag = false) {
        if (preload.length > 0 &&
            !preload.includes(__dirname) &&
            !preload.startsWith('./')) {
            preload = path.join(__dirname, 'preload', preload);
        }
        super({
            ...options,
            show: false,
            minHeight: 300,
            minWidth: 400,
            webPreferences: {
                devTools: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                spellcheck: true,
                contextIsolation: false,
                nodeIntegration: nodeIntegration,
                preload: preload,
                webviewTag: webviewTag
            },
            icon: `${__dirname}/512x512.png`
        });
        this.setBackgroundColor('#393c42');
        this.once('ready-to-show', () => this.show());
        this.webContents.on('did-fail-load', (e, code, description, validateUrl) => {
            this.handleLoadingError(e, this, code, description, validateUrl);
        });
    }
    async handleLoadingError(event, windowObject, errorCode, errorDescription, validateUrl) {
        if (errorCode > -6 || errorCode <= -300) {
            return;
        }
        await windowObject.loadFile('app/offline.html');
        windowObject.webContents
            .executeJavaScript(`updateError("${errorCode} ${errorDescription}","${validateUrl}")`)
            .catch(console.debug);
    }
}
exports.ElectronWindow = ElectronWindow;
function capitalize(str) {
    return str.replace(/(^|\s)([a-z])/g, (p1, p2) => {
        return `${p1}${p2.toUpperCase().toString()}`;
    });
}
exports.capitalize = capitalize;
function selectInput(focusedWindow) {
    focusedWindow.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].focus().select()`, false);
}
exports.selectInput = selectInput;
function handleExternalLink(event, windowObj, url) {
    if (!url)
        return;
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://repl.it/~').catch();
    }
    else if (!(url.includes('repl.it') ||
        url.includes('repl.co') ||
        url.includes('google.com') ||
        url.includes('repl.run'))) {
        console.debug(`External URL: ${url}`);
        event.preventDefault();
        electron_1.dialog
            .showMessageBox({
            title: 'Confirm External Links',
            message: `${url} Looks like an external link, would you like to load it externally?`,
            type: 'info',
            buttons: ['No', 'Yes'],
            defaultId: 1
        })
            .then((resp) => {
            const index = resp.response;
            if (index === 1) {
                electron_1.shell.openExternal(url).then();
            }
        });
    }
}
exports.handleExternalLink = handleExternalLink;
function getUrl(windowObj) {
    try {
        return windowObj.webContents
            .getURL()
            .replace(/(^\w+:|^)\/\/repl\.it\//, '')
            .split('?')[0];
    }
    catch (e) {
        return '';
    }
}
exports.getUrl = getUrl;
function promptYesNoSync(message, title, detail) {
    return electron_1.dialog.showMessageBoxSync({
        type: 'info',
        message: message,
        title: title,
        buttons: ['No', 'Yes'],
        defaultId: 1,
        detail: detail
    });
}
exports.promptYesNoSync = promptYesNoSync;
const PLATFORM = os_1.platform();
exports.PLATFORM = PLATFORM;
