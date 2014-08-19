SECRET_KEY = '\x03V\x96\xb6{#\x9f\x14K\xef{\x86Z\x14\xafZK/-\x84\xb0O\xcd\x13'

# Testing
#STRIPE_SECRET_KEY = 'sk_test_HsuAieq5wo8ZSAm3lEushARi'
#STRIPE_PUBLIC_KEY = 'pk_test_7MmO7bkJvlkV0TfD1YfFcnVf'

# Live
STRIPE_SECRET_KEY = 'sk_live_n4OGJVSC81yBSXl7R0gdjkmF'
STRIPE_PUBLIC_KEY = 'pk_live_XDeeIdG9LbgtgpPdEJdUwtV4'

# Development
#SQLALCHEMY_DATABASE_URI = 'sqlite:///sharethesunshine.db'

# Production
SQLALCHEMY_DATABASE_URI = 'postgresql://sharethesunshine:ClearsTheClouds@localhost:5432/sharethesunshine'

ADMINS = ['pbeeson@thevariable.com']

MAIL_SERVER = 'smtp.webfaction.com'

MAIL_USERNAME = 'sharethesunshine'

MAIL_PASSWORD = 'V@r1able'

MAIL_PORT = 465

MAIL_USE_SSL = True

SITE_ADDRESS = 'https://share.drinkthesunshine.com'
