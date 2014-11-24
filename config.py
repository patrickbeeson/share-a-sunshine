class Config(object):
    DEBUG = False
    SECRET_KEY = ''
    ADMINS = ['']
    MAIL_SERVER = ''
    MAIL_USERNAME = ''
    MAIL_PASSWORD = ''
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    SITE_ADDRESS = 'https://shareasunshine.com'
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    STRIPE_SECRET_KEY = ''
    STRIPE_PUBLIC_KEY = ''
    SQLALCHEMY_DATABASE_URI = ''


class DevelopmentConfig(Config):
    STRIPE_SECRET_KEY = ''
    STRIPE_PUBLIC_KEY = ''
    SQLALCHEMY_DATABASE_URI = ''
    DEBUG = True
    TESTING = True
    SITE_ADDRESS = ''
