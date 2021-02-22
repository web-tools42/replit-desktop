var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingHandler = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
class SettingHandler {
    constructor() {
        this.settingsFilePath = `${path_1.default.dirname(electron_1.app.getPath('userData'))}${path_1.default.sep}settings.json`;
        this.ensureFileSync();
        this.settings = {};
        try {
            this.settings = JSON.parse(fs_1.default.readFileSync(this.settingsFilePath, 'utf-8'));
        }
        catch {
            this.resetAll();
            this.settings = JSON.parse(fs_1.default.readFileSync(this.settingsFilePath, 'utf-8'));
        }
    }
    ensureFileSync() {
        try {
            fs_1.default.statSync(this.settingsFilePath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                console.debug('creating file');
                this.saveSettings();
            }
            else
                throw err;
        }
    }
    saveSettings() {
        write_file_atomic_1.default.sync(this.settingsFilePath, JSON.stringify(this.settings, null, 4));
    }
    has(key) {
        return this.settings.hasOwnProperty(key);
    }
    get(key) {
        return this.has(key) ? this.settings[key] : null;
    }
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    unset(key) {
        delete this.settings[key];
        this.saveSettings();
    }
    resetAll() {
        this.saveSettings();
    }
}
exports.SettingHandler = SettingHandler;
