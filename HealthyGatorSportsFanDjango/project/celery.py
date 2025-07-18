# project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
# for running locally
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
# for pushing to Heroku
#os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HealthyGatorSportsFanDjango.project.settings')

# for running locally
app = Celery('project')
# for pushing to Heroku
#app = Celery('HealthyGatorSportsFanDjango.project')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')