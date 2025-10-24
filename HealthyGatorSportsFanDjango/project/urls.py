"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
# for pushing to heroku
#from HealthyGatorSportsFanDjango.app.views import index, CreateUserView, poll_cfbd_view, CreateUserDataView, NotificationListView, CreateNotificationView, DeleteNotificationView, BulkDeleteNotificationsView, UserLoginView, LatestUserDataView, UserUpdateView, CheckEmailView
# for running locally
#from app.views import index, CreateUserView, poll_cfbd_view, BasicInfoView, GoalCollectionView, CreateUserDataView (before merge)
from app.views import index, CreateUserView, poll_cfbd_view, home_tile_view, schedule_view, CreateUserDataView, NotificationListView, CreateNotificationView, DeleteNotificationView, BulkDeleteNotificationsView, UserLoginView, LatestUserDataView, UserUpdateView, CheckEmailView

# Import drf-yasg components
from drf_yasg.views import get_schema_view 
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

schema_view = get_schema_view(
    openapi.Info( title="Healthy Gator Sports Fan API Viewer", default_version="v1",),
    public=True,
    # This can be adjusted later if needed ...
    permission_classes=(permissions.AllowAny,), 
)

# Used to define API endpoints that our mobile app will interact with, rather than returning HTML pages for a web app

# Best practice is one route per page, but multipe routes can be implemented as the app gets more complex

urlpatterns = [
    # API endpoints for testing
    #path('api/weights/', WeightView.as_view(), name='weight'),  # endpoint for test with Postman (no fetch on front-end yet)
    path('admin/', admin.site.urls), # Django Admin page (http://127.0.0.1:8000/admin)
    path('', index, name = "index"), # to see database contents for testing (http://127.0.0.1:8000/), see templates -> index.html
    
    # API endpoints for auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API endpoints for app
    path('user/', CreateUserView.as_view(), name='user-create'), # endpoint for user creation screen
    path('user/<int:user_id>/', UserUpdateView.as_view(), name='update-user'),
    path('user/login/', UserLoginView.as_view(), name='user-login'),
    path('user/checkemail/', CheckEmailView.as_view(), name='check-user-email'),
    path('userdata/<int:user_id>/', CreateUserDataView.as_view(), name='user-data-create'),
    path('userdata/latest/<int:user_id>/', LatestUserDataView.as_view(), name='get-latest-user-data'),
    path('notificationdata/<int:user_id>/', NotificationListView.as_view(), name='notification-list'),
    path('notificationdata/', CreateNotificationView.as_view(), name='notification-create'),
    path('notificationdata/delete/<int:notification_id>/', DeleteNotificationView.as_view(), name='notification-delete'),
    path('notificationdata/deleteall/<int:user_id>/', BulkDeleteNotificationsView.as_view(), name='notifications-delete-all'),
    path('poll-cfbd/', poll_cfbd_view, name='poll_cfbd'),
    path('home-tile/', home_tile_view, name='home_tile_view'),
    path('schedule-tile/', schedule_view, name='schedule_tile'),
    
    # API endpoint for Swagger
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
