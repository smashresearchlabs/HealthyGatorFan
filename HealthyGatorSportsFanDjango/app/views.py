from django.contrib.auth.models import User as AuthUser
from rest_framework_simplejwt.tokens import RefreshToken
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
from datetime import date, datetime, timezone, timedelta
from .utils import send_push_notification_next_game, check_game_status, send_notification, get_users_with_push_token
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from .management.commands import poll_cfbd
from .management.commands.poll_cfbd import Command
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


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

def get_cached_uf_games():
    configuration = cfbd.Configuration(
        host="https://apinext.collegefootballdata.com",
        access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
    )
    apiInstance = cfbd.GamesApi(cfbd.ApiClient(configuration))
    current_year = date.today().year

    CACHE_KEY = f'uf_football_games_{current_year}'
    CACHE_TTL = 60 * 60 * 24  # 24 hours in seconds

    games_list = cache.get(CACHE_KEY)
    
    if games_list is not None:
        logger.info("Cache hit: Returning cached UF games.")
        return games_list

    logger.info("Cache miss: Fetching UF games from API.")
    try:
        games = apiInstance.get_games(year=current_year, team='Florida', conference='SEC')
        games_list = [game.to_dict() for game in games]
        
        cache.set(CACHE_KEY, games_list, timeout=CACHE_TTL)
        
        return games_list
    except Exception as e:
        logger.error(f"Error fetching UF games from CFBD API: {e}")
        return None 

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
        
class UserNukeView(APIView): #nukes user and all their associated data from User, UserData, and Notifications
    @swagger_auto_schema(
            operation_summary="Nuke user",
            operation_description="Deletes user data from all databases.",
            request_body=UserSerializer
        )
    def delete(self, request, user_id):
        print("Entered UserNuke View")
        try:
            user = User.objects.get(user_id=user_id)
            userData = UserData.objects.filter(user_id=user_id)
            notification = NotificationData.objects.filter(user_id=user_id)

            user.delete()
            userData.delete()
            notification.delete()

            return Response({'message': 'Successfully user and associated data.'}, status=status.HTTP_200_OK)
        except Exception as e:
            print("Errors:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
@method_decorator(csrf_exempt, name="dispatch")
class UserLoginView(APIView):
    permission_classes = (AllowAny,)
    @swagger_auto_schema(
        operation_summary="User login (POST)", operation_description="Authenticate and get user's information given email and password.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        # manual_parameters=[
        #         openapi.Parameter(
        #             'email',  # Name of the parameter
        #             openapi.IN_QUERY,  # Location of the parameter
        #             description="Login email entered by user",
        #             type=openapi.TYPE_STRING,  # Type of the parameter
        #             required=True  # Whether the parameter is required
        #         ),
        #         openapi.Parameter(
        #             'password',  # Name of the parameter
        #             openapi.IN_QUERY,  # Location of the parameter
        #             description="Login password entered by user",
        #             type=openapi.TYPE_STRING,  # Type of the parameter
        #             required=True  # Whether the parameter is required
        #         )
        # ],
        responses={200: UserSerializer(many=False)}  # Define response schema
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        auth_user, _ = AuthUser.objects.get_or_create(
            username=user.email,
            defaults={"email": user.email}
        )

        refresh = RefreshToken.for_user(auth_user)
        access = refresh.access_token
        refresh["app_user_id"] = user.user_id
        access["app_user_id"] = user.user_id
        
        serializer = UserSerializer(user)
        return Response({
            "access": str(access),
            "refresh": str(refresh),
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    # def get(self, request):
    #     email = request.query_params.get('email')
    #     password = request.query_params.get('password')
    #     users = User.objects.all()  # Fetch all users from the database
    #     print("Email & password from query parameters: ", email, " & ", password)
    #     print("Count of users: ", User.objects.count())
    #     users = User.objects.all()
    #     print("Users found: ", {users})
    #     try:
    #         # Fetch the user by email
    #         user = User.objects.get(email=email)
    #         # Check if the provided password matches
    #         print("User's password from DB: ", user.password)
    #         if user.check_password(password):
    #             # If the password is correct, serialize and return user data
    #             serializer = UserSerializer(user)
    #             return Response(serializer.data, status=status.HTTP_200_OK)
    #         else:
    #             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    #     except User.DoesNotExist:
    #         return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

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
    games = get_cached_uf_games()
    configuration = cfbd.Configuration(
        host="https://apinext.collegefootballdata.com",
        access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
    )
    apiInstance = cfbd.GamesApi(cfbd.ApiClient(configuration))
    CACHE_KEY = "completed_game"
    CACHE_TTL = 60 * 60 * 4 #4 hours -> there won't be more than 1 game/day or /week so this should be fine

    for game in games:
        start_date = game['startDate']

        if start_date - timedelta(hours=0, minutes=30) <= datetime.now(timezone.utc) <= start_date + timedelta(hours=4, minutes=0): #30 minutes before game start -> 4 hours after game end
            print(f"Game {game} is within the 4 hour window")
            
            game_status, home_team, home_score, away_team, away_score, game_completion_status = check_game_status(apiInstance)
            send_notification(game_status, home_team, home_score, away_team, away_score)

            if game_completion_status == "completed":
                existingGame = cache.get(CACHE_KEY)
                if existingGame is None:
                    pushTokens = get_users_with_push_token()
                    message = "Finished the game? Help the HealthyGator community by going to the app home page and taking a post-game survey!"
                    send_push_notification_next_game('Post-Game Survey', pushTokens, message)
                    cache.set(CACHE_KEY, "", CACHE_TTL)

            return

    print("No games are inside window")

@csrf_exempt
def home_tile_view(request):
    # Fetch all games using the new cached helper
    all_games = get_cached_uf_games()
    
    if all_games is None:
        return JsonResponse({"message": "Could not retrieve upcoming games."}, status=500)

    # Logic to find the next game (uses the cached list)
    today = datetime.combine(date.today(), datetime.min.time(), tzinfo=pytz.UTC)
    
    future_games = []
    for game in all_games:
        game_start_date = game['startDate'].astimezone(pytz.UTC)
        if game_start_date > today:
            future_games.append((game_start_date, game))

    next_game_tuple = min(future_games, key=lambda x: x[0]) if future_games else None

    if next_game_tuple:
        next_game = next_game_tuple[1] 
        game_time_utc = next_game_tuple[0] 

        logger.info(f"Home Team: {next_game['homeTeam']}, Away Team: {next_game['awayTeam']}")

        user_tz = pytz.timezone('America/New_York')
        game_time = game_time_utc.astimezone(user_tz)
        
        response = {
            "home_team": next_game['homeTeam'],
            "away_team": next_game['awayTeam'],
            "date": game_time.strftime('%m-%d-%Y %I:%M %p')
        }
    else:
        response = {"message": "No upcoming games found."}
    
    return JsonResponse(response)


@csrf_exempt
def schedule_view(request):
    # Fetch all games using the new cached helper
    games_list = get_cached_uf_games()

    if games_list is None:
         return JsonResponse(
            {"error": f"Could not retrieve UF games for {date.today().year}"},
            status=500
        )
        
    return JsonResponse({"data": games_list})
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Return the *app.User* profile that matches the authenticated Django user.
    """
    email = getattr(request.user, "email", None)
    if not email:
        return Response({"detail": "No email on auth user"}, status=400)

    try:
        app_user = User.objects.get(email=email)
        if not app_user:
            return Response({"detail": "App user not found"}, status=404)
    except User.DoesNotExist:
        return Response({"detail": "App user not found"}, status=404)


    print('hell yeah brother')
    print(UserSerializer(app_user).data)

    return Response(UserSerializer(app_user).data, status=200)
