from django.contrib import admin

# Register your models here.

# This is for the Django Admin panel used to test the database
# http://127.0.0.1:8000/admin/

from .models import User, UserData, NotificationData

admin.site.register(User)
admin.site.register(UserData)
admin.site.register(NotificationData)