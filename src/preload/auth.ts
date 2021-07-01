import { ipcRenderer } from 'electron';

//@ts-ignore
window.opener = {
    postMessage: (event: any, data: any) => {
        ipcRenderer.send('authDone', '');
        window.close();
    }
};
