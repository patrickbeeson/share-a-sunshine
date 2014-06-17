from flask_wtf import Form
from wtforms import TextField, TextAreaField, IntegerField, PasswordField, SubmitField, SelectField
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
                               validators=[DataRequired('Please enter the receipient\'s full name.'), Length(message='Please reduce your receipient\'s name to 250 characters or less.', max=250)]
                               )
    recipient_email = EmailField('Recipient\'s email',
                                 description='Email',
                                 validators=[Length(message='Please reduce your recipient\'s email to 100 characters or less.', max=100)]
                                 )
    shipping_street_address_1 = TextField('Street address 1',
                                          description='Street Address 1',
                                          validators=[DataRequired('Please enter the recipient\'s street address.'), Length(message='Please reduce your recipient\'s shipping address to 250 characters or less.', max=250)])
    shipping_street_address_2 = TextField('Street address 2',
                                          description='Street Address 2',
                                          validators=[Length(message='Please reduce your recipient\'s shipping address 2 to 250 characters or less.', max=250)]
                                          )
    shipping_city = TextField('City',
                              description='City',
                              validators=[DataRequired('Please enter the recipient\'s city.'), Length(message='Please reduce your recipient\'s city name to 250 characters or less.', max=250)]
                              )
    # Not shipping to Alaska or Hawaii
    shipping_state = SelectField('State',
                                 description='State (we only ship to the lower 48)',
                                 validators=[DataRequired('Please select the recipient\'s state.'), Length(message='Please reduce your recipient\'s state to 2 characters or less.', max=2)],
                                 choices=[('AL', 'Alabama'),
                                          ('AZ', 'Arizona'),
                                          ('AR', 'Arkansas'),
                                          ('CA', 'California'),
                                          ('CO', 'Colorado'),
                                          ('CT', 'Connecticut'),
                                          ('DE', 'Delaware'),
                                          ('FL', 'Florida'),
                                          ('GA', 'Georgia'),
                                          ('ID', 'Idaho'),
                                          ('IL', 'Illinois'),
                                          ('IN', 'Indiana'),
                                          ('IA', 'Iowa'),
                                          ('KS', 'Kansas'),
                                          ('KY', 'Kentucky'),
                                          ('LA', 'Louisiana'),
                                          ('ME', 'Maine'),
                                          ('MD', 'Maryland'),
                                          ('MA', 'Massachusetts'),
                                          ('MI', 'Michigan'),
                                          ('MN', 'Minnesota'),
                                          ('MS', 'Mississippi'),
                                          ('MO', 'Missouri'),
                                          ('MT', 'Montana'),
                                          ('NE', 'Nebraska'),
                                          ('NV', 'Nevada'),
                                          ('NH', 'New Hampshire'),
                                          ('NJ', 'New Jersey'),
                                          ('NM', 'New Mexico'),
                                          ('NY', 'New York'),
                                          ('NC', 'North Carolina'),
                                          ('ND', 'North Dakota'),
                                          ('OH', 'Ohio'),
                                          ('OK', 'Oklahoma'),
                                          ('OR', 'Oregon'),
                                          ('PA', 'Pennsylvania'),
                                          ('RI', 'Rhode Island'),
                                          ('SC', 'South Carolina'),
                                          ('SD', 'South Dakota'),
                                          ('TN', 'Tennessee'),
                                          ('TX', 'Texas'),
                                          ('UT', 'Utah'),
                                          ('VT', 'Vermont'),
                                          ('VA', 'Virginia'),
                                          ('WA', 'Washington'),
                                          ('DC', 'Washington D.C.'),
                                          ('WV', 'West Virginia'),
                                          ('WI', 'Wisconsin'),
                                          ('WY', 'Wyoming')])
    shipping_zip = IntegerField('Zip',
                                description='Zip',
                                validators=[DataRequired('Please enter the recipient\'s zip code.'), Length(message='Please reduce your recipient\'s zip code to 9 characters or less.', max=9)]
                                )
    purchaser_name = TextField('Your name',
                               description='Note: Your name will appear on the outside of the box with your personalized message. If you\'d like to cheer up someone anonymously, leave this field blank.')
    personal_message = TextAreaField('Personalized message',
                                     description='140 characters max',
                                     validators=[DataRequired('Please enter a message.'), Length(message='Please reduce your message to 140 characters or less.', max=140)]
                                     )
