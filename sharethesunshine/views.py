from flask import Flask, render_template, request, flash
from flask_mail import Message, Mail
from flask_sqlalchemy import SQLAlchemy

import stripe

from sharethesunshine import app

from .models import Purchase, Testimonial, db
from .forms import PurchaseForm

stripe_keys = {
    'secret_key': 'sk_test_HsuAieq5wo8ZSAm3lEushARi',
    'publishable_key': 'pk_test_7MmO7bkJvlkV0TfD1YfFcnVf'
}

stripe.api_key = stripe_keys['secret_key']

app.config['MAIL_SERVER'] = 'smtp.webfaction.com'
app.config['MAIL_USERNAME'] = 'patrickbeeson_mail'
app.config['MAIL_PASSWORD'] = '6ElevenBicycleC0'

mail = Mail()

mail.init_app(app)


@app.route('/')
def home():
    form = PurchaseForm()
    testimonials = Testimonial.query.limit(3).all()
    return render_template('index.html', form=form, testimonials=testimonials, key=stripe_keys['publishable_key'])


@app.route('/buy', methods=['POST'])
def buy():
    form = PurchaseForm()

    # Cost of Sunshine in cents
    amount = 500
    # Get the purchaser email from the Stripe Checkout form
    email = request.form['stripeEmail']
    # Get the token from the Stripe Checkout form
    stripe_token = request.form['stripeToken']

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

    # Try and validate the form on submission
    if form.validate_on_submit():
        new_purchase = Purchase(
            form.recipient_name.data,
            form.recipient_email.data,
            form.shipping_street_address_1.data,
            form.shipping_street_address_2.data,
            form.shipping_city.data,
            form.shipping_state.data,
            form.shipping_zip.data,
            form.purchaser_name.data,
            form.purchaser_email.data,
            form.personal_message.data
        )
        # Send valid data to the database
        db.session.add(new_purchase)
        db.session.commit()

        # Send the purchaser an email using the purchaser_email value
        mail_html = render_template(
            'email.html',
            purchase=new_purchase
            )

        message = Message(
            html=mail_html,
            subject='Thank you for sharing Sunshine!',
            sender='noreply@sharethesunshine.com',
            recipients=[email])

        with mail.connect() as conn:
            conn.send(message)

        # Send the user to the thanks template to view their order summary
        return render_template('thanks.html', purchase=new_purchase, amount=amount)
    else:
        return render_template('submission_error.html')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500
