const {app, BrowserWindow, Menu, dialog} = require('electron');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');
const Store = require('electron-store');
const ElectronStore = new Store();
let DarkCSS;
let win;
var Dark;
var subWindow = undefined;
const clientId = '498635999274991626';
console.log(`Conf Path ${ElectronStore.path}`);
Dark = ElectronStore.get('DarkTheme', false);
var startTimestamp = new Date();

const rpc = new DiscordRPC.Client({transport: 'ipc'});
fs.readFile(__dirname + '/Dark.css', function (err, data) {
    if (err) {
        throw err;
    }
    return DarkCSS = data.toString();
});


const template = [
    {
        label: 'Files',
        submenu: [
            {
                label: 'New Window',
                accelerator: "CmdOrCtrl+N", click() {
                    startSubWindow(win.webContents.getURL())
                }
            },
            {type: 'separator'},
            {role: 'quit'}
        ],
    },
    {
        label: 'Edit',
        submenu: [
            {
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
            }
            , {type: 'separator'}
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Go Back', click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoBack()) {
                        focusedWindow.webContents.goBack()
                    }
                }
            },
            {
                label: 'Go Forward', click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoForward()) {
                        focusedWindow.webContents.goForward()
                    }
                }
            },
            {type: 'separator'},
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
                label: 'Select Input', accelerator: 'CmdOrCtrl+f', click(item, focusedWindow) {
                    selectInput(focusedWindow)
                }
            },
            {type: 'separator'},
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
        submenu: [
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click() {
                    require('electron').shell.openExternal('https://repl.it')
                }
            }
        ]
    }
];
if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
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
            {role: 'quit'},
        ]
    });
    // Edit menu.
    template[1].submenu.splice(-1);
    template[2].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Speech',
            submenu: [
                {
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        }
    );
    // Window menu.
    template[4].submenu = [
        {
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
const message = function (windowObject) {

    return dialog.showMessageBox({
        title: "Loading Failed",
        message: `loading Failed on window ${windowObject.id}, do you want to try again?`,
        type: 'error',
        buttons: ["Try again please", "Quit"],
        defaultId: 0
    }, function (index) {
        // if clicked "Try again please"
        if (index === 0) {
            windowObject.reload();
        } else {
            process.exit()
        }
    })
};

function startSubWindow(url) {
    if (subWindow !== undefined) {
        return
    }
    subWindow = new BrowserWindow(
        {
            width: 1280,
            height: 800,
            title: 'Repl.it',
            icon: '/icon.png'
        }
    );
    if (url) {
        subWindow.loadURL(url)
    } else {
        subWindow.loadURL('https://repl.it/repls')
    }
    subWindow.webContents.on('did-frame-finish-load', () => {
        addDark(subWindow, Dark);
    });
    subWindow.on('did-fail-load', () => {
        message(subWindow)
    });
    subWindow.on('close', () => {
        subWindow.prototype = {};
        subWindow = undefined;
    });
}


function addDark(windowObj, arg) {
    if (arg) {
        try {
            windowObj.webContents.insertCSS(DarkCSS);
            console.debug(`DarkCSS Added for ${windowObj.id}`);
            ElectronStore.set('DarkTheme', true);
        } catch (e) {
            console.error(`Error adding dark theme ${e}`)
        }
        return;
    }
    console.log(`nope for ${windowObj.id}`)
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
}`).catch((ret) => {
        })
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
            state: `${url}`,
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
        var replLanguage = 'Error';
        await win.webContents.executeJavaScript("document.querySelector('.file-header-name div').textContent", function (result) {
            fileName = result
        });
        await win.webContents.executeJavaScript("document.getElementsByTagName('title')[0].textContent.split('-').pop()", function (result) {
            replName = result
        });
        await win.webContents.executeJavaScript("document.querySelector('.workspace-header-description-container img')['title']", function (result) {
            replLanguage = result
        });

        var rawlang = fileName.split('.').slice(-1)[0]; // gets the file extension
        var lang = rawlang;
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
            'Error': 'txt'
        };
        rpc.setActivity({
            details: `Editing ${replName}: ${fileName}`,
            state: `repl.it/${url} `,
            startTimestamp,
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            largeImageKey: langsJson[lang],
            largeImageText: rawlang,
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

function createWindow() {
    win = new BrowserWindow(
        {
            width: 1280,
            height: 800,
            title: 'Repl.it',
            icon: '/icon.png'
        }
    );
    win.loadURL('https://repl.it/repls');
    win.webContents.on('did-fail-load', () => {
            message(win)
        }
    );
    Menu.setApplicationMenu(menu);
    win.webContents.on('did-frame-finish-load', () => {
        addDark(win, Dark);
    });

    win.on('closed', () => {
        // Dereference the window object, usually you would store windows in an array. if your app supports multi windows, this is the time when you should delete the corresponding element.
        app.quit()
    })
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
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
    process.exit(0)
});
app.on('ready', createWindow);
rpc.login({clientId}).catch(console.error);
