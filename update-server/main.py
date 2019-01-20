import json
import logging
import os
import platform
import threading
import time
from datetime import datetime

import dotenv
import flask
import requests
from pytz import utc, timezone
from werkzeug.utils import secure_filename


def customTime(*args):
    utc_dt = utc.localize(datetime.utcnow())
    my_tz = timezone("US/Eastern")
    converted = utc_dt.astimezone(my_tz)
    return converted.timetuple()


logging.Formatter.converter = customTime
dotenv.load_dotenv()

TOKEN = os.getenv('TOKEN')

if platform != 'darwin':
    os.chdir('/')
    logging.basicConfig(
        filename='home/runner/log.txt',
        filemode='a',
        level=logging.INFO,
        format="%(asctime)s %(message)s")
app = flask.Flask(__name__, root_path=os.getcwd())


@app.route('/')
def index():
    return '\n'.join(os.listdir('home/runner/'))


@app.route('/log.txt/')
@app.route('/log')
def log():
    try:
        return flask.send_file('home/runner/log.txt')
    except OSError as e:
        return str(e)


@app.route('/updates/')
def updates():
    return '\n'.join(os.listdir('home/runner/updates/'))


@app.route('/update/')
def update():
    updates_list = []
    for each in os.listdir('home/runner/updates/'):
        updates_list.append(each.strip('.zip').replace('.', ''))
        return str(updates_list.sort(key=int))


@app.route('/release', methods=['POST'])
def add_release():
    token = flask.request.args.get('token', None)
    version = flask.request.args.get('version', None)
    if not token == TOKEN or not version:
        return flask.abort(403)
    f = flask.request.files['file']
    os.makedirs('home/runner/updates/', exist_ok=True)
    f.save(os.getcwd() + 'home/runner/updates/' + secure_filename(f.filename))
    return 'Success'


@app.route('/download/<name>')
def download(name):
    try:
        return flask.send_file(os.getcwd() + f'home/runner/updates/{name}')
    except OSError:
        return flask.abort(404)


@app.route('/remove_update/<name>')
def delete_release(name):
    token = flask.request.args.get('token', None)
    if not token == TOKEN:
        return flask.abort(403)
    if name.endswith('.zip'):
        try:
            os.remove(os.getcwd() + f'home/runner/updates/{name}')
        except OSError:
            return flask.abort(404)
    else:
        try:
            os.remove(os.getcwd() + f'home/runner/updates/{name}.zip')
        except OSError:
            return flask.abort(404)
    return 'Success remove ' + name


@app.route('/check/', methods=['POST', "GET"])
def give_update():
    updates_list = []
    for each in os.listdir(os.getcwd() + 'home/runner/updates/'):
        updates_list.append(each.strip('.zip').replace('.', ''))
        updates_list.sort(key=int)
    latest = ".".join(list(updates_list[-1]))
    client_version = flask.request.get_data().decode('utf8').replace('current=', '').replace('.', '')
    if client_version < updates_list[-1]:
        return json.dumps(
            {"last": f'{latest}', "source": f"http://replit-electron-updater.leon332157.repl.co/download/{latest}.zip"})
    else:
        return json.dumps({"last": f'{latest}', "source": False})


@app.route('/ping_google/')
def google():
    return 'Google'


@app.route('/ping/')
def ping():
    return 'ping'


@app.route('/favicon.ico')
def favicon():
    return flask.send_file(os.getcwd() + 'home/runner/logo.png')


def ping_myself():
    while True:
        requests.get('https://replit-electron-updater.leon332157.repl.co/ping/')
        time.sleep(300)


thread = threading.Thread(target=ping_myself)
thread.start()
app.run(host='0.0.0.0', port=3435)
