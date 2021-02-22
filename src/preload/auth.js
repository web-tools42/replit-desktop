Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window.opener = {
    postMessage: (event, data) => {
        electron_1.ipcRenderer.send('authDone', '');
        window.close();
    }
};
