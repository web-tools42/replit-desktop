const common = require('../../common');
class PopoutHandler {
    constructor() {}
    launch(win) {
        let repl_url = common.getUrl(win);
        if (/\@.*\/.*/.test(repl_url)) {
            let Terminal = new common.ElectronWindow(
                {
                    width: 600,
                    height: 600
                },
                `${__dirname}/console.js`
            );
            Terminal.loadURL(
                `https://repl.it/${repl_url.split('#')[0]}?outputonly=1`
            );
        }
    }
}
exports.PopoutHandler = PopoutHandler;
