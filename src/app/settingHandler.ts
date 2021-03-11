import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import writeFileAtomic from 'write-file-atomic';

class SettingHandler {
    public settingsFilePath: string;

    public settings: Map<string, any>;

    constructor() {
        this.settingsFilePath = path.join(app.getPath('home'), '.replit', 'settings.json');
        // Load the settings
        this.settings = new Map();
        this.ensureFileSync();
        try {
            let Data = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf-8'));
            if (!Data.Version) Data.Map = new Map();
            this.settings = new Map(Data.Map);
        } catch (err) {
            this.resetAll();
            let Data = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf-8'));
            if (!Data.Version) Data.Map = new Map();
            this.settings = new Map(Data.Map);
        }
    }

    private ensureFileSync() {
        try {
            fs.statSync(path.dirname(this.settingsFilePath));
        } catch (err) {
            if (err.code == 'ENOENT') {
                console.debug('Creating folder');
                fs.mkdirSync(path.dirname(this.settingsFilePath));
            }
        }
        try {
            fs.statSync(this.settingsFilePath);
        } catch (err) {
            if (err.code == 'ENOENT') {
                console.debug('Creating settings file');
                this.saveSettings();
            } else throw err;
        }
    }

    private saveSettings() {
        try {
            writeFileAtomic.sync(
                this.settingsFilePath,
                JSON.stringify(
                    {
                        Version: '2',
                        Map: Array.from(this.settings.entries())
                    },
                    null,
                    4
                )
            );
        } catch (err) {
            console.error(err);
        }
    }

    has(key: string) {
        return this.settings.has(key);
    }

    get(key: string) {
        return this.settings.has(key) ? this.settings.get(key) : null;
    }

    set(key: string, value: any) {
        this.settings.set(key, value);
        this.saveSettings();
    }

    unset(key: string) {
        this.settings.delete(key);
        this.saveSettings();
    }

    resetAll() {
        this.saveSettings();
    }

    clearAll() {
        this.settings.clear();
        this.saveSettings();
    }
}

const settings = new SettingHandler();
export { settings };
