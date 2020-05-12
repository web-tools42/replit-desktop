import { ElectronWindow } from '../common';

function selectInput(focusedWindow: ElectronWindow) {
    focusedWindow.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].focus().select()`,
        false
    );
}

export { selectInput };
