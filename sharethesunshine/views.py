import uuid
import datetime

from flask import render_template, request, redirect, flash, url_for, session
from flask_mail import Message, Mail
from flask_restless import APIManager, ProcessingException
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from flask_bcrypt import Bcrypt

import stripe
from sqlalchemy import desc

from . import app

from .models import Product, Purchase, Testimonial, User, db
from .forms import PurchaseForm, LoginForm

login_manager = LoginManager()
bcrypt = Bcrypt()

manager = APIManager(app, flask_sqlalchemy_db=db)

stripe_secret_key = app.config['STRIPE_SECRET_KEY']
stripe_publishable_key = app.config['STRIPE_PUBLIC_KEY']

stripe_keys = {
    'secret_key': stripe_secret_key,
    'publishable_key': stripe_publishable_key
}

stripe.api_key = stripe_keys['secret_key']

app.config['MAIL_SERVER']
app.config['MAIL_USERNAME']
app.config['MAIL_PASSWORD']

mail = Mail()
mail.init_app(app)


@login_manager.user_loader
def user_loader(user_id):
    """Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (email) user to retrieve
    """
    return User.query.get(user_id)


@app.route("/login", methods=["GET", "POST"])
def login():
    """ For GET requests, display the login form. For POSTS, login the current
    user by processing the form """
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.get(form.email.data)
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                user.authenticated = True
                db.session.add(user)
                db.session.commit()
                login_user(user, remember=True)
                return redirect('/api/purchases', code=302)
    return render_template("login.html", form=form)


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    """ Logout the current user """
    user = current_user
    user.authenticated = False
    db.session.add(user)
    db.session.commit()
    logout_user()
    flash('You have been logged out.')
    return render_template("logout.html")


@app.route('/')
def home():
    """ The homepage """
    form = PurchaseForm()

    testimonials = Testimonial.query.order_by(
        desc(Testimonial.id)).limit(5).all()

    return render_template('home.html',
                           form=form,
                           testimonials=testimonials,
                           key=stripe_keys['publishable_key'])


@app.route('/buy', methods=['POST'])
def buy():
    """ Handle the form submission (i.e. purchase) """
    form = PurchaseForm()
    # Get five testimonials for display
    testimonials = Testimonial.query.order_by(
        desc(Testimonial.id)).limit(5).all()

    # Set product to Sunshine since that's our only product for now
    product = Product.query.filter_by(name='sunshine').first()

    # Get our price in dollars and turn it to cents
    amount = int(product.price * 100)
    # Get the purchaser email from the Stripe Checkout form
    email = request.form['stripeEmail']
    # Get the token from the Stripe Checkout form
    stripe_token = request.form['stripeToken']
    # Set quanity to one since that's all folks can buy currently
    quantity = 1

    # Try and validate the form on submission
    if form.validate_on_submit():
        # Create the Stripe customer
        customer = stripe.Customer.create(
            email=email,
            card=stripe_token
        )
        # Try to charge the card via Stripe
        try:
            charge = stripe.Charge.create(
                customer=customer.id,
                amount=amount,
                currency='usd',
                description=product.description)
        # Present new template if there is a problem charging the card
        except stripe.CardError:
            return render_template('charge_error.html')

        purchase = Purchase(
            uuid=str(uuid.uuid4()),
            recipient_name=form.recipient_name.data,
            recipient_email=form.recipient_email.data,
            shipping_street_address_1=form.shipping_street_address_1.data,
            shipping_street_address_2=form.shipping_street_address_2.data,
            shipping_city=form.shipping_city.data,
            shipping_state=form.shipping_state.data,
            shipping_zip=form.shipping_zip.data,
            purchaser_name=form.purchaser_name.data,
            purchaser_email=email,
            personal_message=form.personal_message.data,
            sold_at=datetime.datetime.now(),
            quantity=quantity,
            product=product
        )
        # Send valid data to the database
        db.session.add(purchase)
        db.session.commit()

        # Put purchase data into sessions for use after post
        session['uuid'] = purchase.uuid
        session['purchaser_name'] = purchase.purchaser_name
        session['shipping_street_address_1'] = purchase.shipping_street_address_1
        session['shipping_street_address_2'] = purchase.shipping_street_address_2
        session['shipping_city'] = purchase.shipping_city
        session['shipping_state'] = purchase.shipping_state
        session['recipient_name'] = purchase.recipient_name
        session['personal_message'] = purchase.personal_message

        # Send the purchaser an email using the purchaser_email value
        mail_html = render_template(
            'email.html',
            purchase=purchase
            )

        message = Message(
            html=mail_html,
            subject='You\'ve shared Sunshine. Everyone is happy.',
            sender='noreply@shareasunshine.com',
            recipients=[email, 'sales@shareasunshine.com']
        )

        with mail.connect() as conn:
            conn.send(message)

        # Redirect the user to the thanks template to view their order summary
        return redirect(url_for('thanks'))
    return render_template(
        'home.html',
        form=form,
        testimonials=testimonials,
        key=stripe_keys['publishable_key'])


@app.route('/thanks')
def thanks():
    """ Post purchase confirmation """
    return render_template(
        'thanks.html',
        uuid=session.get('uuid'),
        purchaser_name=session.get('purchaser_name'),
        shipping_street_address_1=session.get('shipping_street_address_1'),
        shipping_street_address_2=session.get('shipping_street_address_2'),
        shipping_city=session.get('shipping_city'),
        shipping_state=session.get('shipping_state'),
        recipient_name=session.get('recipient_name'),
        personal_message=session.get('personal_message'),
    )


def auth_func(**kw):
    """ Send a 401 if user isn't logged in """
    if not current_user.is_authenticated():
        raise ProcessingException(description='Not Authorized', code=401)

""" Only logged in users can view the API for purchases """
manager.create_api(
    Purchase,
    preprocessors=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func]))


@app.route('/terms')
def terms():
    """ Terms and conditions """
    return render_template('terms.html',)


@app.errorhandler(404)
def page_not_found(error):
    """ 404 page """
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(error):
    """ 500 page """
    return render_template('500.html'), 500
