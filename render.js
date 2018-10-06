// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
function isOnline() {
    /**
     * Show a warning to the user.
     * You can retry in the dialog until a internet connection
     * is active.
     */
    const message = function () {
        const {dialog} = require('electron').remote;
        const remote = require("electron").remote;

        return dialog.showMessageBox({
            title: "There's no internet.",
            message: "No internet available, do you want to try again?",
            type: 'warning',
            buttons: ["Try again please.", "Quit"],
            defaultId: 0
        }, function (index) {
            // if clicked "Try again please"
            if (index == 0) {
                execute();
            }
            else {
                remote.getCurrentWindow().close()
            }
        })
    };

    var execute = function () {

        if (navigator.onLine) {
        }
        else {
            // Show warning to user
            // And "retry" to connect
            message();
        }
    };

    // Verify for first time
    execute();
}

isOnline()