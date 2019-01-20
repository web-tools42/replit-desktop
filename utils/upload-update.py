import json
import logging
import os
import zipfile

import dotenv
import requests

dotenv.load_dotenv('update-server/.env')
TOKEN = os.getenv('TOKEN')
logging.basicConfig(level=logging.DEBUG)
version = json.load(open('src/package.json'))['version']
update = zipfile.ZipFile(f'pre-distribute/{version}.zip', 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9)
update.write('pre-distribute/repl.it-win32-ia32/resources/app.asar', arcname='app.asar')
update.close()

files = {'file': open(f'pre-distribute/{version}.zip', 'rb')}
for x in range(5):
    try:
        request = requests.post(f'https://replit-electron-updater.leon332157.repl.co/release?version={version}&token={TOKEN}',
                                files=files)
        break
    except requests.exceptions.ConnectionError as e:
        print(f'''
        $$$$$$$$\
        $$  _____|
        $$ |       $$$$$$\   $$$$$$\   $$$$$$\   $$$$$$\
        $$$$$\    $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\
        $$  __|   $$ |  \__|$$ |  \__|$$ /  $$ |$$ |  \__|
        $$ |      $$ |      $$ |      $$ |  $$ |$$ |
        $$$$$$$$\ $$ |      $$ |      \$$$$$$  |$$ |
        \________|\__|      \__|       \______/ \__|

        ''')
        print(e)
        continue
#os.remove(f'pre-distribute/{version}.zip')
