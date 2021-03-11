import { ElectronWindow } from '../../common';
import { settings } from '../settingHandler';
import { ipcMain } from 'electron';

class ThemeHandler {
    public themeWindow: ElectronWindow;
    protected mainAppWindow: ElectronWindow;
    constructor(mainWindow: ElectronWindow) {
        ipcMain.on('Theme', (event, code: string) => {
            this.addTheme(mainWindow, code);
        });
        this.mainAppWindow = mainWindow;
    }
    openWindow() {
        this.themeWindow = new ElectronWindow(
            {
                title: 'Themes',
                x: this.mainAppWindow.getPosition()[0] + 500,
                y: this.mainAppWindow.getPosition()[1] + 500
            },
            '',
            true
        );
        this.themeWindow.setBackgroundColor('#393c42');
        this.themeWindow.loadURL(`file://${__dirname}/themes.html`);
        this.themeWindow.on('resized', () => {
            const size = this.themeWindow.getSize();
            this.mainAppWindow.setSize(size[0], size[1]);
        });
    }

    openMaker() {
        this.themeWindow = new ElectronWindow(
            {
                title: 'Theme Maker',
                parent: this.mainAppWindow,
                x: this.mainAppWindow.getPosition()[0] + 500,
                y: this.mainAppWindow.getPosition()[1] + 500
            },
            '',
            true,
            true
        );
        this.themeWindow.setBackgroundColor('#393c42');
        this.themeWindow.loadURL(`file://${__dirname}/editor/editor.html`);
        this.themeWindow.on('resized', () => {
            const size = this.themeWindow.getSize();
            this.mainAppWindow.setSize(size[0], size[1]);
        });
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
