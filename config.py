class Config(object):
    DEBUG = False
    SECRET_KEY = '\x03V\x96\xb6{#\x9f\x14K\xef{\x86Z\x14\xafZK/-\x84\xb0O\xcd\x13'
    ADMINS = ['pbeeson@thevariable.com']
    MAIL_SERVER = 'smtp.webfaction.com'
    MAIL_USERNAME = 'sharethesunshine'
    MAIL_PASSWORD = 'V@r1able'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    SITE_ADDRESS = 'https://shareasunshine.com'
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    STRIPE_SECRET_KEY = 'sk_live_n4OGJVSC81yBSXl7R0gdjkmF'
    STRIPE_PUBLIC_KEY = 'pk_live_XDeeIdG9LbgtgpPdEJdUwtV4'
    SQLALCHEMY_DATABASE_URI = 'postgresql://sharethesunshine:ClearsTheClouds@localhost:5432/sharethesunshine'


class DevelopmentConfig(Config):
    STRIPE_SECRET_KEY = 'sk_test_HsuAieq5wo8ZSAm3lEushARi'
    STRIPE_PUBLIC_KEY = 'pk_test_7MmO7bkJvlkV0TfD1YfFcnVf'
    SQLALCHEMY_DATABASE_URI = 'postgresql://sharethesunshine@localhost/sharethesunshine'
    DEBUG = True
    TESTING = False
    SITE_ADDRESS = 'http://dev.thevariable.com'


class TestingConfig(Config):
    STRIPE_SECRET_KEY = 'sk_test_HsuAieq5wo8ZSAm3lEushARi'
    STRIPE_PUBLIC_KEY = 'pk_test_7MmO7bkJvlkV0TfD1YfFcnVf'
    SQLALCHEMY_DATABASE_URI = 'postgresql://sharethesunshine@localhost/sharethesunshine'
    DEBUG = True
    TESTING = True
    SITE_ADDRESS = 'http://dev.thevariable.com'
