import {dialog, app} from 'electron';
import path from 'path';
import EBU from '../electron-basic-updater';

function doUpdate(Update: boolean, Manual: boolean) {
        if (!Update) {
                return;
        }
        EBU.init({
                api: 'https://replit-electron-updater.leon332157.repl.co/check/' // The API EBU will talk to
        });
        EBU.check(function (result: string) {
                console.log(result);
                if (result.toString().startsWith('has_update|')) {
                        dialog.showMessageBox(
                            {
                                    title: 'Update available',
                                    message: `New version ${
                                        result.toString().split('|')[1]
                                        } is available, would you like to update it?

New features:
${result.toString().split('|')[2]}
`,
                                    type: 'info',
                                    buttons: ['Yes', 'No'],
                                    defaultId: 1
                            },
                            function (index: number) {
                                    if (index === 0) {
                                            EBU.download(true, function (result: string) {
                                                    if (result.toString() === 'success') {
                                                            dialog.showMessageBox({
                                                                    title: 'Update success',
                                                                    message: `Update was successful, please restart the app.`,
                                                                    type: 'info'
                                                            });
                                                            process.exit(0);
                                                    } else {
                                                            dialog.showMessageBox({
                                                                    title: 'Update failed',
                                                                    message: `Update failed, please check log file at ${path.dirname(
                                                                        app.getAppPath() + path.sep
                                                                    ) + path.sep}.`,
                                                                    type: 'info'
                                                            });
                                                    }
                                            });
                                    }
                            }
                        );
                } else {
                        if (Manual) {
                                dialog.showMessageBox({
                                        title: 'No New Update available',
                                        message: `Congratulations, you are already using the latest version ${app.getVersion()}`,
                                        type: 'info'
                                });
                        }
                }
        });
}

export {doUpdate}