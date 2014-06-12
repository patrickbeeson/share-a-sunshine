from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

app.config['SECRET_KEY']

db = SQLAlchemy(app)

from sharethesunshine import views
from views import login_manager
from .util import assets

login_manager.init_app(app)

if __name__ == '__main__':
    app.run()
