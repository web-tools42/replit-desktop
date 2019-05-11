import { dialog } from 'electron'
import { ElectronWindow } from '../lib/ts-class'

function errorMessage(
    windowObject: ElectronWindow,
    errorCode: any,
    errorDescription: any
) {
    let id = windowObject.InternalId
    if (errorCode > -6 || errorCode <= -300) {
        return
    }
    dialog.showMessageBox(
        {
            title: 'Loading Failed',
            message: `loading Failed on window ${id} reason ${errorDescription} code ${errorCode}, do you want to try again?`,
            type: 'error',
            buttons: ['Try again please', 'Quit'],
            defaultId: 0,
        },
        function(index) {
            // if clicked "Try again please"
            if (index === 0) {
                windowObject.reload()
            } else {
                process.exit()
            }
        }
    )
}

export { errorMessage }
