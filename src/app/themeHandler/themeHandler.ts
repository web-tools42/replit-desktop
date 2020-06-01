import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import fetch from 'node-fetch';

class ThemeHandler {
    public themeWindow: ElectronWindow;
    private readonly settings: SettingHandler;

    constructor(mainWindow: ElectronWindow, settings: SettingHandler) {
        this.themeWindow = new ElectronWindow({
            parent: mainWindow,
            show: false
        });
        this.settings = settings;

        if (!this.settings.has('theme.cssString')) {
            this.saveTheme(
                'https://darktheme.matdoes.dev/theme.css?bg=111c31&main=212e44'
            ).then();
        }
    }

    async saveTheme(url: string) {
        try {
            const cssText = await (await fetch(url)).text();
            this.settings.set('theme', { cssString: cssText });
        } catch (e) {
            console.log(e);
        }
    }

    getString(): string {
        return <string>this.settings.get('theme.cssString');
    }
}

export { ThemeHandler };
