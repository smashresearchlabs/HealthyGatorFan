from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import date, datetime
import os
import pytz
import cfbd
import logging

from .models import User, UserData, NotificationData
from .serializers import UserSerializer, UserDataSerializer, NotificationDataSerializer
from .utils import check_game_status, send_notification

logger = logging.getLogger(__name__)

# Basic Django view for the web interface
def index(request):
    user_objs = User.objects.all()
    user_data_objs = UserData.objects.all()
    notification_objs = NotificationData.objects.all()
    context = {
        "user_objs": user_objs,
        "user_data_objs": user_data_objs,
        "notification_objs": notification_objs,
    }
    return render(request, "index.html", context)

# API views for user management
class UserView(APIView):
    @swagger_auto_schema(
        operation_summary="Create a new user",
        request_body=UserSerializer
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = {'user_id': user.user_id, **serializer.data}
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Update an existing user",
        request_body=UserSerializer
    )
    def put(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckEmailView(generics.CreateAPIView):
    @swagger_auto_schema(
        operation_summary="Check if email is already used",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL)}
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={'exists': openapi.Schema(type=openapi.TYPE_BOOLEAN)}
            )
        }
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        exists = User.objects.filter(email=email).exists()
        return Response({'exists': exists}, status=status.HTTP_200_OK)

class LatestUserDataView(generics.RetrieveAPIView):
    serializer_class = UserDataSerializer
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        try:
            return UserData.objects.filter(user_id=user_id).order_by('-timestamp').first()
        except UserData.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"message": "No data found for this user."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDataView(APIView):
    @swagger_auto_schema(
        operation_summary="Create or update user data",
        request_body=UserDataSerializer
    )
    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    @swagger_auto_schema(
        operation_summary="User login", 
        manual_parameters=[
            openapi.Parameter('email', openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('password', openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True)
        ],
        responses={200: UserSerializer(many=False), 401: "Invalid credentials", 404: "User not found"}
    )
    def get(self, request):
        email = request.query_params.get('email')
        password = request.query_params.get('password')
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# API views for notifications
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationDataSerializer
    @swagger_auto_schema(
        operation_summary="List notifications for a user",
        manual_parameters=[openapi.Parameter('user_id', openapi.IN_PATH, type=openapi.TYPE_STRING, required=True)],
        responses={200: NotificationDataSerializer(many=True)}
    )
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return NotificationData.objects.filter(user_id=user_id).order_by('-timestamp')

class NotificationView(APIView):
    @swagger_auto_schema(
        operation_summary="Create a new notification",
        request_body=NotificationDataSerializer
    )
    def post(self, request):
        serializer = NotificationDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete a notification",
        manual_parameters=[openapi.Parameter('notification_id', openapi.IN_PATH, type=openapi.TYPE_STRING, required=True)]
    )
    def delete(self, request, notification_id):
        try:
            notification = NotificationData.objects.get(notification_id=notification_id)
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotificationData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class BulkDeleteNotificationsView(APIView):
    @swagger_auto_schema(
        operation_summary="Delete all notifications for a user",
        manual_parameters=[openapi.Parameter('user_id', openapi.IN_PATH, type=openapi.TYPE_STRING, required=True)]
    )
    def delete(self, request, user_id):
        try:
            deleted_count, _ = NotificationData.objects.filter(user_id=user_id).delete()
            if deleted_count > 0:
                return Response({'message': f'Deleted {deleted_count} notifications.'}, status=status.HTTP_200_OK)
            return Response({'message': 'No notifications found for this user.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# API views for CFBD game data
class GameDataView(APIView):
    def get_cfbd_client(self):
        config = cfbd.Configuration(
            host="https://apinext.collegefootballdata.com",
            access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
        )
        return cfbd.GamesApi(cfbd.ApiClient(config))

    def get_next_game(self, api_instance):
        current_year = date.today().year
        games = api_instance.get_games(year=current_year, team='Florida', conference='SEC')
        today = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=pytz.UTC)
        future_games = [game for game in games if game.start_date.replace(tzinfo=pytz.UTC) > today]
        return min(future_games, key=lambda x: x.start_date) if future_games else None

    @swagger_auto_schema(operation_summary="Poll for game status and send notification")
    def poll(self, request):
        api_instance = self.get_cfbd_client()
        game_status, home_team, home_score, away_team, away_score = check_game_status(api_instance)
        send_notification(game_status, home_team, home_score, away_team, away_score)
        return Response({"message": "Game status polled and notification sent if applicable."}, status=status.HTTP_200_OK)

    @swagger_auto_schema(operation_summary="Get next upcoming game details for home tile")
    def home_tile_view(self, request):
        api_instance = self.get_cfbd_client()
        next_game = self.get_next_game(api_instance)
        if not next_game:
            return JsonResponse({"message": "No upcoming games found."})

        user_tz = pytz.timezone('America/New_York')
        game_time = next_game.start_date.astimezone(user_tz)
        response = {
            "home_team": f"{next_game.home_team}",
            "away_team": f"{next_game.away_team}",
            "date": game_time.strftime('%m-%d-%Y %I:%M %p')
        }
        return JsonResponse(response)