import uuid
import datetime

from flask import render_template, request
from flask_mail import Message, Mail

import stripe

from . import app

from .models import Purchase, Testimonial, db
from .forms import PurchaseForm

stripe_keys = {
    'secret_key': app.config['STRIPE_SECRET_KEY'],
    'publishable_key': app.config['STRIPE_PUBLIC_KEY']
}

stripe.api_key = stripe_keys['secret_key']

app.config['MAIL_SERVER']
app.config['MAIL_USERNAME']
app.config['MAIL_PASSWORD']

mail = Mail()

mail.init_app(app)


@app.route('/')
def home():
    form = PurchaseForm()
    testimonials = Testimonial.query.limit(3).all()
    return render_template('home.html', form=form, testimonials=testimonials, key=stripe_keys['publishable_key'])


@app.route('/buy', methods=['POST'])
def buy():
    form = PurchaseForm()
    testimonials = Testimonial.query.limit(3).all()

    # Cost of Sunshine in cents
    amount = 500
    # Get the purchaser email from the Stripe Checkout form
    email = request.form['stripeEmail']
    # Get the token from the Stripe Checkout form
    stripe_token = request.form['stripeToken']

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
                description='Share the Sunshine')
        # Present new template if there is a problem charging the card
        except stripe.CardError:
            return render_template('charge_error.html')
        # Grab the email address entered into Stripe, and send it to the form field for that data
        #form.purchaser_email.data = request.form['stripeEmail']

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
            sold_at=datetime.datetime.now()
        )
        # Send valid data to the database
        db.session.add(purchase)
        db.session.commit()

        # Send the purchaser an email using the purchaser_email value
        mail_html = render_template(
            'email.html',
            purchase=purchase
            )

        message = Message(
            html=mail_html,
            subject='You\'ve shared Sunshine. Everyone is happy.',
            sender='noreply@share.drinkthesunshine.com',
            recipients=[email])

        with mail.connect() as conn:
            conn.send(message)

        # Send the user to the thanks template to view their order summary
        return render_template('thanks.html', purchase=purchase, amount=amount)
    return render_template('home.html', form=form, testimonials=testimonials, key=stripe_keys['publishable_key'])


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500
