import { Launcher } from './launcher/launcher';
import { app } from 'electron';

let launcher: Launcher;

function initalize() {
    launcher = new Launcher();
    launcher.init();
    launcher.window.once('ready-to-show', function () {
        launcher.window.show();
    });
}

app.once('ready', function () {
    initalize();
});
