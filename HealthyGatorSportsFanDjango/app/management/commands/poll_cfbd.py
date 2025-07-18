import os
import cfbd
import pytz
from cfbd.models import ScoreboardGame
from django.core.management.base import BaseCommand
from datetime import date, datetime
# for running locally
from app.utils import send_push_notification_next_game, check_game_status, send_notification
# for pushing to heroku
#from HealthyGatorSportsFanDjango.app.utils import send_push_notification_next_game, check_game_status, send_notification


class Command(BaseCommand):
    help = 'Polls CFBD API for game updates'

    def handle(self, *args, **options):
        self.poll_cfbd()

    def poll_cfbd(self):
        configuration = cfbd.Configuration(
            host="https://apinext.collegefootballdata.com",
            access_token=os.getenv('COLLEGE_FOOTBALL_API_KEY')
        )
        apiInstance = cfbd.GamesApi(cfbd.ApiClient(configuration))
        next_game = self.get_next_game()
        if next_game:
            user_tz = pytz.timezone('America/New_York')  # TODO: Get user's timezone from database
            game_time = next_game.start_date.astimezone(user_tz)
            print(f"Teams: {next_game.home_team} vs {next_game.away_team}")
            print(f"Date: {game_time.strftime('%m-%d-%Y %I:%M %p')}")
        else:
            print("No upcoming games found.")
        game_status = check_game_status(apiInstance)
        send_notification(game_status)


    def get_next_game(self):
        # TODO: Test games that occur in 2025 but still happen in 2024 season
        current_year = date.today().year
        games = self.apiInstance.get_games(year=current_year, team='Florida', conference='SEC')
        today = datetime.combine(date.today(), datetime.min.time())
        future_games = [game for game in games if game.start_date.replace(tzinfo=None) > today]
        return min(future_games, key=lambda x: x.start_date) if future_games else None

    # def send_notification(self, game_status: str):
    #     push_token = os.getenv('EXPO_PUSH_TOKEN')
    #     if push_token:
    #         message = {
    #             'predicted_win': "The Gators are predicted to win, and so are you! Plan wisely to meet your health goals this game day.",
    #             'predicted_lose': "Defeat the odds this game day by working hard to meet your health goals!",
    #             'winning_decisive': "The Gators are up, and you should be, too! Make sure you are up and moving to meet your health goals today.",
    #             'winning_close': "Don't let your guard down just yet! Keep working to meet your health goals for today's game!",
    #             'tied': "Florida is tied!",
    #             'losing_close': "The Gators won't back down, so why should you? Work hard to meet your health goals today!",
    #             'losing_decisive': "The game isn't lost yet, and neither are your goals! Try to make healthy choices the rest of the game!",
    #             'won_decisive': "When the Gators win, you win! Make this win count by meeting your health goals, too!",
    #             'won_close': "Match the Gator's energy by keeping up with your health goals for today!",
    #             'lost_close': "Don't let a loss get you down! Keep an eye on your health journey, instead!",
    #             'lost_decisive': "Just because the Gators lost doesn't mean you have to! Make healthy choices after the game!"
    #         }[game_status]
    #         send_push_notification_next_game(push_token, message)
    # def check_game_status(self):
    #     scoreboard = self.apiInstance.get_scoreboard()
    #     curr_team = 'Ohio'
    #     curr_game = next((game for game in scoreboard if game.home_team == curr_team or game.away_team == curr_team), None)
    #     if not curr_game:
    #         return "No game found"
    #     florida_score = curr_game.home_points if curr_game.home_team == curr_team  else curr_game.away_points
    #     opponent_score = curr_game.away_points if curr_game.home_team == curr_team  else curr_game.home_points
    #     score_diff = florida_score - opponent_score
    #     if score_diff > 14:
    #         return 'winning_decisive'
    #     elif 1 <= score_diff <= 14:
    #         return 'winning_close'
    #     elif score_diff == 0:
    #         return 'tied'
    #     elif -14 < score_diff <= -1:
    #         return 'losing_close'
    #     else:
    #         return 'losing_decisive'
