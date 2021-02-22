const electron = require('electron');
window.opener = {
    postMessage: (event, data) => {
        electron.ipcRenderer.send('authDone', '');
        window.close();
    }
};
