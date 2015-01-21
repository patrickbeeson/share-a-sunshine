class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = ''
    ADMINS = ['']
    MAIL_SERVER = ''
    MAIL_USERNAME = ''
    MAIL_PASSWORD = ''
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    SITE_ADDRESS = ''


class ProductionConfig(Config):
    STRIPE_SECRET_KEY = ''
    STRIPE_PUBLIC_KEY = ''
    SQLALCHEMY_DATABASE_URI = 'postgresql://:@localhost:5432/'


class DevelopmentConfig(Config):
    STRIPE_SECRET_KEY = ''
    STRIPE_PUBLIC_KEY = ''
    SQLALCHEMY_DATABASE_URI = 'postgresql://@localhost/'
    DEBUG = True
    TESTING = True
    SITE_ADDRESS = ''


class TestingConfig(Config):
    STRIPE_SECRET_KEY = ''
    STRIPE_PUBLIC_KEY = ''
    SQLALCHEMY_DATABASE_URI = 'postgresql://@localhost/'
    DEBUG = True
    TESTING = True
    SITE_ADDRESS = ''
