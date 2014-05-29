import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sharethesunshine.db'
db = SQLAlchemy(app)


class Purchase(db.Model):
    __tablename__ = 'purchase'
    #id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    uuid = db.Column(db.String, primary_key=True)
    recipient_name = db.Column(db.String(250))
    receipient_email = db.Column(db.String(100))
    shipping_street_address_1 = db.Column(db.String(250))
    shipping_street_address_2 = db.Column(db.String(250))
    shipping_city = db.Column(db.String(250))
    shipping_state = db.Column(db.String(2))
    shipping_zip = db.Column(db.Integer)
    purchaser_name = db.Column(db.String(250))
    purchaser_email = db.Column(db.String(100))
    personal_message = db.Column(db.Text)
    sold_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, uuid, recipient_name,
                 receipient_email, shipping_street_address_1,
                 shipping_street_address_2, shipping_city,
                 shipping_state, shipping_zip, purchaser_name,
                 purchaser_email, personal_message, sold_at):
        self.uuid = uuid
        self.recipient_name = recipient_name
        self.receipient_email = receipient_email
        self.shipping_street_address_1 = shipping_street_address_1
        self.shipping_street_address_2 = shipping_street_address_2
        self.shipping_city = shipping_city
        self.shipping_state = shipping_state
        self.shipping_zip = shipping_zip
        self.purchaser_name = purchaser_name
        self.purchaser_email = purchaser_email
        self.personal_message = personal_message
        self.sold_at = sold_at

    def __repr__(self):
        return '<Purchase %r>' % self.id


class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author = db.Column(db.String(100))
    testimonial = db.Column(db.Text)
    salutation = db.Column(db.String(100))

    def __init__(self, author, testimonial, salutation):
        self.author = author
        self.testimonial = testimonial
        self.salutation = salutation

    def __repr__(self):
        return '<Testimonial %r>' %self.id
