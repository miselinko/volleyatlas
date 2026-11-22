import os
from pathlib import Path
import dj_database_url
BASE_DIR=Path(__file__).resolve().parent.parent
SECRET_KEY=os.getenv('SECRET_KEY','dev-only-unsafe-change-before-production')
DEBUG=os.getenv('DEBUG')=='1'
ALLOWED_HOSTS=[s for s in os.getenv('ALLOWED_HOSTS','localhost,127.0.0.1').split(',') if s]
if os.getenv('VERCEL_URL'):ALLOWED_HOSTS.append(os.environ['VERCEL_URL'])
INSTALLED_APPS=['django.contrib.auth','django.contrib.contenttypes','django.contrib.staticfiles','volleyball']
MIDDLEWARE=['django.middleware.security.SecurityMiddleware','django.middleware.common.CommonMiddleware']
ROOT_URLCONF='config.urls'
TEMPLATES=[]
WSGI_APPLICATION='config.wsgi.application'
DATABASES={'default':dj_database_url.config(default=f"sqlite:///{BASE_DIR/'db.sqlite3'}",conn_max_age=0,ssl_require=bool(os.getenv('DATABASE_URL')))}
USE_TZ=True
LANGUAGE_CODE='sr-Latn'
STATIC_URL='/static/'
STATIC_ROOT=BASE_DIR/'staticfiles'
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
