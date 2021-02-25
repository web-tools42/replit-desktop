import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import writeFileAtomic from 'write-file-atomic';

type SettingsValue =
    | null
    | boolean
    | string
    | number
    | {
          [key: string]: SettingsValue;
      }
    | SettingsValue[];

class SettingHandler {
    public settingsFilePath: string;

    public settings: Map<string, SettingsValue>;

    constructor() {
        this.settingsFilePath = `${path.dirname(app.getPath('userData'))}${
            path.sep
        }settings.json`;
        // Load the settings
        this.settings = new Map();
        this.ensureFileSync();
        try {
            let Data = JSON.parse(
                fs.readFileSync(this.settingsFilePath, 'utf-8')
            );
            if (!Data.Version) Data.Map = new Map();
            this.settings = new Map(Data.Map);
        } catch (err) {
            this.resetAll();
            let Data = JSON.parse(
                fs.readFileSync(this.settingsFilePath, 'utf-8')
            );
            if (!Data.Version) Data.Map = new Map();
            this.settings = new Map(Data.Map);
        }
    }

    private ensureFileSync() {
        try {
            fs.statSync(this.settingsFilePath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.debug('creating file');
                this.saveSettings();
            } else throw err;
        }
    }
    private saveSettings(): void {
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
    }
    has(key: string): boolean {
        return this.settings.has(key);
    }
    get(key: string): SettingsValue {
        return this.settings.has(key) ? this.settings.get(key) : null;
    }
    set(key: string, value: SettingsValue): void {
        this.settings.set(key, value);
        this.saveSettings();
    }
    unset(key: string): void {
        this.settings.delete(key);
        this.saveSettings();
    }
    resetAll(): void {
        this.saveSettings();
    }
}

export { SettingHandler };
