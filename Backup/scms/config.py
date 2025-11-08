import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # LDAP Configuration
    LDAP_HOST = os.getenv('LDAP_HOST') or 'default-ldap-host'
    LDAP_BASE_DN = os.getenv('LDAP_BASE_DN') or 'default-base-dn'
    LDAP_USER_DN = os.getenv('LDAP_USER_DN') or 'default-user-dn'
    LDAP_GROUP_DN = os.getenv('LDAP_GROUP_DN') or 'default-group-dn'
    LDAP_BIND_USER_DN = os.getenv('LDAP_BIND_USER_DN') or 'default-bind-user-dn'
    LDAP_BIND_USER_PASSWORD = os.getenv('LDAP_BIND_USER_PASSWORD') or 'default-bind-user-password'

class ProductionConfig(Config):
    DEBUG = False

class InternalConfig(Config):
    DEBUG = True
