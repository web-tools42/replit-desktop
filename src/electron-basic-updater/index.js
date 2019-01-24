/**
 * Hi there,
 * Thanks for using this module, and good luck with your Electron app.
 *
 * ~ Zain
 * */
const Application = require('electron').app;
const FileSystem = require('fs');
const Utils = require('util');
const Zip = require('zip-local');
const HTTP = require('restler');
const path = require('path');
const fs = require('fs');
const AppPath = Application.getAppPath() + path.sep;
const UpperAppPath = path.dirname(AppPath) + path.sep;


const errors = [
    'version_not_specified',
    'cannot_connect_to_api',
    'no_update_available',
    'api_response_not_valid',
    'update_file_not_found',
    'failed_to_download_update',
    'failed_to_apply_update'
];

/**
 * */
var Updater = {
    /**
     * The setup
     * */
    'setup': {
        'api': null,
        'logFile': 'updater-log.txt',
        'requestOptions': {},
        'callback': false

    },

    /**
     * The new update information
     * */
    'update': {
        'last': null,
        'source': null,
        'file': null
    },

    /**
     * Init the module
     * */
    'init': function (setup) {
        this.setup = Utils._extend(this.setup, setup);
    },

    /**
     * Logging
     * */
    'log': function (line) {
        // Log it
        console.log('Updater: ', line);
        // Put it into a file
        if (this.setup.logFile) {
            FileSystem.appendFileSync(path.dirname(UpperAppPath + path.sep) + path.sep + this.setup.logFile, line + "\n");
        }
    },

    /**
     * Triggers the callback you set to receive the result of the update
     * */
    'end': function (error, message) {
        if (typeof this.setup.callback != 'function') return false;

        this.setup.callback.call(this, (error !== 'undefined' && error !== undefined ? errors[error] : message), this.update.last);
    },

    /**
     * Make the check for the update
     * */
    'check': function (callback) {
        console.log(`Log file: ${path.dirname(UpperAppPath + path.sep) + path.sep + this.setup.logFile}`
        );
        if (callback) {
            this.setup.callback = callback;
        }

        // Get the current version
        var packageInfo = require(AppPath + 'package.json');

        // If the version property not specified
        if (!packageInfo.version) {
            this.log('The "version" property not specified inside the application package.json');
            this.end(0);

            return false;
        }

        var requestOptions = Utils._extend({}, this.setup.requestOptions);
        if (!requestOptions.data) {
            requestOptions.data = {};
        }

        // Send the current version along with the request
        requestOptions.data.current = packageInfo.version;

        // Check for updates
        HTTP.post(this.setup.api, requestOptions)
            .on('complete', function (result) {
                // If the request failed
                if (result instanceof Error) {
                    Updater.log('Could not connect, ' + result.message);
                    Updater.end(1);
                    return false;
                }

                // Connected!
                Updater.log('Connected to ' + Updater.setup.api);

                // Handle the response
                try {
                    if (!result) {
                        throw false;
                    }

                    // Parse the response
                    var response = typeof result === 'object' ? result : JSON.parse(result);

                    // If the "last" property is not defined
                    if (!response.last) {
                        throw false;
                    }

                    // Update available
                    if (response.source) {
                        Updater.log('Update available: ' + response.last);

                        // Store the response
                        Updater.update = response;
                        if (!(response.change_log)) {
                            change_log = undefined
                        }
                        Updater.end(undefined, 'has_update|' + response.last + '|' + response.change_log);
                        return true;
                    } else {
                        Updater.log('No updates available');
                        Updater.end(2);

                        return false;
                    }


                } catch (error) {
                    Updater.log('API response is not valid');
                    Updater.end(3);
                }
            });
    },

    /**
     * Download the update file
     * */
    'download': function (doApply, applyCallback) {
        var url = this.update.source,
            fileName = 'update.zip';
        //ipcMain.on('updater-log', (event, arg) => {
        //    console.log(`From ${event.sender}: ${arg}`);
        //    updateWindowWebContents = event.sender;
        //});

        this.log('Downloading ' + url);

        var requestOptions = Utils._extend({}, this.setup.requestOptions);
        requestOptions.decoding = 'buffer';

        // Download the file
        HTTP.get(url, requestOptions)
            .on('complete', function (data) {
                // The request failed
                if (data instanceof Error) {
                    Updater.log('Could not find the update file.');
                    Updater.end(4);
                    return false;
                }

                // The file full path
                var updateFile = UpperAppPath + fileName;

                // Create the file
                FileSystem.writeFile(updateFile, data, null, function (error) {
                    if (error) {
                        Updater.log('Failed to download the update to a local file.');
                        Updater.log(error);
                        Updater.end(5);
                        return false;
                    }

                    // Store the update file path
                    Updater.update.file = updateFile;

                    // Success
                    Updater.log('Update downloaded: ' + updateFile);
                    if (doApply) {
                        Updater.apply(applyCallback)
                    }
                });
            });
    },

    /**
     * Apply the update, it simply overwrites the current files!
     * */
    'apply': function (callback) {
        if (callback) {
            this.setup.callback = callback;
        }
        try {
            this.log('Extracting the new update files.');
            this.log(`zip file path: ${this.update.file}`);
            this.log(`app path: ${AppPath}`);
            this.log('extraction started');
            process.noAsar = true;
            Zip.sync.unzip(this.update.file).save(UpperAppPath);
            process.noAsar = false;
            this.log('ended');
            this.log('New update files were extracted.');
            this.log('End of update.');
            fs.unlink(this.update.file, (err) => {
                if (err) {
                    console.error('Removing zip error ' + err)
                } else {
                    console.log(`Removed zip file ` + this.update.file)
                }
            });
            fs.unlink(path.dirname(UpperAppPath + path.sep) + path.sep + this.setup.logFile, (err) => {
                if (err) {
                    console.error('Removing log error ' + err)
                } else {
                    console.log(`Removed log file ` + path.dirname(UpperAppPath + path.sep) + path.sep + this.setup.logFile)
                }
            });
            //Success
            this.end(undefined, 'success');

        } catch (error) {
            this.log('Extraction error: ' + error);

            // Failure
            this.end(6);
        }
    }
};

module.exports = Updater;
