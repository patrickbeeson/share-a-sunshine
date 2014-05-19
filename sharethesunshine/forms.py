from flask_wtf import Form
from wtforms import TextField, TextAreaField, IntegerField, SubmitField
from wtforms.fields.html5 import EmailField
from wtforms.validators import email, DataRequired, Length


class PurchaseForm(Form):
    recipient_name = TextField('Recipient name', validators=[DataRequired('Please enter the receipient\'s full name.')])
    recipient_email = EmailField('Recipient email', validators=[email('Please enter a valid email address.')])
    shipping_street_address_1 = TextField('Street address 1', validators=[DataRequired('Please enter the recipient\'s street address.')])
    shipping_street_address_2 = TextField('Street address 2')
    shipping_city = TextField('City', validators=[DataRequired('Please enter the recipient\'s city.')])
    shipping_state = TextField('State', validators=[DataRequired('Please enter the recipient\'s state.')])
    shipping_zip = IntegerField('Zip', validators=[DataRequired('Please enter the recipient\'s zip code.')])
    purchaser_name = TextField('Your name')
    #purchaser_email = EmailField('Your email', validators=[DataRequired('Please enter your email address.'), email('Please enter a valid email address.')])
    personal_message = TextAreaField('Personalized message', validators=[DataRequired('Please enter a message.'), Length(max=140)])
