import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sharethesunshine.db'
db = SQLAlchemy(app)


class Product(db.Model):
	__tablename__ = 'product'
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	name = db.Column(db.String(80))
	description = db.Column(db.Text)
	is_active = db.Column(db.Boolean, default=True, nullable=True)

	def __init__(self, name, description, is_active):
		self.name = name
		self.description = description
		self.is_active = is_active

	def __repr__(self):
		return '<Product %r>' % self.name

class Purchase(db.Model):
	__tablename__ = 'purchase'
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
	product = db.relationship('Product')
	quantity = db.Column(db.Integer)
	sold_at = db.Column(db.DateTime, default=datetime.datetime.now)
	recipient_name = db.Column(db.String(250))
	receipient_email = db.Column(db.String(100))
	receipient_address = db.Column(db.Text)
	purchaser_name = db.Column(db.String(250))
	purchaser_email = db.Column(db.String(100))

	def __init__(self, product, quantity, sold_at, recipient_name, receipient_email, receipient_address, purchaser_name, purchaser_email)
		self.product = product
		self.quantity = quantity
		self.sold_at = sold_at
		self.recipient_name = recipient_name
		self.receipient_email = receipient_email
		self.receipient_address = receipient_address
		self.purchaser_name = purchaser_name
		self.purchaser_email = purchaser_email

	def __repr__(self):
		return '{} bought by {}'.format(self.product.name, self.purchaser_email)