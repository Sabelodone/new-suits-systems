import os
from dotenv import load_dotenv


basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    '''# Load environment variables from .env file
    env_file = os.path.join(basedir, f".env.{os.environ.get('FLASK_ENV', 'development')}")
    load_dotenv(env_file)

    SECRET_KEY = os.environ.get('SECRET_KEY')

    db_user = os.environ.get('DB_USER')
    db_password = os.environ.get('DB_PASSWORD')
    db_host = os.environ.get('DB_HOST')
    db_name = os.environ.get('DB_NAME')
    db_port = os.environ.get('DB_PORT')

    SQLALCHEMY_DATABASE_URI = f'mysql://{db_user}:{db_password}@{db_host}/{db_name}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_PERMANENT = False
    SESSION_TYPE = 'filesystem'

    # Flask config
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    TESTING = os.environ.get('FLASK_ENV') == 'testing'

    class TestingConfig:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://user:password@localhost/test_db')
        TESTING = True

    class DevelopmentConfig:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://user:password@localhost/dev_db')

    class ProductionConfig:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://user:password@localhost/prod_db')
        DEBUG = False

    setting = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig,
        'default': DevelopmentConfig
    }'''

    # Load environment variables from .env file
    env_file = os.path.join(basedir, f".env.{os.environ.get('FLASK_ENV', 'development')}")
    load_dotenv(env_file)

    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_default_secret_key')  # Provide a default key for local development

    # Use SQLite database URI
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(basedir, "instance/app.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_PERMANENT = False
    SESSION_TYPE = 'filesystem'

    # Flask config
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    TESTING = os.environ.get('FLASK_ENV') == 'testing'

    class TestingConfig:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use in-memory database for tests
        TESTING = True

    class DevelopmentConfig:
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(basedir, "instance/dev.db")}'

    class ProductionConfig:
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(basedir, "instance/prod.db")}'
        DEBUG = False

    setting = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig,
        'default': DevelopmentConfig
    }
