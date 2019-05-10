function selectInput(focusedWindow: any) {
        focusedWindow.webContents.executeJavaScript(
            `document.getElementsByTagName('input')[0].focus().select()`,
            false
        );
}

export {selectInput}