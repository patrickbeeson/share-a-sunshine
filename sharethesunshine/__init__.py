from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.secret_key = '\x03V\x96\xb6{#\x9f\x14K\xef{\x86Z\x14\xafZK/-\x84\xb0O\xcd\x13'

import sharethesunshine.views

if __name__ == '__main__':
    app.run()
