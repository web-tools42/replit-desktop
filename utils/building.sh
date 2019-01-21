#!/usr/bin/env bash
cd ~/desktop/repl.it/pre-distribute

DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=win32 --arch=ia32 --icon='/Users/lynnzheng/Desktop/repl.it/logos/ico/logo.ico'

DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=win32 --arch=x64 --icon='/Users/lynnzheng/Desktop/repl.it/logos/ico/logo.ico'

DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=darwin --icon='/Users/lynnzheng/Desktop/repl.it/logos/icns/icon.icns'


cd ~/desktop/repl.it/distribute

electron-installer-zip ../pre-distribute/repl.it-win32-ia32/repl.it.exe 'repl.it-x32-portable.zip' --verbose

electron-installer-zip ../pre-distribute/repl.it-win32-x64/repl.it.exe 'repl.it-x64-portable.zip' --verbose

electron-installer-dmg ../pre-distribute/repl.it-darwin-x64/repl.it.app repl.it --debug --icon='/Users/lynnzheng/Desktop/repl.it/logos/icns/logo_256x256.icns'

cd ~/desktop/repl.it

echo "Started uploading update"

python3 utils/upload-update.py

echo "Done"
