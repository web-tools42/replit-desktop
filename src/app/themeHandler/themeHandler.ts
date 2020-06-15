import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { ipcMain } from 'electron';
import ejs from 'ejs';
import { parse } from 'querystring';
import { assign, cloneDeep } from 'lodash';
import { THEME_TEMPLATE } from './themeTemplate';

interface themeQuery {
    text: string;
    text2: string;
    text3: string;
    bg: string;
    main: string;
    bright: string;
    confirm: string;
    grayscale: boolean;
    monospace: boolean;
    upvote: string;
    upvoted: string;
    fallback: string;
    graylogo: boolean;
    announcements: string;
}

const DEFAULT_THEME: themeQuery = {
    // blue theme
    text: 'c0c0c0',
    text2: 'adadad',
    text3: 'a8a8a8',
    bg: '111c31',
    main: '212e44',
    bright: 'fffff',
    confirm: '63C090',
    grayscale: false,
    monospace: false,
    upvote: '',
    upvoted: '',
    fallback: '',
    graylogo: false,
    announcements: '232528'
};

class ThemeHandler {
    public themeWindow: ElectronWindow;
    private readonly settings: SettingHandler;

    constructor(settings: SettingHandler) {
        this.themeWindow = null;
        this.settings = settings;

        if (
            !this.settings.has('theme.cssString') ||
            this.settings.get('theme.cssString') == '' ||
            this.settings.get('theme.cssString').toString().includes(':root')
        ) {
            this.resetTheme().then();
        }
        ipcMain.on('choose-theme', (e, url: string) => {
            this.saveTheme(url)
                .then(() => {
                    e.returnValue = 'Success';
                })
                .catch((error) => {
                    e.returnValue = 'Failed: ' + error;
                });
        });
    }
    async saveTheme(url: string) {
        if (url == 'white-theme') {
            this.resetTheme(true).then();
            return;
        }
        let query: themeQuery = cloneDeep(DEFAULT_THEME);
        assign(query, parse(url));
        this.settings.set('theme', {
            cssString: ejs.render(THEME_TEMPLATE, query)
        });
    }

    async resetTheme(whiteTheme: boolean = false) {
        if (whiteTheme) {
            this.settings.set('theme', { cssString: '' });
            return;
        }
        this.saveTheme('bg=111c31&main=212e44').then();
    }

    getString(): string {
        return <string>this.settings.get('theme.cssString');
    }

    openThemeWindow(parentWindow: ElectronWindow) {
        if (!this.themeWindow) {
            this.themeWindow = new ElectronWindow(
                {
                    parent: parentWindow,
                    show: false
                },
                true
            );
            this.themeWindow.on('close', () => {
                this.themeWindow = null;
            });
            this.themeWindow.loadFile('app/themeHandler/themes.html').then();
            this.themeWindow.on('ready-to-show', () => {
                this.themeWindow.show();
            });
        }
    }
    editHtml(html: string, css: string = '') {
        return (
            html
                .replace(/<\/head>/gi, `<style>${css}</style></head>`)
                .replace(/src="\/(?!\/)/gi, 'src="https://repl.it/') // make all scripts absolute
                .replace(
                    /(?<=<meta property="og:title" content=")(\S+)(?=".+>)/gi,
                    'Repl Talk Dark Theme Preview'
                ) // change opengraph description
                .replace(
                    /(?<=<meta property="og:description" content=")(\S+)(?=".+>)/gi,
                    'Preview a custom Repl.it dark theme.'
                ) // change opengraph title
                // remove unnecessary scripts
                .replace(
                    /<script ([^<]{1,})analytics([^\\]{1,}?)<\/script>/gi,
                    ''
                ) // remove tracking scripts
                .replace(
                    /<script ([^<]{1,})recaptcha([^\\]{1,}?)<\/script>/gi,
                    ''
                ) // remove recaptcha
                .replace(
                    /<script ([^<]{1,}?)cloudflare([^\\]{1,}?)<\/script>/gi,
                    ''
                ) // remove cloudflare stuff
                .replace(/<link ([^<]{1,}?)cloudflare([^>]{1,}?)>/gi, '') // remove cloudflare stuff
                .replace(
                    /<script ([^<]{1,}?)https:\/\/repl.it\/_next([^\\]{1,}?)<\/script>/gi,
                    ''
                ) // remove _next stuff
                .replace(
                    /<link ([^<]{1,}?)https:\/\/repl.it\/_next([^>]{1,}?)>/gi,
                    ''
                ) // remove _next stuff
                .replace(
                    /<script async=\"\" id=\"__NEXT_PAGE__\/([^<]{1,})<\/script>/gi,
                    ''
                )
        ); // remove recaptcha
    }
}

export { ThemeHandler };
