from django.test import TestCase
from unittest.mock import patch, MagicMock
import cfbd

class UtilsTestCase(TestCase):
    @patch('app.utils.send_notification')
    @patch('app.utils.redis_client')
    @patch.object(cfbd.GamesApi, 'get_scoreboard')
    @patch.object(cfbd.ApiClient, 'get_default', return_value=MagicMock())
    def test_all_game_scenarios(self, mock_get_default, mock_get_scoreboard, mock_redis_client, mock_send_notification):
        # Test a scheduled game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                      away_team=MagicMock(name='Opponent', points=0), status='scheduled')
        ]
        mock_redis_client.get.return_value = None
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'Game not started')
        mock_send_notification.assert_called_with('Game not started')
        
        # Test a losing decisive game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                      away_team=MagicMock(name='Opponent', points=7), status='in_progress')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'losing_decisive')
        mock_send_notification.assert_called_with('losing_decisive')

        # Test another losing decisive game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=3),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'losing_decisive')
        mock_send_notification.assert_called_with('losing_decisive')

        # Test a losing close game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=10),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'losing_close')
        mock_send_notification.assert_called_with('losing_close')

        # Test a winning close game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=17),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'winning_close')
        mock_send_notification.assert_called_with('winning_close')

        # Test a winning decisive game
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=24),
                      away_team=MagicMock(name='Opponent', points=14), status='in_progress')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'winning_decisive')
        mock_send_notification.assert_called_with('winning_decisive')

        # Test a won decisive game (final score)
        mock_get_scoreboard.return_value = [
            MagicMock(home_team=MagicMock(name='Florida Gators', points=27),
                      away_team=MagicMock(name='Opponent', points=14), status='completed')
        ]
        game_status = self.call_check_game_status()
        self.assertEqual(game_status, 'won_decisive')
        mock_send_notification.assert_called_with('won_decisive')

    def call_check_game_status(self):
        """Helper function to call check_game_status and reset mocks."""
        with patch('app.utils.check_game_status') as mock_check_game_status:
            # Your tests rely on this mock's return value
            mock_check_game_status.return_value = self.determine_expected_status()
            game_status = mock_check_game_status(MagicMock())
            # Assertions are performed in the main test method
            return game_status
    
    def determine_expected_status(self):
        # A simple helper to map the scoreboard data to a status for the mock
        scoreboard = MagicMock(home_team=MagicMock(name='Florida Gators', points=0),
                               away_team=MagicMock(name='Opponent', points=0), status='scheduled')
        if scoreboard.status == 'scheduled':
            return 'Game not started'
        gators_points = scoreboard.home_team.points
        opponent_points = scoreboard.away_team.points
        diff = gators_points - opponent_points
        if scoreboard.status == 'completed':
            if diff > 10:
                return 'won_decisive'
            elif diff > 0:
                return 'won_close'
            elif diff < -10:
                return 'lost_decisive'
            elif diff < 0:
                return 'lost_close'
            elif diff == 0:
                return 'tied'
        elif scoreboard.status == 'in_progress':
            if diff > 10:
                return 'winning_decisive'
            elif diff > 0:
                return 'winning_close'
            elif diff < -10:
                return 'losing_decisive'
            elif diff < 0:
                return 'losing_close'
            elif diff == 0:
                return 'tied'
        return 'Game not started'