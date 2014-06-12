from flask_wtf import Form
from wtforms import TextField, TextAreaField, IntegerField, PasswordField, SubmitField
from wtforms.fields.html5 import EmailField
from wtforms.validators import DataRequired, Length


class LoginForm(Form):
    """ Form class for user login """
    email = TextField('email', validators=[DataRequired('Please enter an email address.')])
    password = PasswordField('password', validators=[DataRequired('Please enter a password')])
    submit = SubmitField('Log In')


class PurchaseForm(Form):
    """ Form class for purchase """
    recipient_name = TextField('Recipient\'s name',
                               description='First Last',
                               validators=[DataRequired('Please enter the receipient\'s full name.')])
    recipient_email = EmailField('Recipient\'s email',
                                 description='Email',
                                 )
    shipping_street_address_1 = TextField('Street address 1',
                                          description='Street Address 1',
                                          validators=[DataRequired('Please enter the recipient\'s street address.')])
    shipping_street_address_2 = TextField('Street address 2',
                                          description='Street Address 2',)
    shipping_city = TextField('City',
                              description='City',
                              validators=[DataRequired('Please enter the recipient\'s city.')])
    shipping_state = TextField('State',
                               description='State',
                               validators=[DataRequired('Please enter the recipient\'s state.')])
    shipping_zip = IntegerField('Zip',
                                description='Zip',
                                validators=[DataRequired('Please enter the recipient\'s zip code.')])
    purchaser_name = TextField('Your name',
                               description='Note: Your name will appear on the outside of the box with your personalized message. If you\'d like to cheer up someone anonymously, leave this field blank.')
    personal_message = TextAreaField('Personalized message',
                                     description='140 characters max',
                                     validators=[DataRequired('Please enter a message.'), Length(message='Please reduce your message to 140 characters or less.', max=140)])
