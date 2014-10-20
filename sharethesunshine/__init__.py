import os

import logging
from logging.handlers import RotatingFileHandler, SMTPHandler

from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config.from_object(os.environ['APP_SETTINGS'])

app.config['SECRET_KEY']
ADMINS = app.config['ADMINS']
MAIL_SERVER = app.config['MAIL_SERVER']
MAIL_USERNAME = app.config['MAIL_USERNAME']
MAIL_PASSWORD = app.config['MAIL_PASSWORD']

from . import views
from views import login_manager
from .util import assets

login_manager.init_app(app)
db = SQLAlchemy(app)

credentials = (
    MAIL_USERNAME,
    MAIL_PASSWORD
)

if not app.debug:
    file_handler = RotatingFileHandler(
        'sunshine_errors.log',
        maxBytes=10000,
        backupCount=3
    )
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    mail_handler = SMTPHandler(
        MAIL_SERVER,
        'error@shareasunshine.com',
        ADMINS, 'An error has occured',
        credentials=credentials
    )
    mail_handler.setLevel(logging.ERROR)
    app.logger.addHandler(mail_handler)

if __name__ == '__main__':
    app.run()
