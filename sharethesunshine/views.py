import uuid
import datetime
import csv
import cStringIO

from flask import render_template, request, redirect, flash, url_for, session, send_file, jsonify
from flask_mail import Message, Mail
from flask_restless import APIManager, ProcessingException
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CsrfProtect

import stripe
from sqlalchemy import desc

from . import app

from .models import Product, Purchase, Testimonial, User, db, MessageCategory, CouponCode
from .forms import PurchaseForm, LoginForm, CouponCodeForm

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

CsrfProtect(app)


@login_manager.user_loader
def user_loader(user_id):
    "Given user_id, return the associated User object."
    return User.query.get(user_id)


@app.route("/login", methods=["GET", "POST"])
def login():
    """
    For GET requests, display the login form. For POSTS, login the current
    user by processing the form
    """
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.get(form.email.data)
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                user.authenticated = True
                db.session.add(user)
                db.session.commit()
                login_user(user, remember=True)
                return redirect(url_for('sales_export'))
    return render_template("login.html", form=form)


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    "Logout the current user"
    user = current_user
    user.authenticated = False
    db.session.add(user)
    db.session.commit()
    logout_user()
    flash('You have been logged out.')
    return render_template("logout.html")


@app.route('/')
def home():
    "The homepage"
    purchase_form = PurchaseForm()
    couponcode_form = CouponCodeForm()

    testimonials = Testimonial.query.order_by(
        desc(Testimonial.id)).limit(5).all()

    return render_template('home.html',
                           form=purchase_form,
                           couponcode_form=couponcode_form,
                           testimonials=testimonials)


@app.route('/parents-weekend')
def parents_weekend():
    "A special landing page for parent's weekend"
    form = PurchaseForm()

    testimonials = Testimonial.query.order_by(
        desc(Testimonial.id)).limit(5).all()

    message_categories = MessageCategory.query.all()
    return render_template('home_parents_weekend.html',
                           form=form,
                           testimonials=testimonials,
                           message_categories=message_categories,
                           key=stripe_keys['publishable_key'])


@app.route('/code_validate', methods=['POST'])
def code_validate():
    "Handle coupon code redemption"
    if request.method == 'POST':
        response_data = {}
        incoming_data = request.get_json()
        response_data['code'] = incoming_data['code']
        response_data['response'] = 'OK'
        validated_code = incoming_data['code']
        validated_code = CouponCode.query.filter_by(code=validated_code).first()
        if validated_code and validated_code.active:
            validated_code.active = False
            validated_code.redeem()
            db.session.merge(validated_code)
            db.session.commit()
            response_data['response'] = 'Code accepted!'
            response_data['price'] = 'Free'
            response_data['code_applied'] = True
            return jsonify(response_data)
        elif validated_code and not validated_code.active:
            response_data['response'] = 'Code already used!'
            return jsonify(response_data)
        else:
            response_data['response'] = 'Invalid or missing code!'
            return jsonify(response_data)
        return jsonify(response_data)


@app.route('/buy', methods=['POST'])
def buy():
    "Handle the form submission (i.e. purchase)"
    form = PurchaseForm()

    # Get five testimonials for display
    testimonials = Testimonial.query.order_by(
        desc(Testimonial.id)).limit(5).all()

    # Set product to Sunshine since that's our only product for now
    product = Product.query.filter_by(name='sunshine').first()

    if request.form.get('stripeToken'):
        token = request.form.get('stripeToken')

    # Get our price in dollars and turn it to cents
    amount = int(product.price * 100)

    # Set quanity to one since that's all folks can buy currently
    quantity = 1

    # Try and validate the form on submission
    if form.validate_on_submit():
        # Try to charge the card via Stripe if token exists
        if request.form.get('stripeToken'):
            try:
                charge = stripe.Charge.create(
                    amount=amount,
                    currency='usd',
                    card=token,
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
            purchaser_email=form.purchaser_email.data,
            personal_message=form.personal_message.data,
            sold_at=datetime.datetime.now(),
            quantity=quantity,
            product=product,
            coupon_used=form.coupon_used.data,
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
        session['purchaser_email'] = purchase.purchaser_email

        # Send the purchaser an email using the purchaser_email value
        mail_html = render_template(
            'email.html',
            purchase=purchase
            )

        message = Message(
            html=mail_html,
            subject='You\'ve shared Sunshine. Everyone is happy.',
            sender='noreply@shareasunshine.com',
            recipients=[purchase.purchaser_email, 'sales@shareasunshine.com']
        )

        with mail.connect() as conn:
            conn.send(message)

        # Redirect the user to the thanks template to view their order summary
        return redirect(url_for('thanks'))
    return render_template(
        'home.html',
        form=form,
        testimonials=testimonials)


@app.route('/thanks')
def thanks():
    "Post purchase confirmation"
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


@app.route('/sales-export')
@login_required
def sales_export():
    "Sales export"
    purchases = Purchase.query.all()
    start_date = Purchase.query.first().sold_at.strftime('%x')
    end_date = Purchase.query.all()[-1].sold_at.strftime('%x')
    return render_template('sales_export.html', start_date=start_date, end_date=end_date)


@app.route('/download')
@login_required
def download():
    "Export a CSV of all sales data"
    purchases = Purchase.query.all()
    csvfile = cStringIO.StringIO()
    headers = [
        'uuid',
        'recipient_name',
        'recipient_email',
        'shipping_street_address_1',
        'shipping_street_address_2',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'purchaser_name',
        'purchaser_email',
        'personal_message',
        'sold_at',
        'coupon_used'
    ]
    rows = []
    for purchase in Purchase.query.all():
        rows.append(
            {
                'uuid': purchase.uuid,
                'recipient_name': purchase.recipient_name,
                'recipient_email': purchase.recipient_email,
                'shipping_street_address_1': purchase.shipping_street_address_1,
                'shipping_street_address_2': purchase.shipping_street_address_2,
                'shipping_city': purchase.shipping_city,
                'shipping_state': purchase.shipping_state,
                'shipping_zip': purchase.shipping_zip,
                'purchaser_name': purchase.purchaser_name,
                'purchaser_email': purchase.purchaser_email,
                'personal_message': purchase.personal_message,
                'sold_at': purchase.sold_at.strftime('%c'),
                'coupon_used': purchase.coupon_used
            }
        )
    writer = csv.DictWriter(csvfile, headers)
    writer.writeheader()
    for row in rows:
        writer.writerow(
            dict(
                (k, v.encode('utf-8') if type(v) is unicode else v) for k, v in row.iteritems()
            )
        )
    csvfile.seek(0)
    return send_file(csvfile, attachment_filename='sales_export.csv', as_attachment=True)


def auth_func(**kw):
    "Send a 401 if user isn't logged in"
    if not current_user.is_authenticated():
        raise ProcessingException(description='Not Authorized', code=401)

"Only logged in users can view the API for purchases"
manager.create_api(
    Purchase,
    preprocessors=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func]))


@app.route('/terms')
def terms():
    "Terms and conditions"
    return render_template('terms.html',)


@app.errorhandler(404)
def page_not_found(error):
    "404 page"
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(error):
    "500 page"
    return render_template('500.html'), 500
