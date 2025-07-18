from django.shortcuts import render
from .models import User, UserData, NotificationData
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .serializers import UserSerializer, UserDataSerializer, NotificationDataSerializer
import os
import cfbd
import pytz
from django.http import JsonResponse
from datetime import date, datetime
from .utils import send_push_notification_next_game, check_game_status, send_notification
from django.views.decorators.csrf import csrf_exempt
from .management.commands import poll_cfbd
from .management.commands.poll_cfbd import Command
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from rest_framework.decorators import api_view

# Create your views here.

# Best practice is one view per page

# 'request' is the entire HTTP object (headers, request method like GET, POST, others), etc...)
# 'request.data' is used to access parsed data like the JSON or form data
# 'request.body' is used to access raw data that is not parsed
# 'self' refers to the current instance

# API view to handle POST requests for data sent from Postman
#class WeightView(APIView):
    #def post(self, request):

        ## Print for debugging
        #print("Received Data:", request.data)

        #serializer = UserDataSerializer(data=request.data) # Validate the data
        #if serializer.is_valid():
            #serializer.save() # Save the validated data to the database
            #return Response(serializer.data, status=status.HTTP_201_CREATED)
        #return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#  for testing with Django's web interface
def index(request):
    # Gets all of the current objects from the database
    user_objs = User.objects.all()
    user_data_objs = UserData.objects.all()
    notification_objs = NotificationData.objects.all()

    # Pass the objects to the Django template (embedded Python in HTML file)
    context = {
        "user_objs": user_objs,
        "user_data_objs": user_data_objs,
        "notification_objs": notification_objs,
    }
    return render(request, "index.html", context)

# API view to handle POST requests for user creation
class CreateUserView(APIView):
    @swagger_auto_schema(
            operation_summary="Add user",
            operation_description="Create a new user to add to the database.",
            request_body=UserSerializer
        )
    def post(self, request):
        print("request.data for CreateUserView: ", request.data)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Prepare the response data including the user_id
            response_data = {'user_id': user.user_id}
            response_data.update(serializer.data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserUpdateView(APIView):
    @swagger_auto_schema(operation_summary="Update user", operation_description="Update an existing user in the database", request_body=UserSerializer)
    def put(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        print("request.data for UserUpdateView: ", request.data)
        serializer = UserSerializer(user, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            print(serializer.errors)  # Debugging line
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckEmailView(APIView):
    @swagger_auto_schema(
        operation_summary="Check if email is already used", operation_description="Checks all users in the database to determine whether an email is already in user.",
        responses={200: UserSerializer(many=False)}  # Define response schema
    )
    def post(self, request):
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response({'exists': True}, status=status.HTTP_200_OK)
        return Response({'exists': False}, status=status.HTTP_200_OK)

# API view to handle POST requests for user data creation
class CreateUserDataView(APIView):
    @swagger_auto_schema(operation_summary="Log user progress", operation_description="Create a new userData entry to add to the database. This is used to log a snapshot in time of progress toward the user's goal(s).", request_body=UserDataSerializer)
    def post(self, request, user_id):
        # Retrieve the user by ID
        user = User.objects.get(pk=user_id) # pk is primary key
        user_data = UserData.objects.create(user=user)
        # Update user data with new information
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
            user_data_serializer = UserDataSerializer(user_data, data=request.data, partial=True)
            if user_data_serializer.is_valid():
                userData = user_data_serializer.save()
                response_data = {'data_id': userData.data_id}
                response_data.update(user_data_serializer.data)
                return Response(response_data, status=status.HTTP_201_CREATED)
            return Response(user_data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(user_data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LatestUserDataView(APIView):
    @swagger_auto_schema(
        operation_summary="Get latest user progress", operation_description="Get the latest entry of user's progress from the userData table.",
        manual_parameters=[
            openapi.Parameter(
                'user_id',  # Name of the parameter
                openapi.IN_PATH,  # Location of the parameter
                description="User ID for which we are getting the latest user data entry for",
                type=openapi.TYPE_STRING,  # Type of the parameter
                required=True  # Whether the parameter is required
            )
        ],
        responses={200: UserDataSerializer(many=True)}  # Define response schema
    )
    def get(self, request, user_id):
        try:
            recent_data = UserData.objects.filter(user_id=user_id).order_by('-timestamp').first()
            if recent_data:
                serializer = UserDataSerializer(recent_data)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No data found for this user."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# # API view to handle POST requests for data sent from the front-end (basicinfo.tsx)
# class BasicInfoView(APIView):
#     def post(self, request, user_id):
#         # Retrieve the user by ID
#         user = User.objects.get(pk=user_id) # pk is primary key
#         # Separate weight_value for UserData
#         weight_value = request.data.pop('weight_value', None) # return 'None' if no weight available
#         # Update user data with new information
#         user_serializer = UserSerializer(user, data=request.data, partial=True)
#         if user_serializer.is_valid():
#             user_serializer.save()
#             # Handle UserData creation if weight is provided
#             if weight_value is not None:
#                 user_data = UserData.objects.create(user=user)
#                 user_data_serializer = UserDataSerializer(user_data, data={'weight_value': weight_value}, partial=True)
#                 if user_data_serializer.is_valid():
#                     user_data_serializer.save()
#                 else:
#                     print("UserData errors:", user_data_serializer.errors)
#                     return Response(user_data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#             # Return the user data with success status
#             return Response(user_serializer.data, status=status.HTTP_200_OK)
#         # Log and return errors if the user data is invalid
#         print("User errors:", user_serializer.errors)
#         return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# # API view to handle POST requests for data sent from the front-end (goalcollection.tsx)
# class GoalCollectionView(APIView):
#     def post(self, request, user_id):
#         user = User.objects.get(pk=user_id)
#         user_serializer = UserSerializer(user, data=request.data, partial=True)
#         if user_serializer.is_valid():
#             user_serializer.save()
#             user_data = UserData.objects.create(user=user)
#             user_data_serializer = UserDataSerializer(user_data, data=request.data, partial=True)
#             if user_data_serializer.is_valid():
#                 user_data_serializer.save()
#                 return Response({
#                     'user': user_serializer.data,
#                     'user_data': user_data_serializer.data
#                 }, status=status.HTTP_200_OK)
#             return Response(user_data_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    @swagger_auto_schema(
        operation_summary="User login", operation_description="Authenticate and get user's information given email and password.",
        manual_parameters=[
                openapi.Parameter(
                    'email',  # Name of the parameter
                    openapi.IN_QUERY,  # Location of the parameter
                    description="Login email entered by user",
                    type=openapi.TYPE_STRING,  # Type of the parameter
                    required=True  # Whether the parameter is required
                ),
                openapi.Parameter(
                    'password',  # Name of the parameter
                    openapi.IN_QUERY,  # Location of the parameter
                    description="Login password entered by user",
                    type=openapi.TYPE_STRING,  # Type of the parameter
                    required=True  # Whether the parameter is required
                )
        ],
        responses={200: UserSerializer(many=False)}  # Define response schema
    )
    def get(self, request):
        email = request.query_params.get('email')
        password = request.query_params.get('password')
        users = User.objects.all()  # Fetch all users from the database
        print("Email & password from query parameters: ", email, " & ", password)
        print("Count of users: ", User.objects.count())
        users = User.objects.all()
        print("Users found: ", {users})
        try:
            # Fetch the user by email
            user = User.objects.get(email=email)
            # Check if the provided password matches
            print("User's password from DB: ", user.password)
            if user.check_password(password):
                # If the password is correct, serialize and return user data
                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# # Shannon, 11/19/2024: Below is an attempt I made at a more advanced auth method using django's built-in auth. I opted for simplicity for now.
# class UserLoginView(APIView):
#     def get(self, request):
#         email = request.query_params.get('email')
#         password = request.query_params.get('password')
#         # Check if a user with the provided username exists
#         if not User.objects.filter(email=email).exists():
#             # Display an error message if the username does not exist
#             messages.error(request, 'Invalid email')
#             return Response({"error": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)
#         user = authenticate(username=email, password=password)
#         if user is not None:
#             login(request, user) #login() function takes an HttpRequest object and a User object, and saves the user's ID in the session.
#             serializer = UserSerializer(user)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
#     def logout_view(request):
#         logout(request)
    
# API view to handle GET requests for all notifications for a userID  
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationDataSerializer
    @swagger_auto_schema(
        operation_summary="List notifications", operation_description="Get all notifications for a user by user ID.",
        manual_parameters=[
            openapi.Parameter(
                'user_id',  # Name of the parameter
                openapi.IN_PATH,  # Location of the parameter
                description="User ID for which we are getting all notifications for",
                type=openapi.TYPE_STRING,  # Type of the parameter
                required=True  # Whether the parameter is required
            )
        ],
        responses={200: NotificationDataSerializer(many=True)}  # Define response schema
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return NotificationData.objects.filter(user_id=user_id)  # Adjust based on your model's field
    
class BulkDeleteNotificationsView(APIView):
    @swagger_auto_schema(operation_summary="Delete all notifications for a user", operation_description="Delete all notifications for a user by user ID", request_body=NotificationDataSerializer)
    def delete(self, request, user_id):
        print("Entered BulkDeleteNotifications View")  
        try:
            notifications = NotificationData.objects.filter(user_id=user_id)
            deleted_count, _ = notifications.delete()
            if deleted_count > 0:
                return Response({'message': f'Deleted {deleted_count} notifications.'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No notifications found for this user.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Errors:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
# API view to handle CRUD requests for a single notification
class CreateNotificationView(APIView):
    @swagger_auto_schema(operation_summary="Add notification", operation_description="Create a new notification to add to the database.", request_body=NotificationDataSerializer)
    def post(self, request):
        serializer = NotificationDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)

class DeleteNotificationView(APIView):
    @swagger_auto_schema(operation_summary="Delete notification", operation_description="Delete a notification by ID", request_body=NotificationDataSerializer)
    def delete(self, request, notification_id):
        try:
            notification = NotificationData.objects.get(notification_id=notification_id)
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotificationData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# class SendNotificationView(APIView):
#     def post(self, request):
#         serializer = NotificationDataSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     def send_notification(self, data):
#         expo_push_url = "https://exp.host/--/api/v2/push/send"
#         message = {
#             "to": data['user'].google_acct_id,
#             "title": "Score Update",
#             "body": data["Testing to see if this push notification works!"],
#         }
#
@csrf_exempt
def poll_cfbd_view(request):
    configuration = cfbd.Configuration(
        host="https://apinext.collegefootballdata.com",
        access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
    )
    print("Value of 'COLLEGE_FOOTBALL_API_KEY' environment variable :", os.getenv('COLLEGE_FOOTBALL_API_KEY'))                         
    print("Value of 'EXPO_PUSH_TOKEN' environment variable :", os.getenv('EXPO_PUSH_TOKEN'))                         
    apiInstance = cfbd.GamesApi(cfbd.ApiClient(configuration))

    def get_next_game():
        current_year = date.today().year
        games = apiInstance.get_games(year=current_year, team='Florida', conference='SEC')
        today = datetime.combine(date.today(), datetime.min.time())
        future_games = [game for game in games if game.start_date.replace(tzinfo=None) > today]
        return min(future_games, key=lambda x: x.start_date) if future_games else None

    next_game = get_next_game()
    if next_game:
        user_tz = pytz.timezone('America/New_York')  # TODO: Get user's timezone from database
        game_time = next_game.start_date.astimezone(user_tz)
        response = {
            "teams": f"{next_game.home_team} vs {next_game.away_team}",
            "date": game_time.strftime('%m-%d-%Y %I:%M %p')
        }
        message = f"Teams: {next_game.home_team} vs {next_game.away_team}, Date: {game_time.strftime('%m-%d-%Y %I:%M %p')}"
    else:
        response = {"message": "No upcoming games found."}
        message = response["message"]
    push_token = os.getenv('EXPO_PUSH_TOKEN')
    #game_status= check_game_status(apiInstance)
    game_status, home_team, home_score, away_team, away_score = check_game_status(apiInstance)
    send_notification(game_status, home_team, home_score, away_team, away_score)
    # if push_token:
    #     try:
    #         send_push_notification_next_game(push_token, message)
    #     except Exception as e:
    #         print(f"Error sending push notification: {e}")
    return JsonResponse(response)
#class GetGameNotificationView(APIView):

@csrf_exempt
def home_tile_view(request):
    configuration = cfbd.Configuration(
        host="https://apinext.collegefootballdata.com",
        access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
    )
    print("Value of 'COLLEGE_FOOTBALL_API_KEY' environment variable :", os.getenv('COLLEGE_FOOTBALL_API_KEY'))                         
    apiInstance = cfbd.GamesApi(cfbd.ApiClient(configuration))

    def get_next_game():
        current_year = date.today().year
        games = apiInstance.get_games(year=current_year, team='Florida', conference='SEC')
        today = datetime.combine(date.today(), datetime.min.time())
        future_games = [game for game in games if game.start_date.replace(tzinfo=None) > today]
        return min(future_games, key=lambda x: x.start_date) if future_games else None

    next_game = get_next_game()
    if next_game:

        # Log the team names for debugging (this returns correctly)
        print(f"Home Team: {next_game.home_team}, Away Team: {next_game.away_team}")

        user_tz = pytz.timezone('America/New_York')
        game_time = next_game.start_date.astimezone(user_tz)
        response = {
            "home_team": f"{next_game.home_team}",
            "away_team": f"{next_game.away_team}",
            "date": game_time.strftime('%m-%d-%Y %I:%M %p')
        }
        message = f"Teams: {next_game.home_team} vs {next_game.away_team}, Date: {game_time.strftime('%m-%d-%Y %I:%M %p')}"
    else:
        response = {"message": "No upcoming games found."}
        message = response["message"]
    
    return JsonResponse(response)