import { ElectronWindow } from '../../common';
import { settings } from '../settingHandler';
import { ipcMain } from 'electron';

class ThemeHandler {
    private theme_market: ElectronWindow;
    constructor(Main: ElectronWindow) {
        ipcMain.on('Theme', (event, code: string) => {
            this.addTheme(Main, code);
        });
    }
    openWindow() {
        this.theme_market = new ElectronWindow({ title: 'Themes' }, '', true);
        this.theme_market.setBackgroundColor('#393c42');
        this.theme_market.loadURL(`file://${__dirname}/themes.html`);
    }

    openMaker() {
        this.theme_market = new ElectronWindow({ title: 'Theme Maker' }, '', true, true);
        this.theme_market.setBackgroundColor('#393c42');
        this.theme_market.loadURL(`file://${__dirname}/editor/editor.html`);
    }

    setTheme(window: ElectronWindow, code: string) {
        if (!code) return;
        window.webContents.executeJavaScript(
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
        window.webContents.executeJavaScript(this.themeProcessor(code), true);
    }

    addTheme(parentWindow: ElectronWindow, code: string = 'default') {
        if (code == 'default') {
            if (settings.has('theme')) {
                code = <string>settings.get('theme').code;
            } else return;
        }
        settings.set('theme', {
            code: code
        });
        this.setTheme(parentWindow, code);
    }

    themeProcessor = (theme: string) => {
        return theme
            .replace('javascript:', '')
            .replace(/\n/g, '\\n')
            .replace(/alert/g, 'console.log')
            .replace(/confirm\(([^)]+)\);/gim, '(() => true)();')
            .replace(/target.insertAdjacentHTML\(([^)]+)\);/gim, '');
    };
}

export { ThemeHandler };
