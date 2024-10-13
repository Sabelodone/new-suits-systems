import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    # SECRET_KEY = os.environ.get('SECRET_KEY')
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

    # project root directory
    BASE_DIR = os.path.join(os.pardir, os.path.dirname(__file__))
    SECRET_KEY = os.urandom(24).hex()

    # sqlalchemy config
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_PERMANENT = False
    SESSION_TYPE = 'filesystem'

    # flask config
    DEBUG = True
    TESTING = False

    class TestingConfig:
        ENV = os.environ.get('FLASK_ENV', "testing")
        TESTING = True
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app_test.db'
    
    class DevelopmentConfig:
        ENV = os.environ.get('FLASK_ENV', "development")
        DEBUG = True
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'


    class ProductionConfig:
        ENV = os.environ.get('FLASK_ENV', "production")
        DEBUG = False
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

    setting = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig,
        'default': DevelopmentConfig
    }
