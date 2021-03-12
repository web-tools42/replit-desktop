import { ElectronWindow } from '../../common';
import { settings } from '../settingHandler';
import { ipcMain } from 'electron';

class ThemeHandler {
    public themeWindow: ElectronWindow;
    protected mainAppWindow: ElectronWindow;
    constructor(mainWindow: ElectronWindow) {
        ipcMain.on('Theme', (event, code: string) => {
            mainWindow.addTheme(code);
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
}

export { ThemeHandler };
