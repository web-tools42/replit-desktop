import { BrowserWindow } from 'electron';

class ElectronWindow extends BrowserWindow {
    public InternalId = -1;
}

interface Version {
    major: number;
    minor: number;
    patch: number;
}

interface checkUpdateResult {
    hasUpdate: boolean;
    changeLog?: string;
    version?: string;
}

export { Version, checkUpdateResult, ElectronWindow };
