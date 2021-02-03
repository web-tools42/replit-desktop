if [ ! -d "/home/runner/repl-it-electron/node_modules" ];then
    echo "Installing dependencies"
    npm i
fi
npm start