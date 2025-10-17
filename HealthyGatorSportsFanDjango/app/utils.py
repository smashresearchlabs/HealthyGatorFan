# app/utils.py
from exponent_server_sdk import PushClient, PushMessage
import os
import cfbd
import redis
from .models import User
from .serializers import UserSerializer

redis_client = redis.StrictRedis.from_url('redis://localhost:6379/0')
def send_push_notification_next_game(header, users, message):
    for user in users:
        try:
            PushClient().publish(
                PushMessage(
                    to=user['push_token'],
                    title=header,
                    body=message,
                )
            )
        except Exception:
            errorMessage = "Couldn't send push notification to {}".format(user['email'])
            print(errorMessage)

def check_game_status(apiInstance):
    scoreboard = apiInstance.get_scoreboard()
    curr_team = 'Florida Gators'
    curr_game = None
    for game in scoreboard:
        if game.home_team.name == curr_team or game.away_team.name == curr_team:
            curr_game = game
            break
    if not curr_game:
        return "No game found", "", 0, "", 0
    if curr_game.status == 'scheduled':
        return 'Game not started', curr_game.home_team.name, 0, curr_game.away_team.name, 0
    if curr_game.home_team == curr_team:
        florida_score = curr_game.home_team.points
        opponent_score = curr_game.away_team.points
    else:
        florida_score = curr_game.away_team.points
        opponent_score = curr_game.home_team.points
    score_diff = florida_score - opponent_score
    if curr_game.status == 'in_progress':
        if score_diff >= 14:
            return 'winning_decisive', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        elif 1 <= score_diff < 14:
            return 'winning_close', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        elif score_diff == 0:
            return 'tied', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        elif -14 < score_diff <= -1:
            return 'losing_close', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        else:
            return 'losing_decisive', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
    elif curr_game.status == 'completed':
        if score_diff >= 14:
            return 'won_decisive', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        elif 1 <= score_diff < 14:
            return 'won_close', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        elif -14 < score_diff <= -1:
            return 'lost_close', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
        else:
            return 'lost_decisive', curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points
    elif curr_game.status == 'scheduled':
        return 'Game not started', curr_game.home_team.name, 0, curr_game.away_team.name, 0

def send_notification(game_status: str, home_team: str, home_score: int, away_team: str, away_score: int):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    allUsers = serializer.data
    usersWithPushToken = list(filter(lambda user: user['push_token'], allUsers))
    if usersWithPushToken:
        message = {
            'predicted_win': "The Gators are predicted to win, and so are you! Plan wisely to meet your health goals this game day.",
            'predicted_lose': "Defeat the odds this game day by working hard to meet your health goals!",
            'winning_decisive': f"The Gators are up, and you should be, too! Make sure you are up and moving to meet your health goals today. Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'winning_close': f"Don't let your guard down just yet! Keep working to meet your health goals for today's game! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'tied': f"Florida is tied! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'losing_close': f"The Gators won't back down, so why should you? Work hard to meet your health goals today! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'losing_decisive': f"The game isn't lost yet, and neither are your goals! Try to make healthy choices the rest of the game! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'won_decisive': f"When the Gators win, you win! Make this win count by meeting your health goals, too! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'won_close': f"Match the Gator's energy by keeping up with your health goals for today! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'lost_close': f"Don't let a loss get you down! Keep an eye on your health journey, instead! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'lost_decisive': f"Just because the Gators lost doesn't mean you have to! Make healthy choices after the game! Current score: {home_team}: {home_score}, {away_team}: {away_score}",
            'Game not started': "The game hasn't started yet. Get ready to meet your health goals when it does!"
        }[game_status]
        print(f"Game status: {game_status}")
        current_score = f"{home_score}-{away_score}"
        last_score = redis_client.get('last_score')
        print(f"Last score: {last_score}")
        if game_status == 'Game not started':
            last_score = "Game not started"
        else:
            if last_score is not None:
                last_score = last_score.decode('utf-8')
            else:
                last_score = ""
            if last_score != current_score:
                send_push_notification_next_game("Health Notification", usersWithPushToken, message)
                redis_client.set('last_score', current_score)