import { app, shell, clipboard } from 'electron'
import { ElectronWindow } from '../classes'

// @ts-ignore
function appMenuSetup(
    startSubWindow: Function,
    Preferences: object,
    startCustomSession: Function,
    sendSubToMain: Function,
    selectInput: Function,
    doUpdate: Function
): object {
    const template = [
        {
            label: 'Main',
            submenu: [
                {
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        startSubWindow()
                    },
                    label: 'Sub Window',
                },
                {
                    accelerator: 'CmdOrCtrl+L',
                    click() {
                        startCustomSession()
                    },
                    label: 'Join Multiplayer/Custom Repl.it Links',
                },
                {
                    label: 'Send Sub to Main Window',
                    click() {
                        sendSubToMain()
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Check Update Manually',
                    click() {
                        doUpdate(true, true)
                    },
                },
                {
                    accelerator: 'CmdOrCtrl+,',
                    click() {
                        // @ts-ignore
                        Preferences.show()
                    },
                    label: 'Preferences',
                },
                {
                    role: 'quit',
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo',
                },
                {
                    role: 'redo',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'cut',
                },
                {
                    role: 'copy',
                },
                {
                    role: 'paste',
                },
                {
                    role: 'pasteandmatchstyle',
                },
                {
                    role: 'delete',
                },
                {
                    role: 'selectall',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Copy URL to clipboard',
                    click(item: any, focusedWindow: ElectronWindow) {
                        clipboard.writeText(focusedWindow.webContents.getURL())
                    },
                },
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Go Back',
                    click(item: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow.webContents.canGoBack()) {
                            focusedWindow.webContents.goBack()
                        }
                    },
                },
                {
                    label: 'Go Forward',
                    click(item: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow.webContents.canGoForward()) {
                            focusedWindow.webContents.goForward()
                        }
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Open Current Link externally',
                    click(item: any, focusedWindow: ElectronWindow) {
                        shell.openExternal(focusedWindow.webContents.getURL())
                    },
                },
                {
                    label: 'Restore Blank Page',
                    click(item: any, focusedWindow: ElectronWindow) {
                        focusedWindow.loadURL('https://repl.it/repls')
                    },
                },
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select Input',
                    click(item: any, focusedWindow: ElectronWindow) {
                        selectInput(focusedWindow)
                    },
                },
                {
                    type: 'separator',
                },
                {
                    accelerator: 'CmdOrCtrl+R',
                    click(item: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    },
                    label: 'Reload',
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Alt+Command+I'
                            : 'Ctrl+Shift+I',
                    click(item: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools()
                    },
                },
                {
                    type: 'separator',
                },
                {
                    role: 'resetzoom',
                },
                {
                    role: 'zoomin',
                },
                {
                    role: 'zoomout',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'togglefullscreen',
                },
            ],
        },
        {
            role: 'window',
            submenu: [
                {
                    role: 'minimize',
                },
                {
                    role: 'close',
                },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    type: 'separator',
                },
                {
                    label: 'Learn More about repl.it',
                    click() {
                        shell.openExternal('https://repl.it/site/about')
                    },
                },
            ],
        },
    ]
    if (process.platform === 'darwin') {
        const name = app.getName()
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'services',
                    // @ts-ignore
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    role: 'hide',
                },
                {
                    role: 'hideothers',
                },
                {
                    role: 'unhide',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'quit',
                },
            ],
        })
        // Edit menu.
        // @ts-ignore
        template[1].submenu.splice(-1)
        template[2].submenu.push(
            // @ts-ignore
            {
                type: 'separator',
            },
            {
                label: 'Speech',
                submenu: [
                    {
                        role: 'startspeaking',
                    },
                    {
                        role: 'stopspeaking',
                    },
                ],
            }
        )
        // Window menu.
        // @ts-ignore
        template[4].submenu = [
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close',
            },
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize',
            },
            {
                label: 'Zoom',
                role: 'zoom',
            },
            {
                type: 'separator',
            },
            {
                label: 'Bring All to Front',
                role: 'front',
            },
        ]
    }
    if (process.platform !== 'darwin') {
        // @ts-ignore
        template[template.length - 1].submenu.push({
            role: 'about',
        })
    }
    return template
}

export { appMenuSetup }
