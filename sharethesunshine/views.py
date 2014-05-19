from flask import Flask, render_template, request, flash
from flask_mail import Message, Mail
from flask_sqlalchemy import SQLAlchemy

import stripe

from sharethesunshine import app

from .models import Purchase, db
from .forms import PurchaseForm

stripe_keys = {
    'secret_key': 'sk_test_MX5WVdf7EHaWDHUlBNQuIxW2',
    'publishable_key': 'pk_test_RII6ISnXfbev5S7OoBMNq9R5'
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
    return render_template('index.html', form=form, key=stripe_keys['publishable_key'])


@app.route('/charge', methods=['POST'])
def charge():
    form = PurchaseForm()

    amount = 500
    email = request.form['stripeToken']
    stripe_token = request.form['stripeToken']

    customer = stripe.Customer.create(
        email=email,
        card=stripe_token
    )

    try:
        charge = stripe.Charge.create(
            customer=customer.id,
            amount=amount,
            currency='usd',
            description='Share the Sunshine')
    except stripe.CardError:
        return render_template('charge_error.html')

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
            #form.purchaser_email.data,
            form.personal_message.data
        )
        db.session.add(new_purchase)
        db.session.commit()

        mail_html = render_template(
            'email.html'
            )

        message = Message(
            html=mail_html,
            subject='Thank you for sharing Sunshine!',
            sender='noreply@sharethesunshine.com',
            recipients=[email])

        with mail.connect() as conn:
            conn.send(message)

        return render_template('thanks.html', purchase=new_purchase, amount=amount)
    return str(form.errors)
