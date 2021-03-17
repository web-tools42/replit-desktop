import path from 'path';

import { ElectronWindow } from '../../common';

class PopoutHandler {
    constructor() {}

    launch(win: ElectronWindow) {
        // Handle the repl url, make sure it is there repl and a repl
        let replUrl = win.getReplUrl();
        if (/\@.*\/.*/.test(replUrl)) {
            let Terminal = new ElectronWindow(
                {
                    width: 600,
                    height: 600
                },
                path.join(__dirname, 'console.js')
            );

            Terminal.loadURL(`https://replit.com/${replUrl.split('#')[0]}?outputonly=1`);
        }
    }
}

export { PopoutHandler };
