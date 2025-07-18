# app/tasks.py
import logging
from celery import shared_task
# for running locally
from app.views import poll_cfbd_view
# for pushing to Heroku
#from HealthyGatorSportsFanDjango.app.views import poll_cfbd_view

logger = logging.getLogger(__name__)

@shared_task
def poll_cfbd_task():
    logger.info('Polling CFBD')
    poll_cfbd_view(None)
    logger.info('Finished polling CFBD')