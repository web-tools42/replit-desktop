/* Require Packages */
const {
    app,
    BrowserWindow,
    Menu,
    dialog,
    shell
} = require('electron');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');
const Store = require('electron-store');
const ElectronStore = new Store();
const ElectronPrompt = require('electron-prompt');
const request = require('request');
const ChromeErrors = require('chrome-network-errors');

/* Declare Constants */
let DarkCSS;
var Dark;
let win;
var subWindow = undefined;


/* Constant Variables */
const clientId = '498635999274991626';
console.log(`Conf Path ${ElectronStore.path}`);
Dark = ElectronStore.get('DarkTheme', false);
var startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});


/* Menu Template */
// noinspection SpellCheckingInspection
const template = [{
        label: 'Main',
        submenu: [{
                label: 'New Window',
                accelerator: "CmdOrCtrl+N",
                click() {
                    startSubWindow(win.webContents.getURL())
                }
            },
            {
                label: 'Join Multilayer',
                accelerator: "CmdOrCtrl+L",
                click() {
                    startLiveSession()
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ],
    },
    {
        label: 'Edit',
        submenu: [{
                role: 'undo'
            },
            {
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut'
            },
            {
                role: 'copy'
            },
            {
                role: 'paste'
            },
            {
                role: 'pasteandmatchstyle'
            },
            {
                role: 'delete'
            },
            {
                role: 'selectall'
            }, {
                type: 'separator'
            }
        ]
    },
    {
        label: 'View',
        submenu: [{
                label: 'Go Back',
                click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoBack()) {
                        focusedWindow.webContents.goBack()
                    }
                }
            },
            {
                label: 'Go Forward',
                click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoForward()) {
                        focusedWindow.webContents.goForward()
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Dark Mode',
                accelerator: "F10",
                click(item, focusedWindow) {
                    Dark = true;
                    addDark(focusedWindow, Dark)
                }
            },
            {
                label: 'Dark Mode Off',
                accelerator: "F9",
                click(item, focusedWindow) {
                    Dark = false;
                    try {
                        ElectronStore.set('DarkTheme', false);
                    } catch (e) {
                        console.error(e);

                    }
                    focusedWindow.reload()
                }
            },
            {
                label: 'Select Input',
                accelerator: 'CmdOrCtrl+f',
                click(item, focusedWindow) {
                    selectInput(focusedWindow)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'window',
        submenu: [{
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    },
    {
        role: 'help',
        submenu: [{
            label: 'Learn More',
            click() {
                require('electron').shell.openExternal('https://repl.it')
            }
        }]
    }
];
if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [{
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            },
        ]
    });
    // Edit menu.
    template[1].submenu.splice(-1);
    template[2].submenu.push({
        type: 'separator'
    }, {
        label: 'Speech',
        submenu: [{
                role: 'startspeaking'
            },
            {
                role: 'stopspeaking'
            }
        ]
    });
    // Window menu.
    template[4].submenu = [{
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ]
}
const menu = Menu.buildFromTemplate(template);


/* Load the dark theme CSS */
request('https://darktheme.tk/darktheme.css', function (error, response, body) {
    if (body === undefined) {


        if (error) {
            fs.readFile(__dirname + '/Dark.css', function (err, data) {
                if (err) {
                    throw err;
                }
                return DarkCSS = data.toString();
            });
        }
    } else {

        return DarkCSS = body.toString()
    }
});

//Editor TODO: Font size settings for Editor
//Editor TODO:Add custom themes from css.

function ErrorMessage(windowObject, errorCode) {
    dialog.showMessageBox({
        title: "Loading Failed",
        message: `loading Failed on window ${windowObject.InternalId} reason ${ChromeErrors[errorCode]}, do you want to try again?`,
        type: 'error',
        buttons: ["Try again please", "Quit"],
        defaultId: 0
    }, function (index) {
        // if clicked "Try again please"
        if (index === 0) {
            windowObject.reload();
        } else {
            app.quit()
        }
    })
}


function addDark(windowObj, arg) {
    if (arg) {
        try {
            windowObj.webContents.insertCSS(DarkCSS);
            console.debug(`DarkCSS Added for ${windowObj.InternalId}`);
            ElectronStore.set('DarkTheme', true);
        } catch (e) {
            console.error(`Error adding dark theme on ${e}`)
        }
        return;
    }
    console.log(`nope for ${windowObj.InternalId}`)
}

function startLiveSession() {
    ElectronPrompt({
            title: 'Join Multiplayer',
            label: 'URL:',
            value: 'https://repl.it/live',
            inputAttrs: {
                type: 'url',
                required: true
            },
            customStylesheet: Dark ? __dirname + '/PromptDark.css' : __dirname + '/Prompt.css'
        })
        .then((r) => {
            if (r === null || r.toString().replace(' ', '') === '' || !r.toString().startsWith('https://repl.it/live')) {
                dialog.showMessageBox({
                    title: "",
                    message: `Please input a valid URL.`,
                    type: 'info',
                    buttons: ["Ok"],
                    defaultId: 0
                })
            } else {
                if (subWindow !== undefined) {
                    dialog.showMessageBox({
                        title: "",
                        message: `Do you want to load ${r} in window 2?`,
                        type: 'info',
                        buttons: ["Yes", "No"],
                        defaultId: 0
                    }, (index) => {
                        if (index === 0) {
                            subWindow.loadURL(r)
                        } else {

                        }
                    })
                } else {
                    startSubWindow(r)
                }
            }
        })
        .catch(console.error);
}

function getUrl() {
    try {
        var url = win.webContents.getURL().replace(/(^\w+:|^)\/\/repl\.it\//, '');
        url = url.split('?')[0];
        return url
    } catch (e) {
        return ''
    }
}

var urlbefore = '';
var urlnow = '';

function setUrl() {
    urlbefore = urlnow;
    urlnow = getUrl();
    if (urlbefore !== urlnow) {
        startTimestamp = new Date();
    }
    if (win === undefined) {
        return
    }
    try {
        win.webContents.executeJavaScript(`
users=document.querySelectorAll('.jsx-1145327309:not(.leaderboard-list-item),a.jsx-774577553')
for (user in users) {
try{
user=users[user]
if (user.textContent.startsWith('ReplTalk ')) {
user.classList.add('bot');
}
}catch(e){}
}`).catch((ret) => {})
    } catch (e) {
        console.error(e)
    }
}

async function setPlayingDiscord() {
    var url = getUrl();
    var spliturl = url.split('/');

    if (spliturl[0] === 'repls') {
        rpc.setActivity({
            details: `Browsing Repls`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        });
    } else if (spliturl[0] === 'talk') {
        let viewing;
        if (spliturl[3] !== undefined) {
            await win.webContents.executeJavaScript("document.getElementsByClassName('board-post-detail-title')[0].textContent", function (result) {
                viewing = `Viewing ${result}`
            }) // gets the repl talk post name
        } else {
            viewing = url
        }
        var talkBoard = 'error';
        switch (spliturl[1]) {
            case 'announcements':
                talkBoard = 'Announcements';
                break;
            case 'ask':
                talkBoard = 'Ask';
                break;
            case 'challenge':
                talkBoard = 'Challenge';
                break;
            case 'learn':
                talkBoard = 'Learn';
                break;
            case 'share':
                talkBoard = 'Share';
                break;
            default:
                talkBoard = ''
        }
        console.log(talkBoard);
        rpc.setActivity({
            state: `${viewing}`,
            details: `In Repl Talk ${talkBoard}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            smallImageKey: 'talk',
            smallImageText: 'Repl Talk',
            instance: false
        });
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        var fileName = 'Error';
        var replName = 'Error';
        var replLanguage = 'Unknown';
        await win.webContents.executeJavaScript("document.querySelector('.file-header-name div').textContent", function (result) {
            fileName = result
        });
        await win.webContents.executeJavaScript("document.getElementsByTagName('title')[0].textContent.split('-').pop()", function (result) {
            replName = result
        });
        await win.webContents.executeJavaScript("document.querySelector('.workspace-header-description-container img')['title']", function (result) {
            replLanguage = result
        });

        var fileExtension = fileName.split('.').slice(-1)[0]; // gets the file extension
        var lang = fileExtension;
        if (replLanguage === 'Nodejs') {
            lang = 'node'
        }
        const langsJson = {
            'py': 'python',
            'cpp': 'cpp',
            'cs': 'csharp',
            'html': 'html',
            'css': 'css',
            'js': 'javascript',
            'node': 'nodejs',
            'java': 'java',
            'rb': 'ruby',
            'txt': 'txt',
            'go': 'go',
            'lua': 'lua',
            'sh': 'sh',
            'Unknown': 'txt'
        };

        if (!rawlang in langsJson) {
            lang = 'Unknown';
            rawlang = 'Unknown';
        }
        rpc.setActivity({
            details: `Editing: ${fileName}`,
            state: `${url} `,
            startTimestamp,
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            largeImageKey: langsJson[lang],
            largeImageText: langsJson[lang],
            instance: false
        }).catch((ret) => {
            console.debug(`error@editing ${ret}`)
        })
    } else if (spliturl[0] === 'talk') {
        rpc.setActivity({
            details: `In Repl Talk`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'talk',
            largeImageText: 'Repl Talk',
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            instance: false
        }).catch((ret) => {
            console.debug(`error@talk ${ret}`)
        })
    } else if (spliturl[0][0] === '@') {
        rpc.setActivity({
            details: `Looking at ${spliturl[0]}'s profile`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((ret) => {
            console.debug(`error@profile ${ret}`)
        })
    } else if (spliturl[0] === 'account') {
        rpc.setActivity({
            details: `Changing account settings`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((ret) => {
            console.debug(`error@acount ${ret}`)
        })
    } else {
        rpc.setActivity({
            details: `On Repl.it`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((ret) => {
            console.debug(`error@main ${ret}`)
        })
    }
}


function selectInput(focusedWindow) {
    focusedWindow.webContents.executeJavaScript(`document.getElementsByTagName('input')[0].focus().select()`, false);
}

function startSubWindow(url) {
    if (subWindow !== undefined) {
        return
    }
    subWindow = new BrowserWindow({
        width: win.getSize()[0] - 10,
        height: win.getSize()[1] - 10,
        title: 'Repl.it',
        icon: '/icon.png',
        parent: win,
        backgroundColor: '#393c42'
    });
    subWindow.InternalId = 2;
    if (url) {
        subWindow.loadURL(url)
    } else {
        subWindow.loadURL('https://repl.it/repls')
    }
    subWindow.webContents.on('did-frame-finish-load', () => {
        addDark(subWindow, Dark);
    });
    subWindow.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(subWindow, errorCode)
    });
    subWindow.on('close', () => {
        subWindow.prototype = {};
        subWindow = undefined;
    });
    subWindow.webContents.on('did-start-navigation', (event, url) => {
        if (url.toString().includes('repl.it') || url.toString().includes('repl.co') || url.toString().includes('google.com') | url.toString().includes('repl.run')) {} else {
            //if (subWindow.webContents.canGoBack()) {
            //    subWindow.webContents.goBack()
            //} else {
            //    subWindow.loadURL('https://repl.it/repls')
            //}
            dialog.showMessageBox({
                title: "Confirm External Links",
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ["No", "Yes"],
                defaultId: 1
            }, function (index) {
                if (index === 1) {
                    shell.openExternal(url);
                } else {

                }
            })
        }

    });
}

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'Repl.it',
        icon: '/icon.png',
        backgroundColor: '#393c42'
    });
    //    win.loadURL('127.0.0.1:1');
    win.InternalId = 1;
    win.loadURL('https://repl.it/repls');
    win.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(win, errorCode)
    });
    Menu.setApplicationMenu(menu);
    win.webContents.on('did-frame-finish-load', () => {
        addDark(win, Dark);
    });

    win.on('close', () => {
        try {
            var url = win.webContents.getURL();
        } catch (e) {

        }
        return dialog.showMessageBox({
            title: "Confirm Quit",
            message: `Are you sure you want to quit?`,
            type: 'info',
            buttons: ["Yes", "No"],
            defaultId: 0
        }, function (index) {
            if (index === 1) {
                delete win;
                win = createWindow();
                try {
                    win.loadURL(url)
                } catch (e) {

                }
            } else {
                app.quit()
            }
        })
    });
    win.webContents.on('did-start-navigation', (event, url) => {
        if (url.toString().includes('repl.it') || url.toString().includes('repl.co') || url.toString().includes('google.com') || url.toString().includes('repl.run')) {} else {
            //if (win.webContents.canGoBack()) {
            //    win.webContents.goBack()
            //} else {
            //    win.loadURL('https://repl.it/repls')
            //}
            dialog.showMessageBox({
                title: "Confirm External Links",
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ["No", "Yes"],
                defaultId: 1
            }, function (index) {
                if (index === 1) {
                    shell.openExternal(url);
                } else {

                }
            })
        }

    });
    return win;
}

rpc.on('ready', () => {
    win.on('did-finish-load', setPlayingDiscord);
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord();
    }, 15e3);
});
rpc.on('ready', () => {
    setInterval(setUrl, 1000);
});
app.on('window-all-closed', function () {
    app.quit()
});
app.on('ready', createWindow);
rpc.login({
    clientId
}).catch(console.error);