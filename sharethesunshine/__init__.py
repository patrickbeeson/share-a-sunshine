from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

app.config['SECRET_KEY']

db = SQLAlchemy(app)

from sharethesunshine import views
from .util import assets

if __name__ == '__main__':
    app.run()
