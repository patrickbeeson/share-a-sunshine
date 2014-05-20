from flask_wtf import Form
from wtforms import TextField, TextAreaField, IntegerField
from wtforms.fields.html5 import EmailField
from wtforms.validators import email, DataRequired, Length


class PurchaseForm(Form):
    recipient_name = TextField('Recipient\'s name',
                               description='First Last',
                               validators=[DataRequired('Please enter the receipient\'s full name.')])
    recipient_email = EmailField('Recipient\'s email',
                                 validators=[email('Please enter a valid email address.')])
    shipping_street_address_1 = TextField('Street address 1',
                                          validators=[DataRequired('Please enter the recipient\'s street address.')])
    shipping_street_address_2 = TextField('Street address 2')
    shipping_city = TextField('City',
                              validators=[DataRequired('Please enter the recipient\'s city.')])
    shipping_state = TextField('State',
                               validators=[DataRequired('Please enter the recipient\'s state.')])
    shipping_zip = IntegerField('Zip',
                                validators=[DataRequired('Please enter the recipient\'s zip code.')])
    purchaser_name = TextField('Your name',
                               description='Note: Your name will appear on the outside of the box with your personalizedmessage. If you\'d like to cheer up someone anonymously, leave this field blank.')
    purchaser_email = EmailField('Your email',
                                 validators=[DataRequired('Please enter your email address.'),
                                 email('Please enter a valid email address.')])
    personal_message = TextAreaField('Personalized message',
                                     description='140 characters max',
                                     validators=[DataRequired('Please enter a message.'),
                                     Length(max=140)])
