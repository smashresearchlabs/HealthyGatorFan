import os
import redis
import cfbd
import logging
from exponent_server_sdk import PushClient, PushMessage
from django.conf import settings

logger = logging.getLogger(__name__)

# Use settings for configuration instead of hardcoding
redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)

def send_push_notification_next_game(header: str, push_token: str, message: str):
    """Sends a push notification to a specific push token."""
    try:
        response = PushClient().publish(
            PushMessage(
                to=push_token,
                title=header,
                body=message,
            )
        )
        logger.info(f"Push notification sent successfully: {response.json()}")
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")

def check_game_status(apiInstance):
    """
    Checks the current status of the Florida Gators game and returns
    a status string along with game data.
    """
    gators_team_name = 'Florida Gators'
    scoreboard = apiInstance.get_scoreboard()
    
    curr_game = next((game for game in scoreboard if game.home_team.name == gators_team_name or game.away_team.name == gators_team_name), None)

    if not curr_game:
        return "No game found", None, 0, None, 0

    if curr_game.status == 'scheduled':
        return 'Game not started', curr_game.home_team.name, 0, curr_game.away_team.name, 0

    is_home = curr_game.home_team.name == gators_team_name
    florida_score = curr_game.home_team.points if is_home else curr_game.away_team.points
    opponent_score = curr_game.away_team.points if is_home else curr_game.home_team.points
    score_diff = florida_score - opponent_score

    # Use a dictionary to map status strings to their score ranges
    status_map_in_progress = {
        score_diff >= 14: 'winning_decisive',
        1 <= score_diff < 14: 'winning_close',
        score_diff == 0: 'tied',
        -14 < score_diff <= -1: 'losing_close',
    }
    status_map_completed = {
        score_diff >= 14: 'won_decisive',
        1 <= score_diff < 14: 'won_close',
        -14 < score_diff <= -1: 'lost_close',
    }

    if curr_game.status == 'in_progress':
        status = next((v for k, v in status_map_in_progress.items() if k), 'losing_decisive')
    else:  # 'completed'
        status = next((v for k, v in status_map_completed.items() if k), 'lost_decisive')

    return status, curr_game.home_team.name, curr_game.home_team.points, curr_game.away_team.name, curr_game.away_team.points

def send_notification(game_status: str, home_team: str, home_score: int, away_team: str, away_score: int):
    """Sends a health-related push notification based on the game status."""
    push_token = os.getenv('EXPO_PUSH_TOKEN')
    if not push_token:
        logger.warning("EXPO_PUSH_TOKEN environment variable is not set. Cannot send notification.")
        return

    message_map = {
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
    }
    
    notification_body = message_map.get(game_status)
    if not notification_body:
        logger.warning(f"Unknown game status: {game_status}. No notification sent.")
        return

    current_score = f"{home_score}-{away_score}"
    last_score = redis_client.get('last_score')
    
    # Check if the score has changed before sending a notification
    if last_score and last_score.decode('utf-8') == current_score:
        logger.info(f"Score has not changed. Skipping notification. Current score: {current_score}")
        return
        
    send_push_notification_next_game("Health Notification", push_token, notification_body)
    redis_client.set('last_score', current_score)