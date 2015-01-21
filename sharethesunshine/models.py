import datetime

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

from . import app

app.config['SQLALCHEMY_DATABASE_URI']
db = SQLAlchemy(app)


class CouponCode(db.Model):
    """
    A coupon code object.
    """
    __tablename__ = 'couponcodes'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(250), unique=True)
    active = db.Column(db.Boolean, default=True)
    redemption_date = db.Column(db.DateTime)

    def redeem(self):
        "Set redemption_date for coupon"
        self.redemption_date = datetime.datetime.utcnow()
        db.session.add(self)

    def __repr__(self):
        return '<CouponCode {}>'.format(self.code)

    def __str__(self):
        return self.code


class User(UserMixin, db.Model):
    """
    An administrative user of this application.
    """
    __tablename__ = 'users'
    email = db.Column(db.String(255), primary_key=True)
    password = db.Column(db.String)
    authenticated = db.Column(db.Boolean, default=False)

    def is_active(self):
        "True, as all users are active."
        return True

    def get_id(self):
        "Return the email address to satify Flask-Login's requirements."
        return self.email

    def is_authenticated(self):
        "Return True if the user is authenticated."
        return self.authenticated

    def is_anonymous(self):
        "False, as anonymous users aren't supported."
        return False

    def __repr__(self):
        return '<User {}}>'.format(self.email)


class Product(db.Model):
    """ A product for sale """
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(250))
    is_active = db.Column(db.Boolean, default=True, nullable=True)
    price = db.Column(db.Float)

    def __repr__(self):
        return '<product {}>'.format(self.name)

    def __str__(self):
        return self.name


class Purchase(db.Model):
    """ A purchase """
    __tablename__ = 'purchases'
    uuid = db.Column(db.String, primary_key=True)
    recipient_name = db.Column(db.String(250))
    recipient_email = db.Column(db.String(100))
    shipping_street_address_1 = db.Column(db.String(250))
    shipping_street_address_2 = db.Column(db.String(250))
    shipping_city = db.Column(db.String(250))
    shipping_state = db.Column(db.String(2))
    shipping_zip = db.Column(db.Integer)
    purchaser_name = db.Column(db.String(250))
    purchaser_email = db.Column(db.String(100))
    personal_message = db.Column(db.Text)
    sold_at = db.Column(db.DateTime, default=datetime.datetime.now)
    quantity = db.Column(db.Integer, default=1)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    product = db.relationship(Product)
    coupon_used = db.Column(db.Boolean, default=False, nullable=True)

    def sell_date(self):
        " Return the purchase sold date."
        return self.sold_at.date()

    def __repr__(self):
        return '<Purchase {}>'.format(self.sold_at)


class Testimonial(db.Model):
    """ A testimonial for a product sold. """
    __tablename__ = 'testimonials'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author = db.Column(db.String(100))
    testimonial = db.Column(db.Text)
    salutation = db.Column(db.String(100))

    def __repr__(self):
        return '<Testimonial {}>'.format(self.id)

    def __str__(self):
        return self.testimonial


class MessageCategory(db.Model):
    """ A category for prefilled messages """
    __tablename__ = 'message_categories'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text, nullable=True)
    prefilled_messages = db.relationship(
        'PrefilledMessage',
        backref='message_category'
    )

    @property
    def get_messages_for_category(self):
        "Gets prefilled messages for a given message category."
        return PrefilledMessage.query.filter(
            PrefilledMessage.category_id == self.id
        ).all()

    def __repr__(self):
        return '<MessageCategory {}>'.format(self.title)

    def __str__(self):
        return self.title


class PrefilledMessage(db.Model):
    """ A pre-written message for sunshine purchases. """
    __tablename__ = 'prefilled_messages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    message = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('message_categories.id'))

    def __repr__(self):
        return '<PrefilledMessage {}'.format(self.id)

    def __str__(self):
        return self.message
